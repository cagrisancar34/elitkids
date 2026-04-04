"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAuthContext } from "@/lib/auth";
import { createSupportThreadSchema } from "@/lib/schemas/app-forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SupportActionState = {
  error: string | null;
  success: string | null;
};

export async function createSupportThreadAction(
  _previousState: SupportActionState,
  formData: FormData,
): Promise<SupportActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "parent" || !auth.userId) {
    return {
      error: "Bu islem yalnizca veli hesabi ile yapilabilir.",
      success: null,
    };
  }

  const parsed = createSupportThreadSchema.safeParse({
    subject: formData.get("subject"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Talep bilgileri gecersiz.",
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

  const { data: thread, error: threadError } = await supabase
    .from("support_threads")
    .insert({
      parent_profile_id: auth.userId,
      subject: parsed.data.subject,
      status: "open",
    })
    .select("id")
    .single();

  if (threadError || !thread?.id) {
    return {
      error: threadError?.message ?? "Talep baslatilamadi.",
      success: null,
    };
  }

  const { error: messageError } = await supabase.from("support_messages").insert({
    thread_id: thread.id,
    author_profile_id: auth.userId,
    body: parsed.data.body,
  });

  if (messageError) {
    return {
      error: messageError.message,
      success: null,
    };
  }

  revalidatePath("/parent/support");

  return {
    error: null,
    success: "Destek talebin olusturuldu.",
  };
}
