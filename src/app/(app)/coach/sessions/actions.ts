"use server";

import { revalidatePath } from "next/cache";

import { getActorOrganizationId, logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import { resolveAttendanceStatus } from "@/lib/program-workspace";
import { sendAttendanceWhatsAppSchema } from "@/lib/schemas/app-forms";
import { markSessionAllocationConsumed } from "@/lib/session-allocations";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { queueAttendanceAbsentDispatch } from "@/lib/whatsapp-server";

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
    .select("id, starts_at, program_id, session_series_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session?.id) {
    return {
      error: "Seans bulunamadi.",
      success: null,
    };
  }

  const organizationId = (await getActorOrganizationId(auth.userId)) ?? "";

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

    let enrollmentQuery = supabase
      .from("enrollments")
      .select("id, starts_on, ends_on")
      .eq("student_id", studentId)
      .eq("program_id", session.program_id)
      .eq("status", "active")
      .lte("starts_on", session.starts_at.slice(0, 10))
      .order("starts_on", { ascending: false })
      .limit(10);

    if (session.session_series_id) {
      enrollmentQuery = enrollmentQuery.eq("session_series_id", session.session_series_id);
    }

    const { data: enrollments } = await enrollmentQuery;
    const matchingEnrollment = (enrollments ?? []).find(
      (enrollment) =>
        !enrollment.ends_on || enrollment.ends_on >= session.starts_at.slice(0, 10),
    );

    if (!matchingEnrollment?.id) {
      continue;
    }

    const { data: student } = await supabase
      .from("students")
      .select("full_name")
      .eq("id", studentId)
      .maybeSingle();

    await markSessionAllocationConsumed(supabase, {
      organizationId,
      enrollmentId: matchingEnrollment.id,
      studentId,
      studentName: student?.full_name ?? "Ogrenci",
      programId: session.program_id,
      startsOn: matchingEnrollment.starts_on ?? session.starts_at.slice(0, 10),
      sessionId,
    });
  }

  revalidatePath("/coach");
  revalidatePath("/coach/sessions");
  revalidatePath("/manager/attendance");
  revalidatePath("/manager/students");
  revalidatePath("/parent");
  revalidatePath("/parent/schedule");

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

export async function sendAttendanceWhatsAppAction(
  _previousState: AttendanceActionState,
  formData: FormData,
): Promise<AttendanceActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "coach" && auth.role !== "manager" && auth.role !== "admin") || !auth.userId) {
    return {
      error: "Bu islem icin yetkin yok.",
      success: null,
    };
  }

  const parsed = sendAttendanceWhatsAppSchema.safeParse({
    sessionId: formData.get("sessionId"),
    studentId: formData.get("studentId"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Devamsizlik bildirimi formu gecersiz.",
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

  const { data: attendance } = await supabase
    .from("attendance_records")
    .select("status")
    .eq("session_id", parsed.data.sessionId)
    .eq("student_id", parsed.data.studentId)
    .maybeSingle();

  if (attendance?.status !== "absent") {
    return {
      error: "Veliye WhatsApp gondermek icin once yoklamayi gelmedi olarak kaydet.",
      success: null,
    };
  }

  const { data: session } = await supabase
    .from("sessions")
    .select("id, title, starts_at")
    .eq("id", parsed.data.sessionId)
    .maybeSingle();

  const { data: student } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("id", parsed.data.studentId)
    .maybeSingle();

  const organizationId = await getActorOrganizationId(auth.userId);

  if (!session?.id || !student?.id || !organizationId) {
    return {
      error: "Seans veya ogrenci bilgisi bulunamadi.",
      success: null,
    };
  }

  try {
    await queueAttendanceAbsentDispatch({
      organizationId,
      sessionId: session.id,
      sessionTitle: session.title,
      sessionDate: session.starts_at,
      studentId: student.id,
      studentName: student.full_name,
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Devamsizlik dispatch'i olusturulamadi.",
      success: null,
    };
  }

  await logAuditEvent({
    organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Devamsizlik bildirimi gonderildi",
    scope: "Yoklama",
    entityType: "attendance_records",
    entityId: parsed.data.studentId,
    payload: {
      sessionId: parsed.data.sessionId,
      studentId: parsed.data.studentId,
    },
  });

  revalidatePath("/coach/sessions");
  revalidatePath("/manager/attendance");
  revalidatePath("/admin/settings");

  return {
    error: null,
    success: "Devamsizlik bildirimi veliye WhatsApp kuyruguna alindi.",
  };
}
