"use server";

import { revalidatePath } from "next/cache";

import { getActorOrganizationId, logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import { getOrCreateOrganizationContext } from "@/lib/organization-context";
import {
  createStudentSchema,
  deactivateStudentSchema,
  grantStudentLessonsSchema,
  rebuildStudentLessonsSchema,
  saveStudentDetailSchema,
  updateStudentSchema,
} from "@/lib/schemas/app-forms";
import {
  buildLegacyDetailPayload,
  buildReportSummary,
  defaultStudentDetailQuestions,
  parseQuestionOptions,
  getQuestionValueName,
} from "@/lib/student-reporting";
import { buildMonthlyLessonCycle } from "@/lib/program-workspace";
import {
  ensureEnrollmentSessionAllocations,
  grantBonusLessonAllocations,
  rebuildUpcomingEnrollmentAllocations,
  renewEnrollmentLessonPackage,
} from "@/lib/session-allocations";
import type { DetailAnswerRecord, DetailQuestionRecord } from "@/lib/types";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { queueReportCardUpdatedDispatch } from "@/lib/whatsapp-server";

export type ActionState = {
  error: string | null;
  success: string | null;
};

async function getStudentDetailQuestionsForOrganization(
  adminClient: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  organizationId: string,
) {
  const { data, error } = await adminClient
    .from("student_detail_questions")
    .select(
      "id, field_key, label, input_type, helper_text, placeholder, options, required, active, sort_order",
    )
    .eq("organization_id", organizationId)
    .order("sort_order");

  if (error || !data?.length) {
    return defaultStudentDetailQuestions;
  }

  return data.map((question) => ({
    id: question.id,
    fieldKey: question.field_key,
    label: question.label,
    inputType:
      question.input_type === "textarea" ||
      question.input_type === "number" ||
      question.input_type === "select"
        ? question.input_type
        : "text",
    helperText: question.helper_text ?? "",
    placeholder: question.placeholder ?? "",
    options: parseQuestionOptions(question.options),
    required: Boolean(question.required),
    active: question.active ?? true,
    sortOrder: Number(question.sort_order ?? 100),
    source: "database" as const,
  })) satisfies DetailQuestionRecord[];
}

async function canCoachWriteStudentDetail(
  adminClient: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  coachProfileId: string,
  studentId: string,
) {
  const { data: sessions } = await adminClient
    .from("sessions")
    .select("program_id, session_series_id")
    .eq("coach_profile_id", coachProfileId)
    .is("cancelled_at", null);

  const programIds = Array.from(new Set((sessions ?? []).map((session) => session.program_id)));
  const sessionSeriesIds = Array.from(
    new Set(
      (sessions ?? [])
        .map((session) => session.session_series_id)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  if (!programIds.length && !sessionSeriesIds.length) {
    return false;
  }

  let enrollmentQuery = adminClient
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .limit(20);

  if (sessionSeriesIds.length) {
    enrollmentQuery = enrollmentQuery.in("session_series_id", sessionSeriesIds);
  } else {
    enrollmentQuery = enrollmentQuery.in("program_id", programIds);
  }

  const { data: enrollments } = await enrollmentQuery;

  return Boolean(enrollments?.length);
}

async function getValidatedProgramSeries(
  adminClient: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  organizationId: string,
  programId: string,
  sessionSeriesId: string,
) {
  const [{ data: program, error: programError }, { data: sessionSeries, error: sessionSeriesError }] =
    await Promise.all([
      adminClient
        .from("programs")
        .select("id, title, monthly_price, monthly_lesson_quota")
        .eq("organization_id", organizationId)
        .eq("id", programId)
        .maybeSingle(),
      adminClient
        .from("session_series")
        .select("id, title, program_id, starts_on, ends_on, status")
        .eq("id", sessionSeriesId)
        .maybeSingle(),
    ]);

  if (programError || !program?.id) {
    return {
      error: "Secilen program bulunamadi.",
      program: null,
      sessionSeries: null,
    };
  }

  if (sessionSeriesError || !sessionSeries?.id) {
    return {
      error: "Secilen grup / seans serisi bulunamadi.",
      program: null,
      sessionSeries: null,
    };
  }

  if (sessionSeries.program_id !== program.id) {
    return {
      error: "Secilen grup, programla eslesmiyor.",
      program: null,
      sessionSeries: null,
    };
  }

  return {
    error: null,
    program,
    sessionSeries,
  };
}

function extractDetailEntries(
  formData: FormData,
  questions: DetailQuestionRecord[],
): { entries: DetailAnswerRecord[]; error: string | null } {
  const activeQuestions = questions.filter((question) => question.active);
  const entries: DetailAnswerRecord[] = [];

  for (const question of activeQuestions) {
    const rawValue = formData.get(getQuestionValueName(question.fieldKey));
    const value = typeof rawValue === "string" ? rawValue.trim() : "";

    if (question.required && !value) {
      return {
        entries: [],
        error: `${question.label} alani zorunlu.`,
      };
    }

    if (question.inputType === "number" && value) {
      const numericValue = Number(value);

      if (!Number.isFinite(numericValue) || numericValue < 1 || numericValue > 10) {
        return {
          entries: [],
          error: `${question.label} icin 1 ile 10 arasinda sayi girilmeli.`,
        };
      }
    }

    entries.push({
      questionId: question.id,
      fieldKey: question.fieldKey,
      label: question.label,
      inputType: question.inputType,
      value,
      sortOrder: question.sortOrder,
    });
  }

  return { entries, error: null };
}

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
    programId: formData.get("programId"),
    sessionSeriesId: formData.get("sessionSeriesId"),
    startsOn: formData.get("startsOn"),
    parentEmail: formData.get("parentEmail"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Form bilgileri gecersiz.",
      success: null,
    };
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient || !auth.userId) {
    return {
      error: "Supabase baglantisi kurulamadi.",
      success: null,
    };
  }

  const organizationContext = await getOrCreateOrganizationContext(auth.userId);

  if (organizationContext.error || !organizationContext.organizationId) {
    return {
      error: organizationContext.error ?? "Kurum baglami cozulmedi.",
      success: null,
    };
  }

  const validated = await getValidatedProgramSeries(
    adminClient,
    organizationContext.organizationId,
    parsed.data.programId,
    parsed.data.sessionSeriesId,
  );

  if (validated.error || !validated.program?.id || !validated.sessionSeries?.id) {
    return {
      error: validated.error ?? "Program ve grup bilgisi dogrulanamadi.",
      success: null,
    };
  }

  const program = validated.program;

  const { data: feePlan } = await adminClient
    .from("fee_plans")
    .select("id")
    .eq("organization_id", organizationContext.organizationId)
    .eq("amount", program.monthly_price)
    .limit(1)
    .maybeSingle();

  const { data: insertedStudent, error: studentError } = await adminClient
    .from("students")
    .insert({
      organization_id: organizationContext.organizationId,
      full_name: parsed.data.fullName,
      birth_date: parsed.data.birthDate,
      active: true,
      source: "manual",
    })
    .select("id")
    .single();

  if (studentError || !insertedStudent?.id) {
    return {
      error: studentError?.message ?? "Ogrenci kaydi olusturulamadi.",
      success: null,
    };
  }

  const startsOn = parsed.data.startsOn;

  const { data: enrollment, error: enrollmentError } = await adminClient
    .from("enrollments")
    .insert({
      student_id: insertedStudent.id,
      program_id: program.id,
      session_series_id: validated.sessionSeries.id,
      status: "active",
      starts_on: startsOn,
    })
    .select("id")
    .single();

  if (enrollmentError || !enrollment?.id) {
    return {
      error: enrollmentError?.message ?? "Kayit programla eslestirilemedi.",
      success: null,
    };
  }

  const { error: chargeError } = await adminClient.from("charges").insert({
    enrollment_id: enrollment.id,
    fee_plan_id: feePlan?.id ?? null,
    amount: program.monthly_price,
    due_date: startsOn,
    status: "pending",
  });

  if (chargeError) {
    return {
      error: chargeError.message,
      success: null,
    };
  }

  if ((program.monthly_lesson_quota ?? 0) > 0) {
    await adminClient.from("student_package_cycles").insert(
      buildMonthlyLessonCycle({
        organizationId: organizationContext.organizationId,
        studentId: insertedStudent.id,
        enrollmentId: enrollment.id,
        programId: program.id,
        startsOn,
        quota: Number(program.monthly_lesson_quota ?? 8),
      }),
    );

    await ensureEnrollmentSessionAllocations(adminClient, {
      organizationId: organizationContext.organizationId,
      enrollmentId: enrollment.id,
      studentId: insertedStudent.id,
      studentName: parsed.data.fullName,
      programId: program.id,
      sessionSeriesId: validated.sessionSeries.id,
      startsOn,
      lessonCount: Number(program.monthly_lesson_quota ?? 8),
    });
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
        await adminClient.from("parent_student_links").upsert(
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

  await logAuditEvent({
    organizationId: organizationContext.organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Yeni ogrenci olusturuldu",
    scope: "Ogrenciler",
    entityType: "students",
    entityId: insertedStudent.id,
    payload: {
      fullName: parsed.data.fullName,
      programTitle: program.title,
      parentEmail: parentEmail || null,
    },
  });

  return {
    error: null,
      success: `${parsed.data.fullName} kaydi olusturuldu.`,
  };
}

export async function updateStudentAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "manager" && auth.role !== "admin") || !auth.userId) {
    return {
      error: "Bu islem icin yetkin yok.",
      success: null,
    };
  }

  const parsed = updateStudentSchema.safeParse({
    studentId: formData.get("studentId"),
    fullName: formData.get("fullName"),
    birthDate: formData.get("birthDate"),
    programId: formData.get("programId"),
    sessionSeriesId: formData.get("sessionSeriesId"),
    gender: formData.get("gender"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Ogrenci formu gecersiz.",
      success: null,
    };
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return {
      error: "Supabase yonetici baglantisi kurulamadi.",
      success: null,
    };
  }

  const organizationContext = await getOrCreateOrganizationContext(auth.userId);
  if (organizationContext.error || !organizationContext.organizationId) {
    return {
      error: organizationContext.error ?? "Kurum baglami cozulmedi.",
      success: null,
    };
  }

  const { data: student, error: studentError } = await adminClient
    .from("students")
    .select("id")
    .eq("id", parsed.data.studentId)
    .eq("organization_id", organizationContext.organizationId)
    .maybeSingle();

  if (studentError || !student) {
    return {
      error: studentError?.message ?? "Ogrenci bulunamadi.",
      success: null,
    };
  }

  const validated = await getValidatedProgramSeries(
    adminClient,
    organizationContext.organizationId,
    parsed.data.programId,
    parsed.data.sessionSeriesId,
  );

  if (validated.error || !validated.program?.id || !validated.sessionSeries?.id) {
    return {
      error: validated.error ?? "Program ve grup bilgisi dogrulanamadi.",
      success: null,
    };
  }

  const { error: updateError } = await adminClient
    .from("students")
    .update({
      full_name: parsed.data.fullName,
      birth_date: parsed.data.birthDate,
      gender: parsed.data.gender,
    })
    .eq("id", parsed.data.studentId)
    .eq("organization_id", organizationContext.organizationId);

  if (updateError) {
    return {
      error: updateError.message,
      success: null,
    };
  }

  const { data: enrollment } = await adminClient
    .from("enrollments")
    .select("id, program_id, session_series_id, starts_on")
    .eq("student_id", parsed.data.studentId)
    .order("starts_on", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (enrollment?.id) {
    const programOrSeriesChanged =
      enrollment.program_id !== parsed.data.programId ||
      enrollment.session_series_id !== parsed.data.sessionSeriesId;

    const { error: enrollmentUpdateError } = await adminClient
      .from("enrollments")
      .update({
        program_id: parsed.data.programId,
        session_series_id: parsed.data.sessionSeriesId,
      })
      .eq("id", enrollment.id);

    if (enrollmentUpdateError) {
      return {
        error: enrollmentUpdateError.message,
        success: null,
      };
    }

    await adminClient
      .from("student_package_cycles")
      .update({
        program_id: parsed.data.programId,
        total_lessons: Number(validated.program.monthly_lesson_quota ?? 8),
      })
      .eq("enrollment_id", enrollment.id);

    if (programOrSeriesChanged) {
      await rebuildUpcomingEnrollmentAllocations(adminClient, {
        organizationId: organizationContext.organizationId,
        enrollmentId: enrollment.id,
        studentId: parsed.data.studentId,
        studentName: parsed.data.fullName,
        programId: parsed.data.programId,
        sessionSeriesId: parsed.data.sessionSeriesId,
        startsOn: enrollment.starts_on ?? new Date().toISOString().slice(0, 10),
        targetTotalLessons: Number(validated.program.monthly_lesson_quota ?? 8),
      });
    }
  }

  revalidatePath("/manager");
  revalidatePath("/manager/students");
  revalidatePath("/manager/finance");

  await logAuditEvent({
    organizationId: organizationContext.organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Ogrenci guncellendi",
    scope: "Ogrenciler",
    entityType: "students",
    entityId: parsed.data.studentId,
    payload: parsed.data,
  });

  return {
    error: null,
    success: `${parsed.data.fullName} guncellendi.`,
  };
}

export async function deactivateStudentAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "manager" && auth.role !== "admin") || !auth.userId) {
    return {
      error: "Bu islem icin yetkin yok.",
      success: null,
    };
  }

  const parsed = deactivateStudentSchema.safeParse({
    studentId: formData.get("studentId"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Ogrenci secimi gecersiz.",
      success: null,
    };
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return {
      error: "Supabase yonetici baglantisi kurulamadi.",
      success: null,
    };
  }

  const organizationId = await getActorOrganizationId(auth.userId);
  if (!organizationId) {
    return {
      error: "Kurum baglami cozulmedi.",
      success: null,
    };
  }

  const { data: student, error: studentError } = await adminClient
    .from("students")
    .select("id, full_name")
    .eq("id", parsed.data.studentId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (studentError || !student) {
    return {
      error: studentError?.message ?? "Ogrenci bulunamadi.",
      success: null,
    };
  }

  const { error: deactivateError } = await adminClient
    .from("students")
    .update({ active: false })
    .eq("id", student.id)
    .eq("organization_id", organizationId);

  if (deactivateError) {
    return {
      error: deactivateError.message,
      success: null,
    };
  }

  revalidatePath("/manager");
  revalidatePath("/manager/students");

  await logAuditEvent({
    organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Ogrenci pasife alindi",
    scope: "Ogrenciler",
    entityType: "students",
    entityId: student.id,
    payload: { fullName: student.full_name },
  });

  return {
    error: null,
    success: `${student.full_name} pasife alindi.`,
  };
}

export async function grantStudentLessonsAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "manager" && auth.role !== "admin") || !auth.userId) {
    return {
      error: "Bu islem icin yetkin yok.",
      success: null,
    };
  }

  const parsed = grantStudentLessonsSchema.safeParse({
    studentId: formData.get("studentId"),
    lessonCount: formData.get("lessonCount"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Ek hak formu gecersiz.",
      success: null,
    };
  }

  const adminClient = createSupabaseAdminClient();
  const organizationContext = await getOrCreateOrganizationContext(auth.userId);

  if (!adminClient || organizationContext.error || !organizationContext.organizationId) {
    return {
      error: organizationContext.error ?? "Kurum baglami cozulmedi.",
      success: null,
    };
  }

  const { data: student } = await adminClient
    .from("students")
    .select("id, full_name")
    .eq("id", parsed.data.studentId)
    .eq("organization_id", organizationContext.organizationId)
    .maybeSingle();

  if (!student?.id) {
    return {
      error: "Ogrenci bulunamadi.",
      success: null,
    };
  }

  const { data: enrollment } = await adminClient
    .from("enrollments")
    .select("id, program_id, session_series_id, starts_on")
    .eq("student_id", parsed.data.studentId)
    .eq("status", "active")
    .order("starts_on", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!enrollment?.id || !enrollment.session_series_id || !enrollment.program_id) {
    return {
      error: "Ogrenci icin aktif grup kaydi bulunamadi.",
      success: null,
    };
  }

  const insertedCount = await grantBonusLessonAllocations(adminClient, {
    organizationId: organizationContext.organizationId,
    enrollmentId: enrollment.id,
    studentId: parsed.data.studentId,
    studentName: student.full_name,
    programId: enrollment.program_id,
    sessionSeriesId: enrollment.session_series_id,
    startsOn: enrollment.starts_on ?? new Date().toISOString().slice(0, 10),
    lessonCount: parsed.data.lessonCount,
  });

  revalidatePath("/manager");
  revalidatePath("/manager/students");
  revalidatePath("/manager/sessions");
  revalidatePath("/coach/sessions");
  revalidatePath("/parent/schedule");

  await logAuditEvent({
    organizationId: organizationContext.organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Ek seans hakki verildi",
    scope: "Ogrenciler",
    entityType: "enrollment_session_allocations",
    entityId: enrollment.id,
    payload: {
      studentId: parsed.data.studentId,
      lessonCount: parsed.data.lessonCount,
      insertedCount,
    },
  });

  return {
    error: null,
    success: `${student.full_name} icin ${insertedCount} yeni seans hakki acildi.`,
  };
}

export async function rebuildStudentAllocationsAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "manager" && auth.role !== "admin") || !auth.userId) {
    return {
      error: "Bu islem icin yetkin yok.",
      success: null,
    };
  }

  const parsed = rebuildStudentLessonsSchema.safeParse({
    studentId: formData.get("studentId"),
    startsOn: formData.get("startsOn"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Seans yenileme formu gecersiz.",
      success: null,
    };
  }

  const adminClient = createSupabaseAdminClient();
  const organizationContext = await getOrCreateOrganizationContext(auth.userId);

  if (!adminClient || organizationContext.error || !organizationContext.organizationId) {
    return {
      error: organizationContext.error ?? "Kurum baglami cozulmedi.",
      success: null,
    };
  }

  const { data: student } = await adminClient
    .from("students")
    .select("id, full_name")
    .eq("id", parsed.data.studentId)
    .eq("organization_id", organizationContext.organizationId)
    .maybeSingle();

  if (!student?.id) {
    return {
      error: "Ogrenci bulunamadi.",
      success: null,
    };
  }

  const { data: enrollment } = await adminClient
    .from("enrollments")
    .select("id, program_id, session_series_id, starts_on")
    .eq("student_id", parsed.data.studentId)
    .eq("status", "active")
    .order("starts_on", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!enrollment?.id || !enrollment.program_id || !enrollment.session_series_id) {
    return {
      error: "Ogrenci icin aktif grup kaydi bulunamadi.",
      success: null,
    };
  }

  const { data: program } = await adminClient
    .from("programs")
    .select("title, monthly_lesson_quota")
    .eq("id", enrollment.program_id)
    .maybeSingle();

  const lessonCount = Number(program?.monthly_lesson_quota ?? 8);
  const result = await renewEnrollmentLessonPackage(adminClient, {
    organizationId: organizationContext.organizationId,
    enrollmentId: enrollment.id,
    studentId: parsed.data.studentId,
    studentName: student.full_name,
    programId: enrollment.program_id,
    sessionSeriesId: enrollment.session_series_id,
    startsOn: parsed.data.startsOn,
    lessonCount,
  });

  if (!result.ok) {
    return {
      error:
        result.availableCount <= 0
          ? "Secilen tarihten sonra bu grup icin yeterli seans bulunamadi. Program veya grup bitis tarihini uzatman gerekiyor."
          : `${program?.title ?? "Program"} icin secilen tarihten sonra yalnizca ${result.availableCount} seans bulunuyor. ${lessonCount} hakli yeni paket acmak icin program veya grup bitis tarihini uzatman gerekiyor.`,
      success: null,
    };
  }

  revalidatePath("/manager");
  revalidatePath("/manager/students");
  revalidatePath("/manager/sessions");
  revalidatePath("/coach/sessions");
  revalidatePath("/parent/schedule");

  await logAuditEvent({
    organizationId: organizationContext.organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Seans atamalari yeniden olusturuldu",
    scope: "Ogrenciler",
    entityType: "enrollment_session_allocations",
    entityId: enrollment.id,
    payload: {
      studentId: parsed.data.studentId,
      startsOn: parsed.data.startsOn,
      lessonCount,
    },
  });

  return {
    error: null,
    success: `${student.full_name} icin ${parsed.data.startsOn} tarihinden baslayan yeni ${lessonCount} hakli paket olusturuldu.`,
  };
}

export async function saveStudentDetailAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "manager" && auth.role !== "admin" && auth.role !== "coach") || !auth.userId) {
    return {
      error: "Bu islem icin yetkin yok.",
      success: null,
    };
  }

  const parsed = saveStudentDetailSchema.safeParse({
    studentId: formData.get("studentId"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Detay formu gecersiz.",
      success: null,
    };
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return {
      error: "Supabase yonetici baglantisi kurulamadi.",
      success: null,
    };
  }

  const organizationContext = await getOrCreateOrganizationContext(auth.userId);
  if (organizationContext.error || !organizationContext.organizationId) {
    return {
      error: organizationContext.error ?? "Kurum baglami cozulmedi.",
      success: null,
    };
  }

  const { data: student, error: studentError } = await adminClient
    .from("students")
    .select("id, full_name")
    .eq("id", parsed.data.studentId)
    .eq("organization_id", organizationContext.organizationId)
    .maybeSingle();

  if (studentError || !student) {
    return {
      error: studentError?.message ?? "Ogrenci bulunamadi.",
      success: null,
    };
  }

  if (auth.role === "coach") {
    const canWrite = await canCoachWriteStudentDetail(adminClient, auth.userId, student.id);

    if (!canWrite) {
      return {
        error: "Bu sporcu icin detay girme yetkin yok.",
        success: null,
      };
    }
  }

  const questions = await getStudentDetailQuestionsForOrganization(
    adminClient,
    organizationContext.organizationId,
  );
  const extracted = extractDetailEntries(formData, questions);

  if (extracted.error) {
    return {
      error: extracted.error,
      success: null,
    };
  }

  const legacyPayload = buildLegacyDetailPayload(extracted.entries);

  const detailUpsert = await adminClient
    .from("student_detail_profiles")
    .upsert(
      {
        student_id: parsed.data.studentId,
        category: legacyPayload.category,
        club_name: legacyPayload.clubName,
        technical_score: legacyPayload.technicalScore,
        discipline_score: legacyPayload.disciplineScore,
        participation_score: legacyPayload.participationScore,
        strengths: legacyPayload.strengths,
        improvement_areas: legacyPayload.improvementAreas,
        coach_notes: legacyPayload.coachNotes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id" },
    )
    .select("id")
    .single();

  if (detailUpsert.error || !detailUpsert.data) {
    return {
      error: detailUpsert.error?.message ?? "Detay kaydi olusturulamadi.",
      success: null,
      };
  }

  const persistedQuestions = questions.filter((question) => question.source === "database");
  if (persistedQuestions.length) {
    const payloadRows = extracted.entries
      .filter((entry) => persistedQuestions.some((question) => question.id === entry.questionId))
      .map((entry) => ({
        student_id: parsed.data.studentId,
        question_id: entry.questionId,
        answered_by_profile_id: auth.userId,
        value_text: entry.value,
        updated_at: new Date().toISOString(),
      }));

    if (payloadRows.length) {
      const { error: answersError } = await adminClient
        .from("student_detail_answers")
        .upsert(payloadRows, { onConflict: "student_id,question_id" });

      if (answersError) {
        return {
          error: answersError.message,
          success: null,
        };
      }
    }
  }

  const summary = buildReportSummary(student.full_name, extracted.entries);

  const { error: reportError } = await adminClient.from("report_cards").upsert(
    {
      student_id: parsed.data.studentId,
      detail_profile_id: detailUpsert.data.id,
      summary,
      generated_at: new Date().toISOString(),
      payload: {
        entries: extracted.entries,
      },
    },
    { onConflict: "student_id" },
  );

  if (reportError) {
    return {
      error: reportError.message,
      success: null,
    };
  }

  await queueReportCardUpdatedDispatch({
    organizationId: organizationContext.organizationId,
    studentId: parsed.data.studentId,
    studentName: student.full_name,
  }).catch(() => null);

  revalidatePath("/manager");
  revalidatePath("/manager/students");
  revalidatePath("/coach");
  revalidatePath("/coach/students");
  revalidatePath("/parent");
  revalidatePath("/parent/report-cards");

  await logAuditEvent({
    organizationId: organizationContext.organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Ogrenci detay ve karne guncellendi",
    scope: "Ogrenciler",
    entityType: "report_cards",
    entityId: parsed.data.studentId,
    payload: {
      studentId: parsed.data.studentId,
      answers: extracted.entries,
    },
  });

  return {
    error: null,
    success: `${student.full_name} icin detay kaydedildi ve karne guncellendi.`,
  };
}
