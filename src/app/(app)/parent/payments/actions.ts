"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAuthContext } from "@/lib/auth";
import { createPaymentSupportSchema } from "@/lib/schemas/app-forms";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

export type ParentPaymentActionState = {
  error: string | null;
  success: string | null;
};

function getRelatedFullName(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0]?.full_name === "string" ? value[0].full_name : null;
  }

  if (value && typeof value === "object" && "full_name" in value) {
    return typeof value.full_name === "string" ? value.full_name : null;
  }

  return null;
}

function getRelatedTitle(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0]?.title === "string" ? value[0].title : null;
  }

  if (value && typeof value === "object" && "title" in value) {
    return typeof value.title === "string" ? value.title : null;
  }

  return null;
}

export async function createPaymentSupportAction(
  _previousState: ParentPaymentActionState,
  formData: FormData,
): Promise<ParentPaymentActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "parent" || !auth.userId) {
    return { error: "Bu islem yalnizca veli hesabi ile yapilabilir.", success: null };
  }

  const parsed = createPaymentSupportSchema.safeParse({
    chargeId: formData.get("chargeId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Form bilgileri gecersiz.",
      success: null,
    };
  }

  const supabase = await createSupabaseServerClient();
  const adminClient = createSupabaseAdminClient();

  if (!supabase || !adminClient) {
    return { error: "Supabase baglantisi kurulamadi.", success: null };
  }

  const { data: links } = await adminClient
    .from("parent_student_links")
    .select("student_id")
    .eq("parent_profile_id", auth.userId);
  const studentIds = (links ?? []).map((item) => item.student_id);

  const { data: enrollments } = await adminClient
    .from("enrollments")
    .select("id, student_id, students(full_name), programs(title)")
    .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]);

  const enrollmentIds = (enrollments ?? []).map((item) => item.id);
  const { data: charge } = await adminClient
    .from("charges")
    .select("id, amount, due_date, enrollment_id")
    .eq("id", parsed.data.chargeId)
    .in("enrollment_id", enrollmentIds.length ? enrollmentIds : ["00000000-0000-0000-0000-000000000000"])
    .maybeSingle();

  if (!charge) {
    return { error: "Bu tahakkuk veli hesabina ait degil.", success: null };
  }

  const enrollment = (enrollments ?? []).find((item) => item.id === charge.enrollment_id);
  const studentName = getRelatedFullName(enrollment?.students) ?? "Ogrenci";
  const programName = getRelatedTitle(enrollment?.programs) ?? "Program";

  const subject = `Odeme teyidi / ${studentName} / ${programName}`;

  const { data: thread, error: threadError } = await supabase
    .from("support_threads")
    .insert({
      parent_profile_id: auth.userId,
      subject,
      status: "open",
    })
    .select("id")
    .single();

  if (threadError || !thread?.id) {
    return { error: threadError?.message ?? "Talep olusturulamadi.", success: null };
  }

  const composedBody = `Tahakkuk ID: ${charge.id}\nTutar: ${charge.amount}\nSon tarih: ${charge.due_date ?? "belirtilmedi"}\n\n${parsed.data.body}`;

  const { error: messageError } = await supabase.from("support_messages").insert({
    thread_id: thread.id,
    author_profile_id: auth.userId,
    body: composedBody,
  });

  if (messageError) {
    return { error: messageError.message, success: null };
  }

  const { data: managerRoles } = await adminClient
    .from("user_roles")
    .select("profile_id")
    .eq("role", "manager");

  const managerIds = Array.from(new Set((managerRoles ?? []).map((item) => item.profile_id)));

  if (managerIds.length) {
    await adminClient.from("notifications").insert(
      managerIds.map((profileId) => ({
        profile_id: profileId,
        title: "Yeni odeme teyit talebi",
        body: `${studentName} icin veli odeme bildirimi gonderdi.`,
        channel: "in_app",
      })),
    );
  }

  revalidatePath("/parent/payments");
  revalidatePath("/parent/support");
  revalidatePath("/manager/announcements");

  return {
    error: null,
    success: "Odeme teyit talebin gonderildi.",
  };
}
