"use server";

import { revalidatePath } from "next/cache";

import { getActorOrganizationId, logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import { getOrCreateOrganizationContext } from "@/lib/organization-context";
import { createWhatsAppCampaignSchema } from "@/lib/schemas/app-forms";
import { createWhatsAppCampaign } from "@/lib/whatsapp-server";

export type CommunicationActionState = {
  error: string | null;
  success: string | null;
};

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
    title: formData.get("title"),
    audienceType: formData.get("audienceType"),
    programId: formData.get("programId"),
    branchId: formData.get("branchId"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "WhatsApp kampanya formu gecersiz.",
      success: null,
    };
  }

  const organizationContext = await getOrCreateOrganizationContext(auth.userId);
  if (!organizationContext.organizationId) {
    return {
      error: organizationContext.error ?? "Kurum baglami cozulmedi.",
      success: null,
    };
  }

  try {
    await createWhatsAppCampaign({
      organizationId: organizationContext.organizationId,
      createdByProfileId: auth.userId,
      title: parsed.data.title,
      audienceType: parsed.data.audienceType,
      message: parsed.data.message,
      filters: {
        programId: parsed.data.programId || null,
        branchId: parsed.data.branchId || null,
      },
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "WhatsApp kampanyasi olusturulamadi.",
      success: null,
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
      audienceType: parsed.data.audienceType,
      programId: parsed.data.programId || null,
      branchId: parsed.data.branchId || null,
    },
  });

  revalidatePath("/manager/communication");
  revalidatePath("/admin/settings");

  return {
    error: null,
    success: "WhatsApp kampanyasi olusturuldu ve kuyruga alindi.",
  };
}
