"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAuthContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AttendanceActionState = {
  error: string | null;
  success: string | null;
};

const validStatuses = new Set(["present", "absent", "late", "excused"]);

export async function saveAttendanceAction(
  _previousState: AttendanceActionState,
  formData: FormData,
): Promise<AttendanceActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "coach" && auth.role !== "manager" && auth.role !== "admin")) {
    return {
      error: "Bu islem icin yetkin yok.",
      success: null,
    };
  }

  const sessionId = formData.get("sessionId");

  if (typeof sessionId !== "string" || sessionId.length === 0) {
    return {
      error: "Seans bilgisi eksik.",
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

  const statusEntries = Array.from(formData.entries()).filter(([key]) =>
    key.startsWith("status:"),
  );

  for (const [key, value] of statusEntries) {
    const studentId = key.replace("status:", "");
    const status = typeof value === "string" ? value : "";

    if (!studentId || !validStatuses.has(status)) {
      continue;
    }

    const { data: existing } = await supabase
      .from("attendance_records")
      .select("id")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (existing?.id) {
      await supabase
        .from("attendance_records")
        .update({ status })
        .eq("id", existing.id);
    } else {
      await supabase.from("attendance_records").insert({
        session_id: sessionId,
        student_id: studentId,
        status,
      });
    }
  }

  revalidatePath("/coach");
  revalidatePath("/coach/sessions");
  revalidatePath("/parent");
  revalidatePath("/parent/schedule");

  return {
    error: null,
    success: "Yoklama kaydedildi.",
  };
}
