"use server";

import { revalidatePath } from "next/cache";

import { getActorOrganizationId, logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import {
  createRoleScopedTopicNotifications,
  renderMessageTopicForOrganization,
} from "@/lib/message-topics-server";
import { getOrCreateOrganizationContext } from "@/lib/organization-context";
import { ensureMonthlyChargeForEnrollment } from "@/lib/billing";
import {
  activatePreRegistrationSchema,
  createPreRegistrationNoteSchema,
  updatePreRegistrationStatusSchema,
} from "@/lib/schemas/app-forms";
import { buildMonthlyLessonCycle } from "@/lib/program-workspace";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getWhatsAppServerConfig } from "@/lib/whatsapp-config";
import {
  buildWebWhatsAppHref,
  formatLessonLabelForWhatsApp,
  generateTemporaryPassword,
  queueRegistrationCompletedDispatch,
} from "@/lib/whatsapp-server";
import { ensureEnrollmentSessionAllocations, getFirstAllocatedSessionForEnrollment } from "@/lib/session-allocations";

export type PreRegistrationActionState = {
  error: string | null;
  success: string | null;
  activationResult?: {
    firstLessonAt: string | null;
    firstLessonLabel: string | null;
    temporaryPassword: string | null;
    whatsAppTarget: string | null;
    webWhatsAppHref: string | null;
    autoDispatchStatus: "queued" | "failed" | "skipped";
    warning: string | null;
    messagePreview: string | null;
    loginUrl: string;
  } | null;
};

async function resolveOperatorContext() {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "manager" && auth.role !== "admin") || !auth.userId) {
    return {
      auth: null,
      userId: null,
      organizationId: null,
      organizationSlug: null,
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
      organizationSlug: null,
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
      organizationSlug: context.organizationSlug,
      adminClient: null,
      error: "Supabase admin baglantisi kurulamadi.",
    };
  }

  return {
    auth,
    userId: operatorUserId,
      organizationId: context.organizationId,
      organizationSlug: context.organizationSlug,
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
    contextNote: formData.get("contextNote"),
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
  const contextNote = parsed.data.contextNote.trim();
  const normalizedContextNote =
    parsed.data.status === "lost" && contextNote
      ? `KAYIP NEDENI: ${contextNote}`
      : parsed.data.status === "ready_to_activate" && contextNote
        ? `DENEME SONUCU: ${contextNote}`
        : parsed.data.status === "trial_scheduled" && contextNote
          ? `DENEME PLAN NOTU: ${contextNote}`
          : contextNote || null;

  if (parsed.data.status === "lost" && contextNote.length < 4) {
    return {
      error: "Kaybedilme nedeni girilmeli.",
      success: null,
    };
  }

  if (parsed.data.status === "ready_to_activate" && contextNote.length < 4) {
    return {
      error: "Deneme dersi sonucu girilmeli.",
      success: null,
    };
  }

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
    note: normalizedContextNote,
  });

  if (normalizedContextNote) {
    await context.adminClient.from("pre_registration_notes").insert({
      pre_registration_id: parsed.data.preRegistrationId,
      author_profile_id: context.userId,
      body: normalizedContextNote,
    });
  }

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
      contextNote: normalizedContextNote,
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
      gender: record.student_gender ?? "other",
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

  const firstAllocatedSession = await getFirstAllocatedSessionForEnrollment(context.adminClient, enrollment.id);
  const firstLessonAt = firstAllocatedSession?.startsAt ?? null;
  const firstLessonLabel = formatLessonLabelForWhatsApp(firstLessonAt);
  const config = getWhatsAppServerConfig();
  const loginUrl = `${config.appUrl}/login`;

  let activatedParentProfileId: string | null = null;
  let temporaryPassword: string | null = null;
  let parentAccessWarning: string | null = null;
  const listedUsers = await context.adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 500,
  });
  let parentUser = listedUsers.data.users.find(
    (user) => user.email?.toLowerCase() === String(record.parent_email ?? "").toLowerCase(),
  );

  if (!parentUser?.id && record.parent_email) {
    const generatedPassword = generateTemporaryPassword();
    const createdParent = await context.adminClient.auth.admin.createUser({
      email: String(record.parent_email),
      password: generatedPassword,
      email_confirm: true,
      app_metadata: {
        app_role: "parent",
        organization_id: context.organizationId,
        organization_slug: context.organizationSlug,
      },
      user_metadata: {
        full_name: String(record.mother_name || record.father_name || "Veli"),
      },
    });

    if (createdParent.error || !createdParent.data.user?.id) {
      parentAccessWarning =
        createdParent.error?.message ?? "Veli auth hesabi olusturulamadi. Gecici sifre uretilemedi.";
    } else {
      parentUser = createdParent.data.user;
      temporaryPassword = generatedPassword;
    }
  }

  if (parentUser?.id) {
    activatedParentProfileId = parentUser.id;

    await context.adminClient.auth.admin.updateUserById(parentUser.id, {
      app_metadata: {
        ...(typeof parentUser.app_metadata === "object" && parentUser.app_metadata ? parentUser.app_metadata : {}),
        app_role: "parent",
        organization_id: context.organizationId,
        organization_slug: context.organizationSlug,
      },
    });

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

    const { data: existingParentRole } = await context.adminClient
      .from("user_roles")
      .select("profile_id")
      .eq("profile_id", parentUser.id)
      .eq("role", "parent")
      .maybeSingle();

    if (!existingParentRole?.profile_id) {
      await context.adminClient.from("user_roles").insert({
        profile_id: parentUser.id,
        role: "parent",
      });
    }
  } else if (record.parent_email) {
    parentAccessWarning =
      parentAccessWarning ??
      "Veli hesabi hazirlanamadi. Aktivasyon tamamlandi ama giris bilgileri uretilemedi.";
  }

  if (parsed.data.createInitialCharge === "yes") {
    await ensureMonthlyChargeForEnrollment({
      organizationId: context.organizationId,
      enrollmentId: enrollment.id,
      startsOn: parsed.data.startsOn,
      amount: Number(program.monthly_price ?? 0),
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

  const warningParts: string[] = [];

  if (!firstLessonLabel) {
    warningParts.push(
      "Ilk atanmis seans bulunamadi. Program tarihi veya allocation yapisini kontrol etmeden veliye mesaj gonderme.",
    );
  }

  if (!temporaryPassword) {
    warningParts.push(
      parentAccessWarning ??
        "Veli icin gecici sifre uretilemedi. Hesap erisimi tamamlanmadan kayit mesajini gonderme.",
    );
  }

  const activationWarning = warningParts.length ? warningParts.join(" ") : null;
  const accessMessage = temporaryPassword
    ? `Gecici sifreniz: ${temporaryPassword}`
    : parentAccessWarning;

  const messagePreview =
    record.parent_email && firstLessonLabel && temporaryPassword
      ? (
          await renderMessageTopicForOrganization({
            organizationId: context.organizationId,
            topicKey: "pre_registration_activated",
            variables: {
              student_name: String(record.student_full_name),
              program_name: program.title,
              first_lesson: firstLessonLabel,
              login_url: loginUrl,
              email: String(record.parent_email),
              access_note: accessMessage ?? "",
            },
          })
        ).body
      : null;

  const webWhatsAppHref =
    record.parent_whatsapp && messagePreview
      ? buildWebWhatsAppHref({
          phone: String(record.parent_whatsapp),
          message: messagePreview,
        })
      : null;

  let autoDispatchStatus: "queued" | "failed" | "skipped" = "skipped";

  if (record.parent_email && record.parent_whatsapp && firstLessonLabel && temporaryPassword) {
    try {
      await queueRegistrationCompletedDispatch({
        organizationId: context.organizationId,
        recipientName: String(record.mother_name || record.father_name || "Veli"),
        recipientPhone: String(record.parent_whatsapp),
        recipientEmail: String(record.parent_email),
        setupLink: null,
        temporaryPassword,
        accessNote: accessMessage,
        firstLessonLabel,
        profileId: activatedParentProfileId,
        preRegistrationId: parsed.data.preRegistrationId,
      });
      autoDispatchStatus = "queued";
    } catch {
      autoDispatchStatus = "failed";
    }
  }

  await createRoleScopedTopicNotifications({
    organizationId: context.organizationId,
    topicKey: "panel_notice_registration_completed",
    channelKey: `message_topic:panel_notice_registration_completed:pre-registration:${parsed.data.preRegistrationId}`,
    variables: {
      student_name: String(record.student_full_name),
      program_name: program.title,
      first_lesson: firstLessonLabel ?? "-",
      login_url: loginUrl,
      email: String(record.parent_email ?? "-"),
      temporary_password: temporaryPassword ?? "-",
      access_note: accessMessage ?? "Mevcut sifre korunuyor.",
    },
  });

  return {
    error: null,
    success: "On kayit aktif ogrenciye donusturuldu.",
    activationResult: {
      firstLessonAt,
      firstLessonLabel,
      temporaryPassword,
      whatsAppTarget: record.parent_whatsapp ? String(record.parent_whatsapp) : null,
      webWhatsAppHref,
      autoDispatchStatus,
      warning: activationWarning,
      messagePreview,
      loginUrl,
    },
  };
}
