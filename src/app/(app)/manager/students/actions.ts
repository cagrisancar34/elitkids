"use server";

import { revalidatePath } from "next/cache";

import { getActorOrganizationId, logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import { getOrCreateOrganizationContext } from "@/lib/organization-context";
import {
  createStudentSchema,
  deactivateStudentSchema,
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
import type { DetailAnswerRecord, DetailQuestionRecord } from "@/lib/types";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

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
    .select("program_id")
    .eq("coach_profile_id", coachProfileId)
    .is("cancelled_at", null);

  const programIds = Array.from(new Set((sessions ?? []).map((session) => session.program_id)));

  if (!programIds.length) {
    return false;
  }

  const { data: enrollment } = await adminClient
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .in("program_id", programIds)
    .limit(1)
    .maybeSingle();

  return Boolean(enrollment?.id);
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

  const { data: program, error: programError } = await adminClient
    .from("programs")
    .select("id, title, monthly_price, monthly_lesson_quota")
    .eq("organization_id", organizationContext.organizationId)
    .eq("id", parsed.data.programId)
    .maybeSingle();

  if (programError || !program?.id) {
    return {
      error: "Secilen program bulunamadi.",
      success: null,
    };
  }

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

  const startsOn = new Date().toISOString().slice(0, 10);

  const { data: enrollment, error: enrollmentError } = await adminClient
    .from("enrollments")
    .insert({
      student_id: insertedStudent.id,
      program_id: program.id,
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
    due_date: "2026-04-12",
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
    .select("id")
    .eq("student_id", parsed.data.studentId)
    .order("starts_on", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (enrollment?.id) {
    const { error: enrollmentUpdateError } = await adminClient
      .from("enrollments")
      .update({ program_id: parsed.data.programId })
      .eq("id", enrollment.id);

    if (enrollmentUpdateError) {
      return {
        error: enrollmentUpdateError.message,
        success: null,
      };
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
