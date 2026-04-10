"use server";

import { revalidatePath } from "next/cache";

import { getActorOrganizationId, logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import { cycleContainsSessionDate, resolveAttendanceStatus } from "@/lib/program-workspace";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type AttendanceActionState = {
  error: string | null;
  success: string | null;
};

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

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      error: "Supabase baglantisi kurulamadi.",
      success: null,
    };
  }

  const statusEntries = Array.from(formData.entries()).filter(([key]) => key.startsWith("status:"));

  const { data: session } = await supabase
    .from("sessions")
    .select("id, starts_at, program_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session?.id) {
    return {
      error: "Seans bulunamadi.",
      success: null,
    };
  }

  for (const [key, value] of statusEntries) {
    const studentId = key.replace("status:", "");
    const status = typeof value === "string" ? resolveAttendanceStatus(value) : null;
    const note = formData.get(`note:${studentId}`);
    const safeNote = typeof note === "string" ? note.trim() : "";

    if (!studentId || !status) {
      continue;
    }

    const { data: existing } = await supabase
      .from("attendance_records")
      .select("id, status")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (existing?.id) {
      await supabase
        .from("attendance_records")
        .update({ status, note: safeNote || null })
        .eq("id", existing.id);
    } else {
      await supabase.from("attendance_records").insert({
        session_id: sessionId,
        student_id: studentId,
        status,
        note: safeNote || null,
      });
    }

    const { data: cycles } = await supabase
      .from("student_package_cycles")
      .select("id, cycle_start, cycle_end, used_lessons")
      .eq("student_id", studentId)
      .eq("program_id", session.program_id)
      .eq("status", "active")
      .order("cycle_start", { ascending: false });

    const matchingCycle = (cycles ?? []).find((cycle) =>
      cycleContainsSessionDate(cycle.cycle_start, cycle.cycle_end, session.starts_at.slice(0, 10)),
    );

    if (matchingCycle) {
      const nextUsedLessons =
        existing?.status === "present" && status !== "present"
          ? Math.max(Number(matchingCycle.used_lessons ?? 0) - 1, 0)
          : existing?.status !== "present" && status === "present"
            ? Number(matchingCycle.used_lessons ?? 0) + 1
            : Number(matchingCycle.used_lessons ?? 0);

      if (nextUsedLessons !== Number(matchingCycle.used_lessons ?? 0)) {
        await supabase
          .from("student_package_cycles")
          .update({ used_lessons: nextUsedLessons })
          .eq("id", matchingCycle.id);
      }
    }
  }

  revalidatePath("/coach");
  revalidatePath("/coach/sessions");
  revalidatePath("/manager/attendance");
  revalidatePath("/manager/students");
  revalidatePath("/parent");
  revalidatePath("/parent/schedule");

  const organizationId = await getActorOrganizationId(auth.userId);
  await logAuditEvent({
    organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Yoklama guncellendi",
    scope: "Yoklama",
    entityType: "attendance_records",
    payload: {
      sessionId,
      updatedStudents: statusEntries.length,
    },
  });

  return {
    error: null,
    success: "Yoklama kaydedildi.",
  };
}
