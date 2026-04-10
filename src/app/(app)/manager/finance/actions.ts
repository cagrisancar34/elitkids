"use server";

import { revalidatePath } from "next/cache";

import { getActorOrganizationId, logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import { createManualPaymentSchema } from "@/lib/schemas/app-forms";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

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
