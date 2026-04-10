"use server";

import { revalidatePath } from "next/cache";

import { getActorOrganizationId, logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import { getOrCreateOrganizationContext } from "@/lib/organization-context";
import {
  activatePreRegistrationSchema,
  createPreRegistrationNoteSchema,
  updatePreRegistrationStatusSchema,
} from "@/lib/schemas/app-forms";
import { buildMonthlyLessonCycle } from "@/lib/program-workspace";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  createInviteLinkForEmail,
  createRecoveryLinkForEmail,
  queueRegistrationCompletedDispatch,
} from "@/lib/whatsapp-server";
import { ensureEnrollmentSessionAllocations } from "@/lib/session-allocations";

export type PreRegistrationActionState = {
  error: string | null;
  success: string | null;
};

async function resolveOperatorContext() {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "manager" && auth.role !== "admin") || !auth.userId) {
    return {
      auth: null,
      userId: null,
      organizationId: null,
      adminClient: null,
      error: "Bu islem icin yetkin yok.",
    };
  }

  const context = await getOrCreateOrganizationContext(auth.userId);
  const operatorUserId = auth.userId;

  if (context.error || !context.organizationId) {
    return {
      auth: null,
      userId: operatorUserId,
      organizationId: null,
      adminClient: null,
      error: context.error ?? "Kurum baglami cozulmedi.",
    };
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return {
      auth: null,
      userId: operatorUserId,
      organizationId: context.organizationId,
      adminClient: null,
      error: "Supabase admin baglantisi kurulamadi.",
    };
  }

  return {
    auth,
    userId: operatorUserId,
    organizationId: context.organizationId,
    adminClient,
    error: null,
  };
}

async function appendStatusLog(
  adminClient: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  input: {
    preRegistrationId: string;
    actorProfileId: string;
    fromStatus: string | null;
    toStatus: string;
    note?: string | null;
  },
) {
  await adminClient.from("pre_registration_status_logs").insert({
    pre_registration_id: input.preRegistrationId,
    actor_profile_id: input.actorProfileId,
    from_status: input.fromStatus,
    to_status: input.toStatus,
    note: input.note ?? null,
  });
}

function refreshPreRegistrationViews() {
  revalidatePath("/manager/pre-registrations");
  revalidatePath("/manager/students");
  revalidatePath("/admin");
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
      error: "Aktivasyon icin secilen program bulunamadi.",
      program: null,
      sessionSeries: null,
    };
  }

  if (sessionSeriesError || !sessionSeries?.id) {
    return {
      error: "Aktivasyon icin secilen grup bulunamadi.",
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

export async function updatePreRegistrationStatusAction(
  _previousState: PreRegistrationActionState,
  formData: FormData,
): Promise<PreRegistrationActionState> {
  const context = await resolveOperatorContext();

  if (context.error || !context.auth || !context.userId || !context.organizationId || !context.adminClient) {
    return {
      error: context.error ?? "Islem icin gerekli baglam kurulamadı.",
      success: null,
    };
  }

  const parsed = updatePreRegistrationStatusSchema.safeParse({
    preRegistrationId: formData.get("preRegistrationId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Basvuru durumu guncellenemedi.",
      success: null,
    };
  }

  const { data: record, error: recordError } = await context.adminClient
    .from("pre_registrations")
    .select("id, status")
    .eq("id", parsed.data.preRegistrationId)
    .eq("organization_id", context.organizationId)
    .maybeSingle();

  if (recordError || !record) {
    return {
      error: "On kayit kaydi bulunamadi.",
      success: null,
    };
  }

  const now = new Date().toISOString();
  const { error: updateError } = await context.adminClient
    .from("pre_registrations")
    .update({
      status: parsed.data.status,
      reviewed_by_profile_id: context.userId,
      reviewed_at: now,
      updated_at: now,
    })
    .eq("id", parsed.data.preRegistrationId);

  if (updateError) {
    return {
      error: updateError.message,
      success: null,
    };
  }

  await appendStatusLog(context.adminClient, {
    preRegistrationId: parsed.data.preRegistrationId,
    actorProfileId: context.userId,
    fromStatus: record.status,
    toStatus: parsed.data.status,
  });

  await logAuditEvent({
    organizationId: await getActorOrganizationId(context.userId),
    actorProfileId: context.userId,
    actorRole: context.auth.role,
    eventType: "On kayit durumu guncellendi",
    scope: "On kayit",
    entityType: "pre_registrations",
    entityId: parsed.data.preRegistrationId,
    payload: {
      fromStatus: record.status,
      toStatus: parsed.data.status,
    },
  });

  refreshPreRegistrationViews();

  return {
    error: null,
    success: "Basvuru durumu guncellendi.",
  };
}

export async function addPreRegistrationNoteAction(
  _previousState: PreRegistrationActionState,
  formData: FormData,
): Promise<PreRegistrationActionState> {
  const context = await resolveOperatorContext();

  if (context.error || !context.auth || !context.userId || !context.organizationId || !context.adminClient) {
    return {
      error: context.error ?? "Islem icin gerekli baglam kurulamadi.",
      success: null,
    };
  }

  const parsed = createPreRegistrationNoteSchema.safeParse({
    preRegistrationId: formData.get("preRegistrationId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Not kaydi gecersiz.",
      success: null,
    };
  }

  const { error } = await context.adminClient.from("pre_registration_notes").insert({
    pre_registration_id: parsed.data.preRegistrationId,
    author_profile_id: context.userId,
    body: parsed.data.body,
  });

  if (error) {
    return {
      error: error.message,
      success: null,
    };
  }

  await logAuditEvent({
    organizationId: await getActorOrganizationId(context.userId),
    actorProfileId: context.userId,
    actorRole: context.auth.role,
    eventType: "On kayit notu eklendi",
    scope: "On kayit",
    entityType: "pre_registration_notes",
    entityId: parsed.data.preRegistrationId,
    payload: {
      preview: parsed.data.body.slice(0, 120),
    },
  });

  refreshPreRegistrationViews();

  return {
    error: null,
    success: "Ic not eklendi.",
  };
}

export async function activatePreRegistrationAction(
  _previousState: PreRegistrationActionState,
  formData: FormData,
): Promise<PreRegistrationActionState> {
  const context = await resolveOperatorContext();

  if (context.error || !context.auth || !context.userId || !context.organizationId || !context.adminClient) {
    return {
      error: context.error ?? "Islem icin gerekli baglam kurulamadi.",
      success: null,
    };
  }

  const parsed = activatePreRegistrationSchema.safeParse({
    preRegistrationId: formData.get("preRegistrationId"),
    branchId: formData.get("branchId"),
    seasonId: formData.get("seasonId"),
    programId: formData.get("programId"),
    sessionSeriesId: formData.get("sessionSeriesId"),
    startsOn: formData.get("startsOn"),
    createInitialCharge: formData.get("createInitialCharge"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Aktivasyon formu gecersiz.",
      success: null,
    };
  }

  const { data: record, error: recordError } = await context.adminClient
    .from("pre_registrations")
    .select("*")
    .eq("id", parsed.data.preRegistrationId)
    .eq("organization_id", context.organizationId)
    .maybeSingle();

  if (recordError || !record) {
    return {
      error: "On kayit kaydi bulunamadi.",
      success: null,
    };
  }

  if (record.activated_student_id) {
    return {
      error: "Bu on kayit zaten aktif kayda donusturulmus.",
      success: null,
    };
  }

  const validated = await getValidatedProgramSeries(
    context.adminClient,
    context.organizationId,
    parsed.data.programId,
    parsed.data.sessionSeriesId,
  );

  if (validated.error || !validated.program || !validated.sessionSeries) {
    return {
      error: validated.error ?? "Aktivasyon icin program ve grup bilgisi dogrulanamadi.",
      success: null,
    };
  }

  const program = validated.program;

  const { data: student, error: studentError } = await context.adminClient
    .from("students")
    .insert({
      organization_id: context.organizationId,
      full_name: record.student_full_name,
      birth_date: record.student_birth_date,
      active: true,
      source: "pre_registration",
    })
    .select("id")
    .single();

  if (studentError || !student?.id) {
    return {
      error: studentError?.message ?? "Ogrenci kaydi olusturulamadi.",
      success: null,
    };
  }

  const { data: enrollment, error: enrollmentError } = await context.adminClient
    .from("enrollments")
    .insert({
      student_id: student.id,
      program_id: parsed.data.programId,
      session_series_id: parsed.data.sessionSeriesId,
      status: "active",
      starts_on: parsed.data.startsOn,
    })
    .select("id")
    .single();

  if (enrollmentError || !enrollment?.id) {
    return {
      error: enrollmentError?.message ?? "Program atamasi yapilamadi.",
      success: null,
    };
  }

  if ((program.monthly_lesson_quota ?? 0) > 0) {
    await context.adminClient.from("student_package_cycles").insert(
      buildMonthlyLessonCycle({
        organizationId: context.organizationId,
        studentId: student.id,
        enrollmentId: enrollment.id,
        programId: parsed.data.programId,
        startsOn: parsed.data.startsOn,
        quota: Number(program.monthly_lesson_quota ?? 8),
      }),
    );

    await ensureEnrollmentSessionAllocations(context.adminClient, {
      organizationId: context.organizationId,
      enrollmentId: enrollment.id,
      studentId: student.id,
      studentName: record.student_full_name,
      programId: parsed.data.programId,
      sessionSeriesId: parsed.data.sessionSeriesId,
      startsOn: parsed.data.startsOn,
      lessonCount: Number(program.monthly_lesson_quota ?? 8),
    });
  }

  let activatedParentProfileId: string | null = null;
  let setupLink: string | null = null;
  const listedUsers = await context.adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 500,
  });
  let parentUser = listedUsers.data.users.find(
    (user) => user.email?.toLowerCase() === String(record.parent_email ?? "").toLowerCase(),
  );

  if (!parentUser?.id && record.parent_email) {
    const invite = await createInviteLinkForEmail(
      String(record.parent_email),
      String(record.mother_name || record.father_name || "Veli"),
    );
    setupLink = invite.actionLink;

    if (invite.userId) {
      const refreshedUsers = await context.adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 500,
      });
      parentUser =
        refreshedUsers.data.users.find((user) => user.id === invite.userId) ??
        refreshedUsers.data.users.find(
          (user) => user.email?.toLowerCase() === String(record.parent_email ?? "").toLowerCase(),
        );
    }
  }

  if (parentUser?.id) {
    activatedParentProfileId = parentUser.id;
    if (!setupLink && record.parent_email) {
      setupLink = await createRecoveryLinkForEmail(String(record.parent_email), String(record.mother_name || record.father_name || "Veli"));
    }

    const { data: existingParentProfile } = await context.adminClient
      .from("profiles")
      .select("id")
      .eq("id", parentUser.id)
      .maybeSingle();

    if (!existingParentProfile?.id) {
      const inferredName =
        typeof parentUser.user_metadata?.full_name === "string"
          ? parentUser.user_metadata.full_name
          : record.mother_name || record.father_name || parentUser.email?.split("@")[0] || "Veli";

      await context.adminClient.from("profiles").upsert(
        {
          id: parentUser.id,
          organization_id: context.organizationId,
          full_name: inferredName,
          phone: record.parent_whatsapp || null,
        },
        { onConflict: "id" },
      );
    } else if (record.parent_whatsapp) {
      await context.adminClient
        .from("profiles")
        .update({ phone: record.parent_whatsapp })
        .eq("id", parentUser.id);
    }

    await context.adminClient.from("parent_student_links").upsert(
      {
        parent_profile_id: parentUser.id,
        student_id: student.id,
        relationship: "Veli",
      },
      { onConflict: "parent_profile_id,student_id" },
    );
  }

  if (parsed.data.createInitialCharge === "yes") {
    const { data: feePlan } = await context.adminClient
      .from("fee_plans")
      .select("id")
      .eq("organization_id", context.organizationId)
      .eq("amount", program.monthly_price)
      .limit(1)
      .maybeSingle();

    await context.adminClient.from("charges").insert({
      enrollment_id: enrollment.id,
      fee_plan_id: feePlan?.id ?? null,
      amount: program.monthly_price,
      due_date: parsed.data.startsOn,
      status: "pending",
    });
  }

  const now = new Date().toISOString();
  const { error: updateError } = await context.adminClient
    .from("pre_registrations")
    .update({
      status: "activated",
      branch_id: parsed.data.branchId,
      season_id: parsed.data.seasonId,
      program_id: parsed.data.programId,
      reviewed_by_profile_id: context.userId,
      reviewed_at: now,
      activated_student_id: student.id,
      activated_parent_profile_id: activatedParentProfileId,
      updated_at: now,
    })
    .eq("id", parsed.data.preRegistrationId);

  if (updateError) {
    return {
      error: updateError.message,
      success: null,
    };
  }

  await appendStatusLog(context.adminClient, {
    preRegistrationId: parsed.data.preRegistrationId,
    actorProfileId: context.userId,
    fromStatus: record.status,
    toStatus: "activated",
    note: `${program.title} programina aktivasyon`,
  });

  await logAuditEvent({
    organizationId: await getActorOrganizationId(context.userId),
    actorProfileId: context.userId,
    actorRole: context.auth.role,
    eventType: "On kayit aktive edildi",
    scope: "On kayit",
    entityType: "pre_registrations",
    entityId: parsed.data.preRegistrationId,
    payload: {
      studentId: student.id,
      enrollmentId: enrollment.id,
      programId: parsed.data.programId,
      sessionSeriesId: parsed.data.sessionSeriesId,
      createInitialCharge: parsed.data.createInitialCharge === "yes",
    },
  });

  refreshPreRegistrationViews();
  revalidatePath("/manager/payments");
  revalidatePath("/manager/finance");
  revalidatePath("/parent");

  if (record.parent_email && record.parent_whatsapp) {
    await queueRegistrationCompletedDispatch({
      organizationId: context.organizationId,
      recipientName: String(record.mother_name || record.father_name || "Veli"),
      recipientPhone: String(record.parent_whatsapp),
      recipientEmail: String(record.parent_email),
      setupLink,
      profileId: activatedParentProfileId,
      preRegistrationId: parsed.data.preRegistrationId,
    }).catch(() => null);
  }

  return {
    error: null,
    success: "On kayit aktif ogrenciye donusturuldu.",
  };
}
