"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAuthContext } from "@/lib/auth";
import { createProgramSchema } from "@/lib/schemas/app-forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProgramActionState = {
  error: string | null;
  success: string | null;
};

export async function createProgramAction(
  _previousState: ProgramActionState,
  formData: FormData,
): Promise<ProgramActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "manager" && auth.role !== "admin") || !auth.userId) {
    return {
      error: "Bu islem icin yetkin yok.",
      success: null,
    };
  }

  const parsed = createProgramSchema.safeParse({
    title: formData.get("title"),
    ageBand: formData.get("ageBand"),
    capacity: formData.get("capacity"),
    monthlyPrice: formData.get("monthlyPrice"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Program formu gecersiz.",
      success: null,
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      error: "Supabase baglantisi kurulamadi.",
      success: null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", auth.userId)
    .maybeSingle();

  if (profileError || !profile?.organization_id) {
    return {
      error: "Kurum baglami cozulmedi.",
      success: null,
    };
  }

  const { error: programError } = await supabase.from("programs").insert({
    organization_id: profile.organization_id,
    title: parsed.data.title,
    age_band: parsed.data.ageBand,
    capacity: parsed.data.capacity,
    monthly_price: parsed.data.monthlyPrice,
  });

  if (programError) {
    return {
      error: programError.message,
      success: null,
    };
  }

  const { error: feePlanError } = await supabase.from("fee_plans").insert({
    organization_id: profile.organization_id,
    title: `${parsed.data.title} Aylik`,
    amount: parsed.data.monthlyPrice,
    cadence: "monthly",
  });

  if (feePlanError) {
    return {
      error: feePlanError.message,
      success: null,
    };
  }

  revalidatePath("/manager");
  revalidatePath("/manager/programs");
  revalidatePath("/manager/sessions");
  revalidatePath("/manager/students");

  return {
    error: null,
    success: `${parsed.data.title} programi olusturuldu.`,
  };
}
