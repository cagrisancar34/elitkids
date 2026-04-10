"use server";

import { revalidatePath } from "next/cache";

import { getActorOrganizationId, logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
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
    .select("id, amount, enrollment_id")
    .eq("id", parsed.data.chargeId)
    .maybeSingle();

  if (chargeError || !charge) {
    return { error: "Tahakkuk bulunamadi.", success: null };
  }

  const { error: paymentError } = await adminClient.from("payments").insert({
    charge_id: parsed.data.chargeId,
    amount: parsed.data.amount,
    payment_method: "manual",
  });

  if (paymentError) {
    return { error: paymentError.message, success: null };
  }

  const { data: payments } = await adminClient
    .from("payments")
    .select("amount")
    .eq("charge_id", parsed.data.chargeId);

  const totalPaid = (payments ?? []).reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const status = totalPaid >= Number(charge.amount ?? 0) ? "paid" : "pending";

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
              ? "Tahakkuk odemesi tamamen kapandi."
              : "Yeni odeme kaydi eklendi, kalan bakiye guncellendi.",
          channel: "in_app",
        })),
      );
    }
  }

  revalidatePath("/manager");
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
      status,
    },
  });

  return {
    error: null,
    success: "Manuel odeme kaydi olusturuldu.",
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
    .select("id, amount, due_date, status, enrollments(student_id, students(full_name))")
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

  const today = new Date().toISOString().slice(0, 10);
  const { data: charges } = await adminClient
    .from("charges")
    .select("id, amount, due_date, enrollments(student_id, students(full_name))")
    .neq("status", "paid")
    .lte("due_date", today)
    .limit(25);

  if (!charges?.length) {
    return {
      error: null,
      success: "Toplu hatirlatma icin uygun gecikmis tahakkuk bulunamadi.",
    };
  }

  for (const charge of charges) {
    const enrollment = Array.isArray(charge.enrollments) ? charge.enrollments[0] : charge.enrollments;
    const studentId = enrollment?.student_id ?? null;
    const studentRecord = enrollment?.students as { full_name?: string } | null | undefined;
    const studentName = studentRecord?.full_name ?? "Sporcu";

    if (!studentId) {
      continue;
    }

    await queuePaymentReminderDispatch({
      organizationId,
      studentId,
      studentName,
      amount: `₺${Number(charge.amount ?? 0).toLocaleString("tr-TR")}`,
      dueDate: charge.due_date ?? today,
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
      count: charges.length,
      scope: parsed.data.scope,
    },
  });

  revalidatePath("/manager/finance");
  revalidatePath("/admin/settings");

  return {
    error: null,
    success: `${charges.length} gecikmis kayit icin WhatsApp hatirlatmasi kuyruga alindi.`,
  };
}
