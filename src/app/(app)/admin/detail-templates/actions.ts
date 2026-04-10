"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import { getOrCreateOrganizationContext } from "@/lib/organization-context";
import {
  createDetailQuestionSchema,
  deleteDetailQuestionSchema,
  toggleDetailQuestionStatusSchema,
  updateDetailQuestionSchema,
} from "@/lib/schemas/app-forms";
import { normalizeQuestionFieldKey, parseQuestionOptions } from "@/lib/student-reporting";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type TemplateActionState = {
  error: string | null;
  success: string | null;
};

async function getAdminTemplateContext() {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "admin" || !auth.userId) {
    return {
      auth: null,
      adminClient: null,
      organizationId: null,
      error: "Bu islem yalnizca admin tarafindan yapilabilir.",
    };
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return {
      auth: null,
      adminClient: null,
      organizationId: null,
      error: "Supabase yonetici baglantisi kurulamadi.",
    };
  }

  const organizationContext = await getOrCreateOrganizationContext(auth.userId);
  if (organizationContext.error || !organizationContext.organizationId) {
    return {
      auth: null,
      adminClient: null,
      organizationId: null,
      error: organizationContext.error ?? "Kurum baglami cozulmedi.",
    };
  }

  return {
    auth,
    adminClient,
    organizationId: organizationContext.organizationId,
    error: null,
  };
}

function revalidateTemplateSurfaces() {
  revalidatePath("/admin/detail-templates");
  revalidatePath("/manager/students");
  revalidatePath("/coach/students");
  revalidatePath("/parent/report-cards");
}

export async function createDetailQuestionAction(
  _previousState: TemplateActionState,
  formData: FormData,
): Promise<TemplateActionState> {
  const context = await getAdminTemplateContext();

  if (context.error || !context.auth || !context.adminClient || !context.organizationId) {
    return {
      error: context.error,
      success: null,
    };
  }

  const parsed = createDetailQuestionSchema.safeParse({
    label: formData.get("label"),
    fieldKey: normalizeQuestionFieldKey(String(formData.get("fieldKey") ?? formData.get("label") ?? "")),
    inputType: formData.get("inputType"),
    helperText: formData.get("helperText"),
    placeholder: formData.get("placeholder"),
    optionsText: formData.get("optionsText"),
    required: formData.get("required"),
    sortOrder: formData.get("sortOrder"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Soru formu gecersiz.",
      success: null,
    };
  }

  const { error } = await context.adminClient.from("student_detail_questions").insert({
    organization_id: context.organizationId,
    field_key: parsed.data.fieldKey,
    label: parsed.data.label,
    input_type: parsed.data.inputType,
    helper_text: parsed.data.helperText,
    placeholder: parsed.data.placeholder,
    options: parseQuestionOptions(parsed.data.optionsText),
    required: parsed.data.required === "yes",
    active: true,
    sort_order: parsed.data.sortOrder,
  });

  if (error) {
    return {
      error: error.message,
      success: null,
    };
  }

  revalidateTemplateSurfaces();

  await logAuditEvent({
    organizationId: context.organizationId,
    actorProfileId: context.auth.userId,
    actorRole: context.auth.role,
    eventType: "Detay sorusu olusturuldu",
    scope: "Detay Sorulari",
    entityType: "student_detail_questions",
    entityId: parsed.data.fieldKey,
    payload: parsed.data,
  });

  return {
    error: null,
    success: `${parsed.data.label} sorusu olusturuldu.`,
  };
}

export async function updateDetailQuestionAction(
  _previousState: TemplateActionState,
  formData: FormData,
): Promise<TemplateActionState> {
  const context = await getAdminTemplateContext();

  if (context.error || !context.auth || !context.adminClient || !context.organizationId) {
    return {
      error: context.error,
      success: null,
    };
  }

  const parsed = updateDetailQuestionSchema.safeParse({
    questionId: formData.get("questionId"),
    label: formData.get("label"),
    fieldKey: normalizeQuestionFieldKey(String(formData.get("fieldKey") ?? formData.get("label") ?? "")),
    inputType: formData.get("inputType"),
    helperText: formData.get("helperText"),
    placeholder: formData.get("placeholder"),
    optionsText: formData.get("optionsText"),
    required: formData.get("required"),
    sortOrder: formData.get("sortOrder"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Soru formu gecersiz.",
      success: null,
    };
  }

  const { error } = await context.adminClient
    .from("student_detail_questions")
    .update({
      field_key: parsed.data.fieldKey,
      label: parsed.data.label,
      input_type: parsed.data.inputType,
      helper_text: parsed.data.helperText,
      placeholder: parsed.data.placeholder,
      options: parseQuestionOptions(parsed.data.optionsText),
      required: parsed.data.required === "yes",
      sort_order: parsed.data.sortOrder,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.questionId)
    .eq("organization_id", context.organizationId);

  if (error) {
    return {
      error: error.message,
      success: null,
    };
  }

  revalidateTemplateSurfaces();

  return {
    error: null,
    success: `${parsed.data.label} sorusu guncellendi.`,
  };
}

export async function toggleDetailQuestionStatusAction(
  _previousState: TemplateActionState,
  formData: FormData,
): Promise<TemplateActionState> {
  const context = await getAdminTemplateContext();

  if (context.error || !context.auth || !context.adminClient || !context.organizationId) {
    return {
      error: context.error,
      success: null,
    };
  }

  const parsed = toggleDetailQuestionStatusSchema.safeParse({
    questionId: formData.get("questionId"),
    nextState: formData.get("nextState"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Soru secimi gecersiz.",
      success: null,
    };
  }

  const { error } = await context.adminClient
    .from("student_detail_questions")
    .update({
      active: parsed.data.nextState === "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.questionId)
    .eq("organization_id", context.organizationId);

  if (error) {
    return {
      error: error.message,
      success: null,
    };
  }

  revalidateTemplateSurfaces();

  return {
    error: null,
    success: parsed.data.nextState === "active" ? "Soru aktiflesti." : "Soru formdan cikarildi.",
  };
}

export async function deleteDetailQuestionAction(
  _previousState: TemplateActionState,
  formData: FormData,
): Promise<TemplateActionState> {
  const context = await getAdminTemplateContext();

  if (context.error || !context.auth || !context.adminClient || !context.organizationId) {
    return {
      error: context.error,
      success: null,
    };
  }

  const parsed = deleteDetailQuestionSchema.safeParse({
    questionId: formData.get("questionId"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Soru secimi gecersiz.",
      success: null,
    };
  }

  const { error } = await context.adminClient
    .from("student_detail_questions")
    .delete()
    .eq("id", parsed.data.questionId)
    .eq("organization_id", context.organizationId);

  if (error) {
    return {
      error: error.message,
      success: null,
    };
  }

  revalidateTemplateSurfaces();

  return {
    error: null,
    success: "Soru kalici olarak silindi.",
  };
}
