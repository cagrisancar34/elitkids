"use server";

import { revalidatePath } from "next/cache";

import { getActorOrganizationId, logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import { formatTry } from "@/lib/finance";
import { createRoleScopedTopicNotifications } from "@/lib/message-topics-server";
import { resolveChargeAnchorDate, resolvePaymentLifecycleStatus } from "@/lib/payment-status";
import {
  createManualPaymentSchema,
  sendBulkPaymentReminderSchema,
  sendPaymentReminderSchema,
} from "@/lib/schemas/app-forms";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { queuePaymentReminderDispatch } from "@/lib/whatsapp-server";

export type FinanceActionState = {
  error: string | null;
  success: string | null;
};

function resolveChargeLifecycle(input: {
  amount: number | string | null | undefined;
  payments?: Array<{ amount?: number | string | null }> | null;
  enrollmentStartsOn?: string | null;
  chargeCreatedAt?: string | null;
  dueDate?: string | null;
}) {
  const totalPaid = Array.isArray(input.payments)
    ? input.payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0)
    : 0;

  return resolvePaymentLifecycleStatus({
    amount: input.amount,
    totalPaid,
    anchorDate: resolveChargeAnchorDate({
      enrollmentStartsOn: input.enrollmentStartsOn,
      chargeCreatedAt: input.chargeCreatedAt,
      dueDate: input.dueDate,
    }),
  });
}

export async function createManualPaymentAction(
  _previousState: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "manager" && auth.role !== "admin")) {
    return { error: "Bu islem icin yetkin yok.", success: null };
  }

  const parsed = createManualPaymentSchema.safeParse({
    chargeId: formData.get("chargeId"),
    amount: formData.get("amount"),
    paymentMethod: formData.get("paymentMethod"),
    paymentDate: formData.get("paymentDate"),
    referenceNo: formData.get("referenceNo"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Odeme formu gecersiz.",
      success: null,
    };
  }

  const supabase = await createSupabaseServerClient();
  const adminClient = createSupabaseAdminClient();

  if (!supabase || !adminClient) {
    return { error: "Supabase baglantisi kurulamadi.", success: null };
  }

  const { data: charge, error: chargeError } = await adminClient
    .from("charges")
    .select("id, amount, enrollment_id, due_date, created_at, payments(amount), enrollments(student_id, starts_on, students(full_name))")
    .eq("id", parsed.data.chargeId)
    .maybeSingle();

  if (chargeError || !charge) {
    return { error: "Tahakkuk bulunamadi.", success: null };
  }

  const totalPaidBefore = Array.isArray(charge.payments)
    ? charge.payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0)
    : 0;
  const chargeAmount = Number(charge.amount ?? 0);
  const remainingBefore = Math.max(chargeAmount - totalPaidBefore, 0);

  if (parsed.data.amount > remainingBefore) {
    return {
      error: `Girilen tutar kalan bakiyeyi asiyor. En fazla ${formatTry(remainingBefore)} tahsil edebilirsiniz.`,
      success: null,
    };
  }

  const { error: paymentError } = await adminClient.from("payments").insert({
    charge_id: parsed.data.chargeId,
    amount: parsed.data.amount,
    payment_method: parsed.data.paymentMethod,
    paid_at: new Date(parsed.data.paymentDate).toISOString(),
    reference_no: parsed.data.referenceNo || null,
    note: parsed.data.note || "",
  });

  if (paymentError) {
    return { error: paymentError.message, success: null };
  }

  const { data: payments } = await adminClient
    .from("payments")
    .select("amount")
    .eq("charge_id", parsed.data.chargeId);

  const totalPaid = (payments ?? []).reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const status = totalPaid >= chargeAmount ? "paid" : "pending";

  await adminClient
    .from("charges")
    .update({ status })
    .eq("id", parsed.data.chargeId);

  const { data: enrollment } = await adminClient
    .from("enrollments")
    .select("student_id")
    .eq("id", charge.enrollment_id)
    .maybeSingle();

  if (enrollment?.student_id) {
    const { data: links } = await adminClient
      .from("parent_student_links")
      .select("parent_profile_id")
      .eq("student_id", enrollment.student_id);

    const targetParentIds = Array.from(new Set((links ?? []).map((item) => item.parent_profile_id)));

    if (targetParentIds.length) {
      await adminClient.from("notifications").insert(
        targetParentIds.map((profileId) => ({
          profile_id: profileId,
          title: "Yeni odeme kaydi eklendi",
          body:
            status === "paid"
              ? "Aylik tahakkuk odemesi tamamen kapandi."
              : `Yeni odeme kaydi eklendi. Kalan bakiye ${formatTry(Math.max(chargeAmount - totalPaid, 0))}.`,
          channel: "in_app",
        })),
      );
    }
  }

  revalidatePath("/manager");
  revalidatePath("/manager/debts");
  revalidatePath("/manager/payments");
  revalidatePath("/manager/fees");
  revalidatePath("/manager/finance");
  revalidatePath("/manager/students");
  revalidatePath("/parent");
  revalidatePath("/parent/payments");

  const organizationId = await getActorOrganizationId(auth.userId);
  await logAuditEvent({
    organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Manuel odeme girildi",
    scope: "Finans",
    entityType: "payments",
    entityId: parsed.data.chargeId,
    payload: {
      chargeId: parsed.data.chargeId,
      amount: parsed.data.amount,
      paymentMethod: parsed.data.paymentMethod,
      paymentDate: parsed.data.paymentDate,
      status,
    },
  });

  return {
    error: null,
    success: "Odeme kaydi basariyla olusturuldu.",
  };
}

export async function sendPaymentReminderAction(
  _previousState: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "manager" && auth.role !== "admin") || !auth.userId) {
    return { error: "Bu islem icin yetkin yok.", success: null };
  }

  const parsed = sendPaymentReminderSchema.safeParse({
    chargeId: formData.get("chargeId"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Hatirlatma formu gecersiz.",
      success: null,
    };
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return { error: "Supabase baglantisi kurulamadi.", success: null };
  }

  const { data: charge } = await adminClient
    .from("charges")
    .select("id, amount, due_date, status, created_at, payments(amount), enrollments(student_id, starts_on, students(full_name))")
    .eq("id", parsed.data.chargeId)
    .maybeSingle();

  const enrollment = Array.isArray(charge?.enrollments)
    ? charge?.enrollments[0]
    : charge?.enrollments;
  const studentId = enrollment?.student_id ?? null;
  const studentRecord = enrollment?.students as { full_name?: string } | null | undefined;
  const studentName = studentRecord?.full_name ?? "Sporcu";

  if (!charge?.id || !studentId) {
    return { error: "Tahakkuk kaydi bulunamadi.", success: null };
  }

  const paymentStatus = resolveChargeLifecycle({
    amount: charge.amount,
    payments: charge.payments,
    enrollmentStartsOn: enrollment?.starts_on ?? null,
    chargeCreatedAt: charge.created_at,
    dueDate: charge.due_date,
  });

  if (paymentStatus === "completed") {
    return { error: "Bu tahakkuk zaten odeme tamamlandi durumunda.", success: null };
  }

  const organizationId = await getActorOrganizationId(auth.userId);
  if (!organizationId) {
    return { error: "Kurum baglami cozulmedi.", success: null };
  }

  try {
    await queuePaymentReminderDispatch({
      organizationId,
      studentId,
      studentName,
      amount: `₺${Number(charge.amount ?? 0).toLocaleString("tr-TR")}`,
      dueDate: charge.due_date ?? "",
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "WhatsApp hatirlatmasi olusturulamadi.",
      success: null,
    };
  }

  await logAuditEvent({
    organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Odeme hatirlatma mesaji gonderildi",
    scope: "Finans",
    entityType: "charges",
    entityId: charge.id,
    payload: {
      studentId,
      amount: charge.amount,
      dueDate: charge.due_date,
    },
  });

  revalidatePath("/manager/finance");
  revalidatePath("/admin/settings");

  await createRoleScopedTopicNotifications({
    organizationId,
    topicKey: "panel_notice_payment_risk",
    channelKey: `message_topic:panel_notice_payment_risk:charge:${charge.id}`,
    variables: {
      student_name: studentName,
      amount: `₺${Number(charge.amount ?? 0).toLocaleString("tr-TR")}`,
      due_date: charge.due_date ?? "",
    },
  });

  return {
    error: null,
    success: "Secili tahakkuk icin WhatsApp hatirlatmasi kuyruga alindi.",
  };
}

export async function sendBulkPaymentReminderAction(
  _previousState: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "manager" && auth.role !== "admin") || !auth.userId) {
    return { error: "Bu islem icin yetkin yok.", success: null };
  }

  const parsed = sendBulkPaymentReminderSchema.safeParse({
    scope: formData.get("scope"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Toplu hatirlatma formu gecersiz.",
      success: null,
    };
  }

  const adminClient = createSupabaseAdminClient();
  const organizationId = await getActorOrganizationId(auth.userId);

  if (!adminClient || !organizationId) {
    return { error: "Kurum baglami cozulmedi.", success: null };
  }

  const { data: charges } = await adminClient
    .from("charges")
    .select("id, amount, due_date, created_at, payments(amount), enrollments(student_id, starts_on, students(full_name))")
    .limit(25);

  const overdueCharges = (charges ?? []).filter((charge) => {
    const enrollment = Array.isArray(charge.enrollments) ? charge.enrollments[0] : charge.enrollments;

    return (
      resolveChargeLifecycle({
        amount: charge.amount,
        payments: charge.payments,
        enrollmentStartsOn: enrollment?.starts_on ?? null,
        chargeCreatedAt: charge.created_at,
        dueDate: charge.due_date,
      }) === "overdue"
    );
  });

  if (!overdueCharges.length) {
    return {
      error: null,
      success: "Toplu hatirlatma icin uygun gecikmis tahakkuk bulunamadi.",
    };
  }

  for (const charge of overdueCharges) {
    const enrollment = Array.isArray(charge.enrollments) ? charge.enrollments[0] : charge.enrollments;
    const studentId = enrollment?.student_id ?? null;
    const studentRecord = enrollment?.students as { full_name?: string } | null | undefined;
    const studentName = studentRecord?.full_name ?? "Sporcu";
    const dueDateValue = charge.due_date ?? "";

    if (!studentId) {
      continue;
    }

    await queuePaymentReminderDispatch({
      organizationId,
      studentId,
      studentName,
      amount: `₺${Number(charge.amount ?? 0).toLocaleString("tr-TR")}`,
      dueDate: dueDateValue,
    });

    await createRoleScopedTopicNotifications({
      organizationId,
      topicKey: "panel_notice_payment_risk",
      channelKey: `message_topic:panel_notice_payment_risk:charge:${charge.id}`,
      variables: {
        student_name: studentName,
        amount: `₺${Number(charge.amount ?? 0).toLocaleString("tr-TR")}`,
        due_date: dueDateValue,
      },
    });
  }

  await logAuditEvent({
    organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Toplu odeme hatirlatmasi baslatildi",
    scope: "Finans",
      entityType: "message_dispatches",
      payload: {
      count: overdueCharges.length,
      scope: parsed.data.scope,
    },
  });

  revalidatePath("/manager/finance");
  revalidatePath("/admin/settings");

  return {
    error: null,
    success: `${overdueCharges.length} gecikmis kayit icin WhatsApp hatirlatmasi kuyruga alindi.`,
  };
}
