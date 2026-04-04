"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAuthContext } from "@/lib/auth";
import { createStudentSchema } from "@/lib/schemas/app-forms";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionState = {
  error: string | null;
  success: string | null;
};

export async function createStudentAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "manager" && auth.role !== "admin")) {
    return {
      error: "Bu islem icin yetkin yok.",
      success: null,
    };
  }

  const parsed = createStudentSchema.safeParse({
    fullName: formData.get("fullName"),
    birthDate: formData.get("birthDate"),
    programTitle: formData.get("programTitle"),
    parentEmail: formData.get("parentEmail"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Form bilgileri gecersiz.",
      success: null,
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase || !auth.userId) {
    return {
      error: "Supabase baglantisi kurulamadi.",
      success: null,
    };
  }

  const { data: currentProfile, error: profileError } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", auth.userId)
    .maybeSingle();

  if (profileError || !currentProfile?.organization_id) {
    return {
      error: "Kurum baglami cozulmedi.",
      success: null,
    };
  }

  const { data: program, error: programError } = await supabase
    .from("programs")
    .select("id, monthly_price")
    .eq("organization_id", currentProfile.organization_id)
    .eq("title", parsed.data.programTitle)
    .maybeSingle();

  if (programError || !program?.id) {
    return {
      error: "Secilen program bulunamadi.",
      success: null,
    };
  }

  const { data: feePlan } = await supabase
    .from("fee_plans")
    .select("id")
    .eq("organization_id", currentProfile.organization_id)
    .eq("amount", program.monthly_price)
    .limit(1)
    .maybeSingle();

  const { data: insertedStudent, error: studentError } = await supabase
    .from("students")
    .insert({
      organization_id: currentProfile.organization_id,
      full_name: parsed.data.fullName,
      birth_date: parsed.data.birthDate,
      active: true,
    })
    .select("id")
    .single();

  if (studentError || !insertedStudent?.id) {
    return {
      error: studentError?.message ?? "Ogrenci kaydi olusturulamadi.",
      success: null,
    };
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .insert({
      student_id: insertedStudent.id,
      program_id: program.id,
      status: "active",
      starts_on: new Date().toISOString().slice(0, 10),
    })
    .select("id")
    .single();

  if (enrollmentError || !enrollment?.id) {
    return {
      error: enrollmentError?.message ?? "Kayit programla eslestirilemedi.",
      success: null,
    };
  }

  const { error: chargeError } = await supabase.from("charges").insert({
    enrollment_id: enrollment.id,
    fee_plan_id: feePlan?.id ?? null,
    amount: program.monthly_price,
    due_date: "2026-04-12",
    status: "pending",
  });

  if (chargeError) {
    return {
      error: chargeError.message,
      success: null,
    };
  }

  const parentEmail = parsed.data.parentEmail.trim();

  if (parentEmail) {
    const adminClient = createSupabaseAdminClient();

    if (adminClient) {
      const { data: listedUsers } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      const parentUser = listedUsers.users.find(
        (user) => user.email?.toLowerCase() === parentEmail.toLowerCase(),
      );

      if (parentUser) {
        await supabase.from("parent_student_links").upsert(
          {
            parent_profile_id: parentUser.id,
            student_id: insertedStudent.id,
            relationship: "Veli",
          },
          { onConflict: "parent_profile_id,student_id" },
        );
      }
    }
  }

  revalidatePath("/manager");
  revalidatePath("/manager/students");
  revalidatePath("/manager/finance");

  return {
    error: null,
    success: `${parsed.data.fullName} kaydi olusturuldu.`,
  };
}
