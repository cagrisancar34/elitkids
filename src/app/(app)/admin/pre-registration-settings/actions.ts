"use server";

import { revalidatePath } from "next/cache";

import { getActorOrganizationId, logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import { getOrCreateOrganizationContext } from "@/lib/organization-context";
import { updatePreRegistrationSettingsSchema } from "@/lib/schemas/app-forms";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type PreRegistrationSettingsActionState = {
  error: string | null;
  success: string | null;
};

export async function savePreRegistrationSettingsAction(
  _previousState: PreRegistrationSettingsActionState,
  formData: FormData,
): Promise<PreRegistrationSettingsActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "admin" || !auth.userId) {
    return {
      error: "Bu alan yalnizca admin tarafindan guncellenebilir.",
      success: null,
    };
  }

  const parsed = updatePreRegistrationSettingsSchema.safeParse({
    formEnabled: formData.get("formEnabled"),
    kvkkTitle: formData.get("kvkkTitle"),
    kvkkBody: formData.get("kvkkBody"),
    kvkkCheckboxLabel: formData.get("kvkkCheckboxLabel"),
    parentPermissionTitle: formData.get("parentPermissionTitle"),
    parentPermissionBody: formData.get("parentPermissionBody"),
    parentPermissionCheckboxLabel: formData.get("parentPermissionCheckboxLabel"),
    successMessage: formData.get("successMessage"),
    helperNote: formData.get("helperNote"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "On kayit ayarlari gecersiz.",
      success: null,
    };
  }

  const context = await getOrCreateOrganizationContext(auth.userId);

  if (context.error || !context.organizationId) {
    return {
      error: context.error ?? "Kurum baglami cozulmedi.",
      success: null,
    };
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return {
      error: "Supabase admin baglantisi kurulamadi.",
      success: null,
    };
  }

  const { error } = await adminClient.from("pre_registration_settings").upsert(
    {
      organization_id: context.organizationId,
      form_enabled: parsed.data.formEnabled === "enabled",
      kvkk_title: parsed.data.kvkkTitle,
      kvkk_body: parsed.data.kvkkBody,
      kvkk_checkbox_label: parsed.data.kvkkCheckboxLabel,
      parent_permission_title: parsed.data.parentPermissionTitle,
      parent_permission_body: parsed.data.parentPermissionBody,
      parent_permission_checkbox_label: parsed.data.parentPermissionCheckboxLabel,
      success_message: parsed.data.successMessage,
      helper_note: parsed.data.helperNote,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "organization_id" },
  );

  if (error) {
    return {
      error: error.message,
      success: null,
    };
  }

  await logAuditEvent({
    organizationId: await getActorOrganizationId(auth.userId),
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "On kayit metinleri guncellendi",
    scope: "On kayit ayarlari",
    entityType: "pre_registration_settings",
    payload: {
      formEnabled: parsed.data.formEnabled === "enabled",
    },
  });

  revalidatePath("/admin/pre-registration-settings");
  revalidatePath("/");

  return {
    error: null,
    success: "On kayit ayarlari guncellendi.",
  };
}
