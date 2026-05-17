"use server";

import { revalidatePath } from "next/cache";

import { getActorOrganizationId, logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import { getMessageTopicByKey, updateMessageTopicForOrganization } from "@/lib/message-topics-server";
import { getOrCreateOrganizationContext } from "@/lib/organization-context";
import {
  createWhatsAppCampaignSchema,
  replySupportThreadSchema,
  updateMessageTopicSchema,
  updateSupportThreadStatusSchema,
} from "@/lib/schemas/app-forms";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { buildWebWhatsAppHref, createWhatsAppCampaign } from "@/lib/whatsapp-server";

export type CommunicationActionState = {
  error: string | null;
  success: string | null;
  manualWebWhatsAppHref?: string | null;
};

async function resolveManagerCommunicationContext() {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "admin" && auth.role !== "manager") || !auth.userId) {
    return {
      auth: null,
      organizationId: null,
      adminClient: null,
      error: "Bu islem icin yonetici veya admin yetkisi gerekli.",
    };
  }

  const organizationContext = await getOrCreateOrganizationContext(auth.userId);
  const adminClient = createSupabaseAdminClient();

  if (!organizationContext.organizationId || !adminClient) {
    return {
      auth: null,
      organizationId: organizationContext.organizationId ?? null,
      adminClient: null,
      error: organizationContext.error ?? "Supabase baglantisi kurulamadi.",
    };
  }

  return {
    auth,
    organizationId: organizationContext.organizationId,
    adminClient,
    error: null,
  };
}

export async function createWhatsAppCampaignAction(
  _previousState: CommunicationActionState,
  formData: FormData,
): Promise<CommunicationActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "admin" && auth.role !== "manager") || !auth.userId) {
    return {
      error: "Bu islem icin yonetici veya admin yetkisi gerekli.",
      success: null,
    };
  }

  const parsed = createWhatsAppCampaignSchema.safeParse({
    title: typeof formData.get("title") === "string" ? formData.get("title") : "",
    topicKey: typeof formData.get("topicKey") === "string" ? formData.get("topicKey") : "",
    audienceType:
      typeof formData.get("audienceType") === "string" ? formData.get("audienceType") : "",
    programId: typeof formData.get("programId") === "string" ? formData.get("programId") : "",
    branchId: typeof formData.get("branchId") === "string" ? formData.get("branchId") : "",
    sessionSeriesId:
      typeof formData.get("sessionSeriesId") === "string" ? formData.get("sessionSeriesId") : "",
    sendMode: typeof formData.get("sendMode") === "string" ? formData.get("sendMode") : "",
    managerNote:
      typeof formData.get("managerNote") === "string" ? formData.get("managerNote") : "",
    message: typeof formData.get("message") === "string" ? formData.get("message") : "",
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "WhatsApp kampanya formu gecersiz.",
      success: null,
      manualWebWhatsAppHref: null,
    };
  }

  const organizationContext = await getOrCreateOrganizationContext(auth.userId);
  if (!organizationContext.organizationId) {
    return {
      error: organizationContext.error ?? "Kurum baglami cozulmedi.",
      success: null,
      manualWebWhatsAppHref: null,
    };
  }

  const topic = await getMessageTopicByKey(organizationContext.organizationId, parsed.data.topicKey);
  if (!topic?.id || !topic.active) {
    return {
      error: "Secili mesaj konusu bulunamadi veya pasif durumda.",
      success: null,
      manualWebWhatsAppHref: null,
    };
  }

  const studentIds = formData
    .getAll("studentIds")
    .filter((value): value is string => typeof value === "string" && value.length > 0);
  const finalMessage = [parsed.data.message.trim(), parsed.data.managerNote.trim()]
    .filter(Boolean)
    .join("\n\n");

  if (parsed.data.sendMode === "web") {
    if (parsed.data.audienceType !== "specific_students" || studentIds.length !== 1) {
      return {
        error: "Web WhatsApp fallback yalnizca tek secili uye icin kullanilabilir.",
        success: null,
        manualWebWhatsAppHref: null,
      };
    }

    const adminClient = createSupabaseAdminClient();
    if (!adminClient) {
      return {
        error: "Supabase baglantisi kurulamadi.",
        success: null,
        manualWebWhatsAppHref: null,
      };
    }

    const { data: links } = await adminClient
      .from("parent_student_links")
      .select("parent_profile_id")
      .eq("student_id", studentIds[0]);

    const parentId = (links ?? [])[0]?.parent_profile_id ?? null;
    if (!parentId) {
      return {
        error: "Secili uye icin veli baglantisi bulunamadi.",
        success: null,
        manualWebWhatsAppHref: null,
      };
    }

    const { data: profile } = await adminClient
      .from("profiles")
      .select("phone, full_name")
      .eq("id", parentId)
      .maybeSingle();

    const manualWebWhatsAppHref = buildWebWhatsAppHref({
      phone: profile?.phone ?? null,
      message: finalMessage,
    });

    if (!manualWebWhatsAppHref) {
      return {
        error: "Secili uye velisi icin gecerli WhatsApp numarasi bulunamadi.",
        success: null,
        manualWebWhatsAppHref: null,
      };
    }

    await logAuditEvent({
      organizationId: await getActorOrganizationId(auth.userId),
      actorProfileId: auth.userId,
      actorRole: auth.role,
      eventType: "WhatsApp Web gonderim taslagi hazirlandi",
      scope: "Iletisim",
      entityType: "profiles",
      entityId: parentId,
      payload: {
        title: parsed.data.title,
        topicKey: parsed.data.topicKey,
        studentId: studentIds[0],
      },
    });

    return {
      error: null,
      success: `${profile?.full_name ?? "Secili veli"} icin Web WhatsApp mesaji hazirlandi.`,
      manualWebWhatsAppHref,
    };
  }

  try {
    await createWhatsAppCampaign({
      organizationId: organizationContext.organizationId,
      createdByProfileId: auth.userId,
      title: parsed.data.title,
      audienceType: parsed.data.audienceType,
      topicKey: parsed.data.topicKey,
      message: finalMessage,
      filters: {
        programId: parsed.data.programId || null,
        branchId: parsed.data.branchId || null,
        sessionSeriesId: parsed.data.sessionSeriesId || null,
        studentIds,
        topicKey: parsed.data.topicKey,
      },
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "WhatsApp kampanyasi olusturulamadi.",
      success: null,
      manualWebWhatsAppHref: null,
    };
  }

  await logAuditEvent({
    organizationId: await getActorOrganizationId(auth.userId),
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "WhatsApp kampanyasi baslatildi",
    scope: "Iletisim",
    entityType: "message_campaigns",
    payload: {
      title: parsed.data.title,
      topicKey: parsed.data.topicKey,
      audienceType: parsed.data.audienceType,
      programId: parsed.data.programId || null,
      branchId: parsed.data.branchId || null,
      sessionSeriesId: parsed.data.sessionSeriesId || null,
      studentIds,
    },
  });

  revalidatePath("/manager/communication");
  revalidatePath("/admin/settings");

  return {
    error: null,
    success: "WhatsApp kampanyasi olusturuldu ve kuyruga alindi.",
    manualWebWhatsAppHref: null,
  };
}

export async function updateManagerMessageTopicAction(
  _previousState: CommunicationActionState,
  formData: FormData,
): Promise<CommunicationActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "admin" && auth.role !== "manager") || !auth.userId) {
    return {
      error: "Bu islem icin yonetici veya admin yetkisi gerekli.",
      success: null,
      manualWebWhatsAppHref: null,
    };
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
      manualWebWhatsAppHref: null,
    };
  }

  const organizationContext = await getOrCreateOrganizationContext(auth.userId);
  if (!organizationContext.organizationId) {
    return {
      error: organizationContext.error ?? "Kurum baglami cozulmedi.",
      success: null,
      manualWebWhatsAppHref: null,
    };
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return {
      error: "Supabase baglantisi kurulamadi.",
      success: null,
      manualWebWhatsAppHref: null,
    };
  }

  const { data: topic } = await adminClient
    .from("message_topics")
    .select("id, topic_key, editable_by_manager")
    .eq("organization_id", organizationContext.organizationId)
    .eq("id", parsed.data.topicId)
    .maybeSingle();

  if (!topic?.id) {
    return {
      error: "Mesaj konusu bulunamadi.",
      success: null,
      manualWebWhatsAppHref: null,
    };
  }

  if (auth.role === "manager" && !topic.editable_by_manager) {
    return {
      error: "Bu mesaj konusu yalnizca admin tarafindan duzenlenebilir.",
      success: null,
      manualWebWhatsAppHref: null,
    };
  }

  await updateMessageTopicForOrganization({
    organizationId: organizationContext.organizationId,
    topicId: parsed.data.topicId,
    title: parsed.data.title,
    description: parsed.data.description,
    channel: parsed.data.channel,
    bodyTemplate: parsed.data.bodyTemplate,
    active: parsed.data.active === "yes",
  });

  await logAuditEvent({
    organizationId: await getActorOrganizationId(auth.userId),
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Operasyonel mesaj konusu guncellendi",
    scope: "Iletisim",
    entityType: "message_topics",
    entityId: parsed.data.topicId,
    payload: {
      topicKey: topic.topic_key,
    },
  });

  revalidatePath("/manager/communication");
  revalidatePath("/admin/settings");

  return {
    error: null,
    success: "Mesaj konusu guncellendi.",
    manualWebWhatsAppHref: null,
  };
}

export async function replyManagerSupportThreadAction(
  _previousState: CommunicationActionState,
  formData: FormData,
): Promise<CommunicationActionState> {
  const context = await resolveManagerCommunicationContext();

  if (context.error || !context.auth || !context.organizationId || !context.adminClient) {
    return {
      error: context.error ?? "Baglam kurulamadı.",
      success: null,
      manualWebWhatsAppHref: null,
    };
  }

  const parsed = replySupportThreadSchema.safeParse({
    threadId: formData.get("threadId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Yanıt formu gecersiz.",
      success: null,
      manualWebWhatsAppHref: null,
    };
  }

  const { data: thread, error: threadError } = await context.adminClient
    .from("support_threads")
    .select("id")
    .eq("id", parsed.data.threadId)
    .maybeSingle();

  if (threadError || !thread?.id) {
    return {
      error: "Destek talebi bulunamadi.",
      success: null,
      manualWebWhatsAppHref: null,
    };
  }

  const { error: messageError } = await context.adminClient.from("support_messages").insert({
    thread_id: thread.id,
    author_profile_id: context.auth.userId,
    body: parsed.data.body,
  });

  if (messageError) {
    return {
      error: messageError.message,
      success: null,
      manualWebWhatsAppHref: null,
    };
  }

  await context.adminClient
    .from("support_threads")
    .update({ status: "waiting_parent" })
    .eq("id", thread.id);

  await logAuditEvent({
    organizationId: await getActorOrganizationId(context.auth.userId),
    actorProfileId: context.auth.userId,
    actorRole: context.auth.role,
    eventType: "Destek talebine yanit verildi",
    scope: "Iletisim",
    entityType: "support_threads",
    entityId: thread.id,
    payload: {
      status: "waiting_parent",
      preview: parsed.data.body.slice(0, 120),
    },
  });

  revalidatePath("/manager/communication");
  revalidatePath("/parent/support");

  return {
    error: null,
    success: "Yanıt gonderildi.",
    manualWebWhatsAppHref: null,
  };
}

export async function updateManagerSupportThreadStatusAction(
  _previousState: CommunicationActionState,
  formData: FormData,
): Promise<CommunicationActionState> {
  const context = await resolveManagerCommunicationContext();

  if (context.error || !context.auth || !context.organizationId || !context.adminClient) {
    return {
      error: context.error ?? "Baglam kurulamadı.",
      success: null,
      manualWebWhatsAppHref: null,
    };
  }

  const parsed = updateSupportThreadStatusSchema.safeParse({
    threadId: formData.get("threadId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Durum formu gecersiz.",
      success: null,
      manualWebWhatsAppHref: null,
    };
  }

  const { error } = await context.adminClient
    .from("support_threads")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.threadId);

  if (error) {
    return {
      error: error.message,
      success: null,
      manualWebWhatsAppHref: null,
    };
  }

  await logAuditEvent({
    organizationId: await getActorOrganizationId(context.auth.userId),
    actorProfileId: context.auth.userId,
    actorRole: context.auth.role,
    eventType: "Destek talebi durumu guncellendi",
    scope: "Iletisim",
    entityType: "support_threads",
    entityId: parsed.data.threadId,
    payload: {
      status: parsed.data.status,
    },
  });

  revalidatePath("/manager/communication");
  revalidatePath("/parent/support");

  return {
    error: null,
    success: "Destek talebi durumu guncellendi.",
    manualWebWhatsAppHref: null,
  };
}
