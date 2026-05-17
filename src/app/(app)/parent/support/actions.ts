"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAuthContext } from "@/lib/auth";
import { createSupportThreadSchema } from "@/lib/schemas/app-forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SupportActionState = {
  error: string | null;
  success: string | null;
};

async function resolveParentSupportContext() {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "parent" || !auth.userId) {
    return {
      auth: null,
      supabase: null,
      error: "Bu islem yalnizca veli hesabi ile yapilabilir.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      auth: null,
      supabase: null,
      error: "Supabase baglantisi kurulamadi.",
    };
  }

  return {
    auth,
    supabase,
    error: null,
  };
}

export async function createSupportThreadAction(
  _previousState: SupportActionState,
  formData: FormData,
): Promise<SupportActionState> {
  const context = await resolveParentSupportContext();

  if (context.error || !context.auth || !context.supabase) {
    return { error: context.error ?? "Baglam kurulamadı.", success: null };
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

  const { data: thread, error: threadError } = await context.supabase
    .from("support_threads")
    .insert({
      parent_profile_id: context.auth.userId,
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

  const { error: messageError } = await context.supabase.from("support_messages").insert({
    thread_id: thread.id,
    author_profile_id: context.auth.userId,
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

export async function replySupportThreadAction(
  _previousState: SupportActionState,
  formData: FormData,
): Promise<SupportActionState> {
  const context = await resolveParentSupportContext();

  if (context.error || !context.auth || !context.supabase) {
    return { error: context.error ?? "Baglam kurulamadı.", success: null };
  }

  const threadId = formData.get("threadId");
  const body = formData.get("body");

  if (typeof threadId !== "string" || !threadId) {
    return {
      error: "Gecerli bir talep secilmeli.",
      success: null,
    };
  }

  const parsed = createSupportThreadSchema.pick({ body: true }).safeParse({
    body,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Yanıt gecersiz.",
      success: null,
    };
  }

  const { data: thread, error: threadError } = await context.supabase
    .from("support_threads")
    .select("id, parent_profile_id")
    .eq("id", threadId)
    .eq("parent_profile_id", context.auth.userId)
    .maybeSingle();

  if (threadError || !thread?.id) {
    return {
      error: "Talep bulunamadi.",
      success: null,
    };
  }

  const { error: messageError } = await context.supabase.from("support_messages").insert({
    thread_id: thread.id,
    author_profile_id: context.auth.userId,
    body: parsed.data.body,
  });

  if (messageError) {
    return {
      error: messageError.message,
      success: null,
    };
  }

  await context.supabase
    .from("support_threads")
    .update({
      status: "open",
    })
    .eq("id", thread.id);

  revalidatePath("/parent/support");
  revalidatePath("/manager/communication");

  return {
    error: null,
    success: "Yanıt gonderildi.",
  };
}
