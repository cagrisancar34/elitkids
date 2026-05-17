"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import { getOrCreateOrganizationContext } from "@/lib/organization-context";
import {
  createBranchSchema,
  createSeasonSchema,
  sendWhatsAppTestSchema,
  toggleBranchArchiveSchema,
  toggleBranchStatusSchema,
  toggleSeasonDefaultSchema,
  toggleSeasonStatusSchema,
  updateBranchSchema,
  updateOrganizationSettingsSchema,
  updateSeasonSchema,
  updateMessageTopicSchema,
  updateWhatsAppTemplateSchema,
} from "@/lib/schemas/app-forms";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { updateMessageTopicForOrganization } from "@/lib/message-topics-server";
import {
  ensureWhatsAppTemplates,
  processDueWhatsAppDispatches,
  queueWhatsAppDispatch,
} from "@/lib/whatsapp-server";
import type { WhatsAppTemplateEventKey } from "@/lib/types";

export type SettingsActionState = {
  error: string | null;
  success: string | null;
};

async function requireAdminSettingsContext() {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "admin" || !auth.userId) {
    return {
      error: "Bu islem icin admin yetkisi gerekli.",
      auth: null,
      organizationId: null,
      supabase: null,
    };
  }

  const supabase = createSupabaseAdminClient();
  const context = await getOrCreateOrganizationContext(auth.userId);

  if (!supabase || !context.organizationId) {
    return {
      error:
        context.error === "Kurum baglami cozulmedi."
          ? "Once Kurum sekmesinden kurum kaydini olustur veya mevcut kurumu bagla."
          : context.error ?? "Supabase baglantisi kurulamadi.",
      auth,
      organizationId: null,
      supabase: null,
    };
  }

  return {
    error: null,
    auth,
    organizationId: context.organizationId,
    supabase,
  };
}

function getMissingTableMessage(code: string | undefined, tableName: string) {
  if (code !== "PGRST205") {
    return null;
  }

  return `${tableName} tablosu henuz yok. 0003_settings_expansion.sql migration dosyasini calistir.`;
}

async function clearDefaultSeason(
  organizationId: string,
  currentSeasonId: string | null,
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
) {
  let query = supabase.from("seasons").update({ is_default: false }).eq("organization_id", organizationId);

  if (currentSeasonId) {
    query = query.neq("id", currentSeasonId);
  }

  return query;
}

export async function updateOrganizationSettingsAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "admin" || !auth.userId) {
    return {
      error: "Bu islem icin admin yetkisi gerekli.",
      success: null,
    };
  }

  const parsed = updateOrganizationSettingsSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    locale: formData.get("locale"),
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Kurum ayarlari formu gecersiz.",
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

  const orgContext = await getOrCreateOrganizationContext(auth.userId, {
    createIfMissing: parsed.data,
  });

  if (!orgContext.organizationId) {
    return {
      error: orgContext.error ?? "Kurum baglami cozulmedi.",
      success: null,
    };
  }

  const { error: updateError } = await supabase
    .from("organizations")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      locale: parsed.data.locale,
      timezone: parsed.data.timezone,
    })
    .eq("id", orgContext.organizationId);

  if (updateError) {
    return {
      error: updateError.message,
      success: null,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/");

  await logAuditEvent({
    organizationId: orgContext.organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Kurum ayarlari guncellendi",
    scope: "Sistem ayarlari",
    entityType: "organizations",
    entityId: orgContext.organizationId,
    payload: parsed.data,
  });

  return {
    error: null,
    success: "Kurum ayarlari guncellendi.",
  };
}

export async function createBranchAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  const parsed = createBranchSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    location: formData.get("location"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Sube formu gecersiz.",
      success: null,
    };
  }

  const { error } = await context.supabase.from("branches").insert({
    organization_id: context.organizationId,
    name: parsed.data.name,
    slug: parsed.data.slug,
    location: parsed.data.location,
    active: true,
  });

  if (error) {
    return {
      error: getMissingTableMessage(error.code, "Branches") ?? error.message,
      success: null,
    };
  }

  revalidatePath("/admin/settings");

  await logAuditEvent({
    organizationId: context.organizationId,
    actorProfileId: context.auth?.userId,
    actorRole: context.auth?.role,
    eventType: "Yeni sube olusturuldu",
    scope: "Sistem ayarlari",
    entityType: "branches",
    payload: parsed.data,
  });

  return {
    error: null,
    success: "Sube olusturuldu.",
  };
}

export async function createSeasonAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  const parsed = createSeasonSchema.safeParse({
    title: formData.get("title"),
    startsOn: formData.get("startsOn"),
    endsOn: formData.get("endsOn"),
    makeActive: formData.get("makeActive"),
    makeDefault: formData.get("makeDefault"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Sezon formu gecersiz.",
      success: null,
    };
  }

  if (parsed.data.makeActive === "yes") {
    const deactivateResult = await context.supabase
      .from("seasons")
      .update({ is_active: false })
      .eq("organization_id", context.organizationId);

    if (deactivateResult.error) {
      return {
        error:
          getMissingTableMessage(deactivateResult.error.code, "Seasons") ??
          deactivateResult.error.message,
        success: null,
      };
    }
  }

  if (parsed.data.makeDefault === "yes") {
    const clearDefaultResult = await clearDefaultSeason(
      context.organizationId,
      null,
      context.supabase,
    );

    if (clearDefaultResult.error) {
      return {
        error:
          getMissingTableMessage(clearDefaultResult.error.code, "Seasons") ??
          clearDefaultResult.error.message,
        success: null,
      };
    }
  }

  const { error } = await context.supabase.from("seasons").insert({
    organization_id: context.organizationId,
    title: parsed.data.title,
    starts_on: parsed.data.startsOn,
    ends_on: parsed.data.endsOn,
    is_active: parsed.data.makeActive === "yes",
    is_default: parsed.data.makeDefault === "yes",
  });

  if (error) {
    return {
      error: getMissingTableMessage(error.code, "Seasons") ?? error.message,
      success: null,
    };
  }

  revalidatePath("/admin/settings");

  await logAuditEvent({
    organizationId: context.organizationId,
    actorProfileId: context.auth?.userId,
    actorRole: context.auth?.role,
    eventType: "Yeni sezon olusturuldu",
    scope: "Sistem ayarlari",
    entityType: "seasons",
    payload: parsed.data,
  });

  return {
    error: null,
    success: "Sezon olusturuldu.",
  };
}

export async function updateBranchAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  const parsed = updateBranchSchema.safeParse({
    branchId: formData.get("branchId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    location: formData.get("location"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Sube guncelleme formu gecersiz.",
      success: null,
    };
  }

  const { error } = await context.supabase
    .from("branches")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      location: parsed.data.location,
    })
    .eq("id", parsed.data.branchId)
    .eq("organization_id", context.organizationId);

  if (error) {
    return {
      error: getMissingTableMessage(error.code, "Branches") ?? error.message,
      success: null,
    };
  }

  revalidatePath("/admin/settings");

  return {
    error: null,
    success: "Sube guncellendi.",
  };
}

export async function toggleBranchStatusAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  const parsed = toggleBranchStatusSchema.safeParse({
    branchId: formData.get("branchId"),
    nextState: formData.get("nextState"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Sube durum formu gecersiz.",
      success: null,
    };
  }

  const { error } = await context.supabase
    .from("branches")
    .update({ active: parsed.data.nextState === "active" })
    .eq("id", parsed.data.branchId)
    .eq("organization_id", context.organizationId);

  if (error) {
    return {
      error: getMissingTableMessage(error.code, "Branches") ?? error.message,
      success: null,
    };
  }

  revalidatePath("/admin/settings");

  return {
    error: null,
    success:
      parsed.data.nextState === "active"
        ? "Sube aktif hale getirildi."
        : "Sube pasif hale getirildi.",
  };
}

export async function toggleBranchArchiveAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  const parsed = toggleBranchArchiveSchema.safeParse({
    branchId: formData.get("branchId"),
    nextState: formData.get("nextState"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Sube arsiv formu gecersiz.",
      success: null,
    };
  }

  const payload =
    parsed.data.nextState === "archive"
      ? { archived_at: new Date().toISOString(), active: false }
      : { archived_at: null };

  const { error } = await context.supabase
    .from("branches")
    .update(payload)
    .eq("id", parsed.data.branchId)
    .eq("organization_id", context.organizationId);

  if (error) {
    return {
      error:
        error.code === "PGRST205" || error.code === "42703"
          ? "Branch archive alani henuz yok. 0004_settings_archive_default.sql migration dosyasini calistir."
          : error.message,
      success: null,
    };
  }

  revalidatePath("/admin/settings");

  return {
    error: null,
    success:
      parsed.data.nextState === "archive"
        ? "Sube guvenli bicimde arsive alindi."
        : "Sube arsivden cikarildi.",
  };
}

export async function updateSeasonAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  const parsed = updateSeasonSchema.safeParse({
    seasonId: formData.get("seasonId"),
    title: formData.get("title"),
    startsOn: formData.get("startsOn"),
    endsOn: formData.get("endsOn"),
    makeActive: formData.get("makeActive"),
    makeDefault: formData.get("makeDefault"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Sezon guncelleme formu gecersiz.",
      success: null,
    };
  }

  if (parsed.data.makeActive === "yes") {
    const deactivateResult = await context.supabase
      .from("seasons")
      .update({ is_active: false })
      .eq("organization_id", context.organizationId)
      .neq("id", parsed.data.seasonId);

    if (deactivateResult.error) {
      return {
        error:
          getMissingTableMessage(deactivateResult.error.code, "Seasons") ??
          deactivateResult.error.message,
        success: null,
      };
    }
  }

  if (parsed.data.makeDefault === "yes") {
    const clearDefaultResult = await clearDefaultSeason(
      context.organizationId,
      parsed.data.seasonId,
      context.supabase,
    );

    if (clearDefaultResult.error) {
      return {
        error:
          clearDefaultResult.error.code === "PGRST205" ||
          clearDefaultResult.error.code === "42703"
            ? "Season default alani henuz yok. 0004_settings_archive_default.sql migration dosyasini calistir."
            : clearDefaultResult.error.message,
        success: null,
      };
    }
  }

  const { error } = await context.supabase
    .from("seasons")
    .update({
      title: parsed.data.title,
      starts_on: parsed.data.startsOn,
      ends_on: parsed.data.endsOn,
      is_active: parsed.data.makeActive === "yes",
      is_default: parsed.data.makeDefault === "yes",
    })
    .eq("id", parsed.data.seasonId)
    .eq("organization_id", context.organizationId);

  if (error) {
    return {
      error: getMissingTableMessage(error.code, "Seasons") ?? error.message,
      success: null,
    };
  }

  revalidatePath("/admin/settings");

  return {
    error: null,
    success: "Sezon guncellendi.",
  };
}

export async function toggleSeasonStatusAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  const parsed = toggleSeasonStatusSchema.safeParse({
    seasonId: formData.get("seasonId"),
    nextState: formData.get("nextState"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Sezon durum formu gecersiz.",
      success: null,
    };
  }

  if (parsed.data.nextState === "active") {
    const deactivateResult = await context.supabase
      .from("seasons")
      .update({ is_active: false })
      .eq("organization_id", context.organizationId)
      .neq("id", parsed.data.seasonId);

    if (deactivateResult.error) {
      return {
        error:
          getMissingTableMessage(deactivateResult.error.code, "Seasons") ??
          deactivateResult.error.message,
        success: null,
      };
    }
  }

  const { error } = await context.supabase
    .from("seasons")
    .update({ is_active: parsed.data.nextState === "active" })
    .eq("id", parsed.data.seasonId)
    .eq("organization_id", context.organizationId);

  if (error) {
    return {
      error: getMissingTableMessage(error.code, "Seasons") ?? error.message,
      success: null,
    };
  }

  revalidatePath("/admin/settings");

  return {
    error: null,
    success:
      parsed.data.nextState === "active"
        ? "Sezon aktif hale getirildi."
        : "Sezon planli duruma alindi.",
  };
}

export async function toggleSeasonDefaultAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  const parsed = toggleSeasonDefaultSchema.safeParse({
    seasonId: formData.get("seasonId"),
    nextState: formData.get("nextState"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Varsayilan sezon formu gecersiz.",
      success: null,
    };
  }

  if (parsed.data.nextState === "default") {
    const clearDefaultResult = await clearDefaultSeason(
      context.organizationId,
      parsed.data.seasonId,
      context.supabase,
    );

    if (clearDefaultResult.error) {
      return {
        error:
          clearDefaultResult.error.code === "PGRST205" ||
          clearDefaultResult.error.code === "42703"
            ? "Season default alani henuz yok. 0004_settings_archive_default.sql migration dosyasini calistir."
            : clearDefaultResult.error.message,
        success: null,
      };
    }
  }

  const { error } = await context.supabase
    .from("seasons")
    .update({ is_default: parsed.data.nextState === "default" })
    .eq("id", parsed.data.seasonId)
    .eq("organization_id", context.organizationId);

  if (error) {
    return {
      error:
        error.code === "PGRST205" || error.code === "42703"
          ? "Season default alani henuz yok. 0004_settings_archive_default.sql migration dosyasini calistir."
          : error.message,
      success: null,
    };
  }

  revalidatePath("/admin/settings");

  return {
    error: null,
    success:
      parsed.data.nextState === "default"
        ? "Varsayilan sezon etiketi guncellendi."
        : "Varsayilan sezon etiketi kaldirildi.",
  };
}

export async function updateWhatsAppTemplateAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  await ensureWhatsAppTemplates(context.organizationId);

  const parsed = updateWhatsAppTemplateSchema.safeParse({
    templateId: formData.get("templateId"),
    metaTemplateName: formData.get("metaTemplateName"),
    enabled: formData.get("enabled"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "WhatsApp template formu gecersiz.",
      success: null,
    };
  }

  const { error } = await context.supabase
    .from("whatsapp_templates")
    .update({
      meta_template_name: parsed.data.metaTemplateName.trim() || null,
      enabled: parsed.data.enabled === "yes",
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.templateId)
    .eq("organization_id", context.organizationId);

  if (error) {
    return {
      error: error.message,
      success: null,
    };
  }

  revalidatePath("/admin/settings");

  await logAuditEvent({
    organizationId: context.organizationId,
    actorProfileId: context.auth?.userId,
    actorRole: context.auth?.role,
    eventType: "WhatsApp template guncellendi",
    scope: "WhatsApp",
    entityType: "whatsapp_templates",
    entityId: parsed.data.templateId,
    payload: {
      enabled: parsed.data.enabled === "yes",
      metaTemplateName: parsed.data.metaTemplateName.trim() || null,
    },
  });

  return {
    error: null,
    success: "WhatsApp template ayari guncellendi.",
  };
}

export async function updateMessageTopicAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  const parsed = updateMessageTopicSchema.safeParse({
    topicId: formData.get("topicId"),
    title: formData.get("title"),
    description: formData.get("description"),
    channel: formData.get("channel"),
    bodyTemplate: formData.get("bodyTemplate"),
    active: formData.get("active"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Mesaj konusu formu gecersiz.",
      success: null,
    };
  }

  try {
    await updateMessageTopicForOrganization({
      organizationId: context.organizationId,
      topicId: parsed.data.topicId,
      title: parsed.data.title,
      description: parsed.data.description,
      channel: parsed.data.channel,
      bodyTemplate: parsed.data.bodyTemplate,
      active: parsed.data.active === "yes",
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Mesaj konusu guncellenemedi.",
      success: null,
    };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/manager/communication");

  await logAuditEvent({
    organizationId: context.organizationId,
    actorProfileId: context.auth?.userId,
    actorRole: context.auth?.role,
    eventType: "Mesaj konusu guncellendi",
    scope: "WhatsApp",
    entityType: "message_topics",
    entityId: parsed.data.topicId,
    payload: {
      channel: parsed.data.channel,
      active: parsed.data.active === "yes",
      title: parsed.data.title,
    },
  });

  return {
    error: null,
    success: "Mesaj konusu guncellendi.",
  };
}

export async function sendWhatsAppTestAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  const parsed = sendWhatsAppTestSchema.safeParse({
    phone: formData.get("phone"),
    eventKey: formData.get("eventKey"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Test gonderim formu gecersiz.",
      success: null,
    };
  }

  const fallbackVariablesByEvent: Record<WhatsAppTemplateEventKey, string[]> = {
    registration_completed: [
      "https://elitsanatvesporkulubu.com/login",
      "veli@elitsanatvesporkulubu.com",
      "https://elitsanatvesporkulubu.com/login?setup=1",
    ],
    attendance_absent_manual: ["Test Sporcu", "Yuzme Elite Seansi", "09 Nisan 2026 18:00"],
    payment_reminder_manual: [
      "Test Sporcu",
      "3250 TL",
      "12.04.2026",
      "https://elitsanatvesporkulubu.com/login",
    ],
    report_card_updated: ["Test Sporcu", "https://elitsanatvesporkulubu.com/login"],
    bulk_broadcast: [parsed.data.message || "Bu bir test WhatsApp gonderimidir."],
  };

  try {
    await queueWhatsAppDispatch({
      organizationId: context.organizationId,
      eventKey: parsed.data.eventKey,
      recipientType: "lead",
      recipientName: "Test Alicisi",
      phone: parsed.data.phone,
      optInStatus: "opted_in",
      optInSource: "admin_test_send",
      payload: {
        variables: fallbackVariablesByEvent[parsed.data.eventKey],
      },
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Test gonderimi basarisiz oldu.",
      success: null,
    };
  }

  revalidatePath("/admin/settings");

  return {
    error: null,
    success: "Test dispatch olusturuldu. Meta baglantisi hazirsa hemen gonderildi.",
  };
}

export async function processWhatsAppQueueAction(): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  const processed = await processDueWhatsAppDispatches(25);
  revalidatePath("/admin/settings");

  await logAuditEvent({
    organizationId: context.organizationId,
    actorProfileId: context.auth?.userId,
    actorRole: context.auth?.role,
    eventType: "WhatsApp kuyrugu islendi",
    scope: "WhatsApp",
    entityType: "message_dispatches",
    payload: {
      processed,
    },
  });

  return {
    error: null,
    success: processed
      ? `${processed} WhatsApp dispatch isleme alindi.`
      : "Islenecek uygun kuyruk kaydi bulunmadi.",
  };
}
