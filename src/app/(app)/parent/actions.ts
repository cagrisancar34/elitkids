"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAuthContext } from "@/lib/auth";
import {
  markAllNotificationsReadSchema,
  toggleNotificationReadSchema,
} from "@/lib/schemas/app-forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ParentNotificationActionState = {
  error: string | null;
  success: string | null;
};

export async function toggleParentNotificationReadAction(
  _previousState: ParentNotificationActionState,
  formData: FormData,
): Promise<ParentNotificationActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "parent" || !auth.userId) {
    return {
      error: "Bu islem icin veli oturumu gerekli.",
      success: null,
    };
  }

  const parsed = toggleNotificationReadSchema.safeParse({
    notificationId: formData.get("notificationId"),
    nextState: formData.get("nextState"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Bildirim formu gecersiz.",
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

  const { error } = await supabase
    .from("notifications")
    .update({
      read_at: parsed.data.nextState === "read" ? new Date().toISOString() : null,
    })
    .eq("id", parsed.data.notificationId)
    .eq("profile_id", auth.userId);

  if (error) {
    return {
      error: error.message,
      success: null,
    };
  }

  revalidatePath("/parent");

  return {
    error: null,
    success:
      parsed.data.nextState === "read"
        ? "Bildirim okundu olarak isaretlendi."
        : "Bildirim tekrar okunmamis olarak isaretlendi.",
  };
}

export async function markAllParentNotificationsReadAction(
  _previousState: ParentNotificationActionState,
  formData: FormData,
): Promise<ParentNotificationActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "parent" || !auth.userId) {
    return {
      error: "Bu islem icin veli oturumu gerekli.",
      success: null,
    };
  }

  const parsed = markAllNotificationsReadSchema.safeParse({
    scope: formData.get("scope"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Toplu bildirim formu gecersiz.",
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

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("profile_id", auth.userId)
    .is("read_at", null);

  if (error) {
    return {
      error: error.message,
      success: null,
    };
  }

  revalidatePath("/parent");

  return {
    error: null,
    success: "Tum bildirimler okundu olarak isaretlendi.",
  };
}
