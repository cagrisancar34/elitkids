"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAuthContext } from "@/lib/auth";
import { createSessionSchema } from "@/lib/schemas/app-forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionActionState = {
  error: string | null;
  success: string | null;
};

export async function createSessionAction(
  _previousState: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "manager" && auth.role !== "admin")) {
    return {
      error: "Bu islem icin yetkin yok.",
      success: null,
    };
  }

  const parsed = createSessionSchema.safeParse({
    title: formData.get("title"),
    programId: formData.get("programId"),
    coachId: formData.get("coachId"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    location: formData.get("location"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Seans formu gecersiz.",
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

  const { error } = await supabase.from("sessions").insert({
    program_id: parsed.data.programId,
    coach_profile_id: parsed.data.coachId,
    title: parsed.data.title,
    starts_at: new Date(parsed.data.startsAt).toISOString(),
    ends_at: new Date(parsed.data.endsAt).toISOString(),
    location: parsed.data.location,
  });

  if (error) {
    return {
      error: error.message,
      success: null,
    };
  }

  revalidatePath("/manager");
  revalidatePath("/manager/sessions");
  revalidatePath("/coach");
  revalidatePath("/coach/sessions");

  return {
    error: null,
    success: "Seans olusturuldu.",
  };
}
