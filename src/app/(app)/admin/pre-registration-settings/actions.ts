"use server";

import { revalidatePath } from "next/cache";

import { getActorOrganizationId, logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import { getOrCreateOrganizationContext } from "@/lib/organization-context";
import {
  createPreRegistrationFieldSchema,
  deletePreRegistrationFieldSchema,
  reorderPreRegistrationFieldsSchema,
  togglePreRegistrationFieldStatusSchema,
  updatePreRegistrationFieldSchema,
  updatePreRegistrationSettingsSchema,
} from "@/lib/schemas/app-forms";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type PreRegistrationSettingsActionState = {
  error: string | null;
  success: string | null;
};

export type PreRegistrationFieldActionState = {
  error: string | null;
  success: string | null;
};

function parseFieldOptions(input: string) {
  return input
    .split(",")
    .map((option) => option.trim())
    .filter(Boolean);
}

function normalizeFieldKey(value: string) {
  const sanitized = value
    .trim()
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return sanitized.length ? sanitized : "alan";
}

async function getAdminPreRegistrationContext() {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "admin" || !auth.userId) {
    return {
      auth: null,
      organizationId: null,
      adminClient: null,
      error: "Bu alan yalnizca admin tarafindan guncellenebilir.",
    };
  }

  const context = await getOrCreateOrganizationContext(auth.userId);

  if (context.error || !context.organizationId) {
    return {
      auth: null,
      organizationId: null,
      adminClient: null,
      error: context.error ?? "Kurum baglami cozulmedi.",
    };
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return {
      auth: null,
      organizationId: context.organizationId,
      adminClient: null,
      error: "Supabase admin baglantisi kurulamadi.",
    };
  }

  return {
    auth,
    organizationId: context.organizationId,
    adminClient,
    error: null,
  };
}

function revalidatePreRegistrationSurfaces() {
  revalidatePath("/admin/pre-registration-settings");
  revalidatePath("/manager/pre-registrations");
  revalidatePath("/");
}

export async function savePreRegistrationSettingsAction(
  _previousState: PreRegistrationSettingsActionState,
  formData: FormData,
): Promise<PreRegistrationSettingsActionState> {
  const context = await getAdminPreRegistrationContext();

  if (context.error || !context.auth || !context.organizationId || !context.adminClient) {
    return {
      error: context.error ?? "Bu alan yalnizca admin tarafindan guncellenebilir.",
      success: null,
    };
  }

  const parsed = updatePreRegistrationSettingsSchema.safeParse({
    formEnabled: formData.get("formEnabled"),
    formEyebrow: formData.get("formEyebrow"),
    formTitle: formData.get("formTitle"),
    formDescription: formData.get("formDescription"),
    formLogoUrl: formData.get("formLogoUrl"),
    formLogoPath: formData.get("formLogoPath"),
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

  const { error } = await context.adminClient.from("pre_registration_settings").upsert(
    {
      organization_id: context.organizationId,
      form_enabled: parsed.data.formEnabled === "enabled",
      form_eyebrow: parsed.data.formEyebrow,
      form_title: parsed.data.formTitle,
      form_description: parsed.data.formDescription,
      form_logo_url: parsed.data.formLogoUrl || null,
      form_logo_path: parsed.data.formLogoPath || null,
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
    organizationId: await getActorOrganizationId(context.auth.userId),
    actorProfileId: context.auth.userId,
    actorRole: context.auth.role,
    eventType: "On kayit metinleri guncellendi",
    scope: "On kayit ayarlari",
    entityType: "pre_registration_settings",
    payload: {
      formEnabled: parsed.data.formEnabled === "enabled",
    },
  });

  revalidatePreRegistrationSurfaces();

  return {
    error: null,
    success: "On kayit ayarlari guncellendi.",
  };
}

export async function createPreRegistrationFieldAction(
  _previousState: PreRegistrationFieldActionState,
  formData: FormData,
): Promise<PreRegistrationFieldActionState> {
  const context = await getAdminPreRegistrationContext();

  if (context.error || !context.auth || !context.organizationId || !context.adminClient) {
    return {
      error: context.error ?? "Bu alan yalnizca admin tarafindan guncellenebilir.",
      success: null,
    };
  }

  const parsed = createPreRegistrationFieldSchema.safeParse({
    label: formData.get("label"),
    fieldKey: normalizeFieldKey(String(formData.get("fieldKey") ?? "")),
    inputType: formData.get("inputType"),
    helperText: formData.get("helperText"),
    placeholder: formData.get("placeholder"),
    optionsText: formData.get("optionsText"),
    required: formData.get("required"),
    active: formData.get("active"),
    sortOrder: formData.get("sortOrder"),
    section: formData.get("section"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Alan formu gecersiz.",
      success: null,
    };
  }

  const { error } = await context.adminClient.from("pre_registration_form_fields").insert({
    organization_id: context.organizationId,
    field_key: parsed.data.fieldKey,
    label: parsed.data.label,
    input_type: parsed.data.inputType,
    helper_text: parsed.data.helperText,
    placeholder: parsed.data.placeholder,
    options: parseFieldOptions(parsed.data.optionsText),
    required: parsed.data.required === "yes",
    active: parsed.data.active === "yes",
    sort_order: parsed.data.sortOrder,
    section: parsed.data.section,
    system: false,
  });

  if (error) {
    return {
      error: error.message,
      success: null,
    };
  }

  revalidatePreRegistrationSurfaces();

  await logAuditEvent({
    organizationId: await getActorOrganizationId(context.auth.userId),
    actorProfileId: context.auth.userId,
    actorRole: context.auth.role,
    eventType: "On kayit form alani olusturuldu",
    scope: "On kayit formu",
    entityType: "pre_registration_form_fields",
    entityId: parsed.data.fieldKey,
    payload: parsed.data,
  });

  return {
    error: null,
    success: `${parsed.data.label} alani olusturuldu.`,
  };
}

export async function updatePreRegistrationFieldAction(
  _previousState: PreRegistrationFieldActionState,
  formData: FormData,
): Promise<PreRegistrationFieldActionState> {
  const context = await getAdminPreRegistrationContext();

  if (context.error || !context.auth || !context.organizationId || !context.adminClient) {
    return {
      error: context.error ?? "Bu alan yalnizca admin tarafindan guncellenebilir.",
      success: null,
    };
  }

  const parsed = updatePreRegistrationFieldSchema.safeParse({
    fieldId: formData.get("fieldId"),
    label: formData.get("label"),
    helperText: formData.get("helperText"),
    placeholder: formData.get("placeholder"),
    optionsText: formData.get("optionsText"),
    required: formData.get("required"),
    active: formData.get("active"),
    sortOrder: formData.get("sortOrder"),
    section: formData.get("section"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Alan formu gecersiz.",
      success: null,
    };
  }

  const { error } = await context.adminClient
    .from("pre_registration_form_fields")
    .update({
      label: parsed.data.label,
      helper_text: parsed.data.helperText,
      placeholder: parsed.data.placeholder,
      options: parseFieldOptions(parsed.data.optionsText),
      required: parsed.data.required === "yes",
      active: parsed.data.active === "yes",
      sort_order: parsed.data.sortOrder,
      section: parsed.data.section,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.fieldId)
    .eq("organization_id", context.organizationId);

  if (error) {
    return {
      error: error.message,
      success: null,
    };
  }

  revalidatePreRegistrationSurfaces();

  return {
    error: null,
    success: "Form alani guncellendi.",
  };
}

export async function togglePreRegistrationFieldStatusAction(
  _previousState: PreRegistrationFieldActionState,
  formData: FormData,
): Promise<PreRegistrationFieldActionState> {
  const context = await getAdminPreRegistrationContext();

  if (context.error || !context.auth || !context.organizationId || !context.adminClient) {
    return {
      error: context.error ?? "Bu alan yalnizca admin tarafindan guncellenebilir.",
      success: null,
    };
  }

  const parsed = togglePreRegistrationFieldStatusSchema.safeParse({
    fieldId: formData.get("fieldId"),
    nextState: formData.get("nextState"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Alan secimi gecersiz.",
      success: null,
    };
  }

  const { error } = await context.adminClient
    .from("pre_registration_form_fields")
    .update({
      active: parsed.data.nextState === "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.fieldId)
    .eq("organization_id", context.organizationId);

  if (error) {
    return {
      error: error.message,
      success: null,
    };
  }

  revalidatePreRegistrationSurfaces();

  return {
    error: null,
    success: parsed.data.nextState === "active" ? "Alan forma geri alindi." : "Alan formdan cikarildi.",
  };
}

export async function deletePreRegistrationFieldAction(
  _previousState: PreRegistrationFieldActionState,
  formData: FormData,
): Promise<PreRegistrationFieldActionState> {
  const context = await getAdminPreRegistrationContext();

  if (context.error || !context.auth || !context.organizationId || !context.adminClient) {
    return {
      error: context.error ?? "Bu alan yalnizca admin tarafindan guncellenebilir.",
      success: null,
    };
  }

  const parsed = deletePreRegistrationFieldSchema.safeParse({
    fieldId: formData.get("fieldId"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Alan secimi gecersiz.",
      success: null,
    };
  }

  const { data: record } = await context.adminClient
    .from("pre_registration_form_fields")
    .select("system, label")
    .eq("id", parsed.data.fieldId)
    .eq("organization_id", context.organizationId)
    .maybeSingle();

  if (record?.system) {
    return {
      error: "Sistem alanlari kalici silinemez. Istersen formdan cikarabilirsin.",
      success: null,
    };
  }

  const { error } = await context.adminClient
    .from("pre_registration_form_fields")
    .delete()
    .eq("id", parsed.data.fieldId)
    .eq("organization_id", context.organizationId);

  if (error) {
    return {
      error: error.message,
      success: null,
    };
  }

  revalidatePreRegistrationSurfaces();

  return {
    error: null,
    success: `${record?.label ?? "Alan"} kalici olarak silindi.`,
  };
}

export async function reorderPreRegistrationFieldsAction(
  _previousState: PreRegistrationFieldActionState,
  formData: FormData,
): Promise<PreRegistrationFieldActionState> {
  const context = await getAdminPreRegistrationContext();

  if (context.error || !context.auth || !context.organizationId || !context.adminClient) {
    return {
      error: context.error ?? "Bu alan yalnizca admin tarafindan guncellenebilir.",
      success: null,
    };
  }

  const parsed = reorderPreRegistrationFieldsSchema.safeParse({
    layout: formData.get("layout"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Alan sirasi gecersiz.",
      success: null,
    };
  }

  const updates = parsed.data.layout.map((item) =>
    context.adminClient
      .from("pre_registration_form_fields")
      .update({
        section: item.section,
        sort_order: item.sortOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .eq("organization_id", context.organizationId),
  );

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    return {
      error: failed.error.message,
      success: null,
    };
  }

  revalidatePreRegistrationSurfaces();

  await logAuditEvent({
    organizationId: await getActorOrganizationId(context.auth.userId),
    actorProfileId: context.auth.userId,
    actorRole: context.auth.role,
    eventType: "On kayit alan sirasi guncellendi",
    scope: "On kayit formu",
    entityType: "pre_registration_form_fields",
    payload: {
      updatedCount: parsed.data.layout.length,
    },
  });

  return {
    error: null,
    success: "Alan yerlesimi guncellendi.",
  };
}
