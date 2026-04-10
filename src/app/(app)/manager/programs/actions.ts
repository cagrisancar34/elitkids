"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import { getOrCreateOrganizationContext } from "@/lib/organization-context";
import {
  archiveProgramSchema,
  createProgramSchema,
  updateProgramSchema,
} from "@/lib/schemas/app-forms";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type ProgramActionState = {
  error: string | null;
  success: string | null;
};

async function resolveProgramActionContext() {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "manager" && auth.role !== "admin") || !auth.userId) {
    return {
      auth: null,
      organizationId: null,
      adminClient: null,
      error: "Bu islem icin yetkin yok.",
    };
  }

  const organizationContext = await getOrCreateOrganizationContext(auth.userId);
  const adminClient = createSupabaseAdminClient();

  if (organizationContext.error || !organizationContext.organizationId || !adminClient) {
    return {
      auth: null,
      organizationId: null,
      adminClient: null,
      error: organizationContext.error ?? "Kurum baglami cozulmedi.",
    };
  }

  return {
    auth,
    organizationId: organizationContext.organizationId,
    adminClient,
    error: null,
  };
}

async function validateProgramReferences(
  adminClient: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  organizationId: string,
  input: {
    programTypeId: string;
    seasonId: string;
    categoryId: string;
    branchId: string;
    sportsBranchId: string;
    coachProfileId: string;
    areaId: string;
  },
) {
  const [programType, season, category, branch, sportsBranch, coach, area] = await Promise.all([
    adminClient.from("program_types").select("id").eq("organization_id", organizationId).eq("id", input.programTypeId).maybeSingle(),
    adminClient.from("seasons").select("id").eq("organization_id", organizationId).eq("id", input.seasonId).maybeSingle(),
    adminClient.from("categories").select("id").eq("organization_id", organizationId).eq("id", input.categoryId).maybeSingle(),
    adminClient.from("branches").select("id").eq("organization_id", organizationId).eq("id", input.branchId).maybeSingle(),
    adminClient.from("sports_branches").select("id").eq("organization_id", organizationId).eq("id", input.sportsBranchId).maybeSingle(),
    adminClient.from("profiles").select("id, organization_id").eq("id", input.coachProfileId).eq("organization_id", organizationId).maybeSingle(),
    adminClient.from("areas").select("id, branch_id").eq("organization_id", organizationId).eq("id", input.areaId).maybeSingle(),
  ]);

  if (!programType.data?.id) return "Program tipi bulunamadi.";
  if (!season.data?.id) return "Sezon bulunamadi.";
  if (!category.data?.id) return "Kategori bulunamadi.";
  if (!branch.data?.id) return "Sube bulunamadi.";
  if (!sportsBranch.data?.id) return "Brans bulunamadi.";
  if (!coach.data?.id) return "Egitmen bulunamadi.";
  if (!area.data?.id) return "Alan / Pist bulunamadi.";
  if (area.data.branch_id && area.data.branch_id !== input.branchId) return "Alan secili sube ile uyumlu olmali.";
  return null;
}

function refreshProgramViews() {
  revalidatePath("/manager");
  revalidatePath("/manager/programs");
  revalidatePath("/manager/sessions");
  revalidatePath("/manager/students");
}

export async function createProgramAction(
  _previousState: ProgramActionState,
  formData: FormData,
): Promise<ProgramActionState> {
  const context = await resolveProgramActionContext();

  if (context.error || !context.auth || !context.organizationId || !context.adminClient) {
    return {
      error: context.error ?? "Program icin gerekli baglam kurulamadi.",
      success: null,
    };
  }

  const parsed = createProgramSchema.safeParse({
    title: formData.get("title"),
    programTypeId: formData.get("programTypeId"),
    seasonId: formData.get("seasonId"),
    categoryId: formData.get("categoryId"),
    branchId: formData.get("branchId"),
    sportsBranchId: formData.get("sportsBranchId"),
    coachProfileId: formData.get("coachProfileId"),
    areaId: formData.get("areaId"),
    ageBand: formData.get("ageBand"),
    capacity: formData.get("capacity"),
    monthlyPrice: formData.get("monthlyPrice"),
    status: formData.get("status"),
    notes: formData.get("notes"),
    monthlyLessonQuota: formData.get("monthlyLessonQuota"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Program formu gecersiz.",
      success: null,
    };
  }

  const referenceError = await validateProgramReferences(context.adminClient, context.organizationId, parsed.data);
  if (referenceError) {
    return {
      error: referenceError,
      success: null,
    };
  }

  const { data: createdProgram, error: programError } = await context.adminClient
    .from("programs")
    .insert({
      organization_id: context.organizationId,
      title: parsed.data.title,
      age_band: parsed.data.ageBand,
      capacity: parsed.data.capacity,
      monthly_price: parsed.data.monthlyPrice,
      program_type_id: parsed.data.programTypeId,
      season_id: parsed.data.seasonId,
      category_id: parsed.data.categoryId,
      branch_id: parsed.data.branchId,
      sports_branch_id: parsed.data.sportsBranchId,
      coach_profile_id: parsed.data.coachProfileId,
      area_id: parsed.data.areaId,
      status: parsed.data.status,
      notes: parsed.data.notes,
      monthly_lesson_quota: parsed.data.monthlyLessonQuota,
    })
    .select("id")
    .single();

  if (programError || !createdProgram?.id) {
    return {
      error: programError?.message ?? "Program olusturulamadi.",
      success: null,
    };
  }

  const { error: feePlanError } = await context.adminClient.from("fee_plans").insert({
    organization_id: context.organizationId,
    title: `${parsed.data.title} Aylik`,
    amount: parsed.data.monthlyPrice,
    cadence: "monthly",
  });

  if (feePlanError) {
    return {
      error: feePlanError.message,
      success: null,
    };
  }

  refreshProgramViews();

  await logAuditEvent({
    organizationId: context.organizationId,
    actorProfileId: context.auth.userId,
    actorRole: context.auth.role,
    eventType: "Yeni program olusturuldu",
    scope: "Programlar",
    entityType: "programs",
    entityId: createdProgram.id,
    payload: parsed.data,
  });

  return {
    error: null,
    success: `${parsed.data.title} programi olusturuldu.`,
  };
}

export async function updateProgramAction(
  _previousState: ProgramActionState,
  formData: FormData,
): Promise<ProgramActionState> {
  const context = await resolveProgramActionContext();

  if (context.error || !context.auth || !context.organizationId || !context.adminClient) {
    return {
      error: context.error ?? "Program icin gerekli baglam kurulamadi.",
      success: null,
    };
  }

  const parsed = updateProgramSchema.safeParse({
    programId: formData.get("programId"),
    title: formData.get("title"),
    programTypeId: formData.get("programTypeId"),
    seasonId: formData.get("seasonId"),
    categoryId: formData.get("categoryId"),
    branchId: formData.get("branchId"),
    sportsBranchId: formData.get("sportsBranchId"),
    coachProfileId: formData.get("coachProfileId"),
    areaId: formData.get("areaId"),
    ageBand: formData.get("ageBand"),
    capacity: formData.get("capacity"),
    monthlyPrice: formData.get("monthlyPrice"),
    status: formData.get("status"),
    notes: formData.get("notes"),
    monthlyLessonQuota: formData.get("monthlyLessonQuota"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Program formu gecersiz.",
      success: null,
    };
  }

  const referenceError = await validateProgramReferences(context.adminClient, context.organizationId, parsed.data);
  if (referenceError) {
    return {
      error: referenceError,
      success: null,
    };
  }

  const { data: existingProgram, error: existingError } = await context.adminClient
    .from("programs")
    .select("id, title")
    .eq("id", parsed.data.programId)
    .eq("organization_id", context.organizationId)
    .maybeSingle();

  if (existingError || !existingProgram) {
    return {
      error: existingError?.message ?? "Program bulunamadi.",
      success: null,
    };
  }

  const { error: updateError } = await context.adminClient
    .from("programs")
    .update({
      title: parsed.data.title,
      age_band: parsed.data.ageBand,
      capacity: parsed.data.capacity,
      monthly_price: parsed.data.monthlyPrice,
      program_type_id: parsed.data.programTypeId,
      season_id: parsed.data.seasonId,
      category_id: parsed.data.categoryId,
      branch_id: parsed.data.branchId,
      sports_branch_id: parsed.data.sportsBranchId,
      coach_profile_id: parsed.data.coachProfileId,
      area_id: parsed.data.areaId,
      status: parsed.data.status,
      notes: parsed.data.notes,
      monthly_lesson_quota: parsed.data.monthlyLessonQuota,
    })
    .eq("id", parsed.data.programId)
    .eq("organization_id", context.organizationId);

  if (updateError) {
    return {
      error: updateError.message,
      success: null,
    };
  }

  const { error: feePlanError } = await context.adminClient
    .from("fee_plans")
    .update({
      title: `${parsed.data.title} Aylik`,
      amount: parsed.data.monthlyPrice,
    })
    .eq("organization_id", context.organizationId)
    .eq("title", `${existingProgram.title} Aylik`);

  if (feePlanError) {
    return {
      error: feePlanError.message,
      success: null,
    };
  }

  refreshProgramViews();

  await logAuditEvent({
    organizationId: context.organizationId,
    actorProfileId: context.auth.userId,
    actorRole: context.auth.role,
    eventType: "Program guncellendi",
    scope: "Programlar",
    entityType: "programs",
    entityId: parsed.data.programId,
    payload: parsed.data,
  });

  return {
    error: null,
    success: `${parsed.data.title} programi guncellendi.`,
  };
}

export async function archiveProgramAction(
  _previousState: ProgramActionState,
  formData: FormData,
): Promise<ProgramActionState> {
  const context = await resolveProgramActionContext();

  if (context.error || !context.auth || !context.organizationId || !context.adminClient) {
    return {
      error: context.error ?? "Program icin gerekli baglam kurulamadi.",
      success: null,
    };
  }

  const parsed = archiveProgramSchema.safeParse({
    programId: formData.get("programId"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Program secimi gecersiz.",
      success: null,
    };
  }

  const { data: program, error: programError } = await context.adminClient
    .from("programs")
    .select("id, title")
    .eq("id", parsed.data.programId)
    .eq("organization_id", context.organizationId)
    .maybeSingle();

  if (programError || !program) {
    return {
      error: programError?.message ?? "Program bulunamadi.",
      success: null,
    };
  }

  const { error: archiveError } = await context.adminClient
    .from("programs")
    .update({ archived_at: new Date().toISOString(), status: "paused" })
    .eq("id", program.id)
    .eq("organization_id", context.organizationId);

  if (archiveError) {
    return {
      error: archiveError.message,
      success: null,
    };
  }

  refreshProgramViews();

  await logAuditEvent({
    organizationId: context.organizationId,
    actorProfileId: context.auth.userId,
    actorRole: context.auth.role,
    eventType: "Program arsivlendi",
    scope: "Programlar",
    entityType: "programs",
    entityId: program.id,
    payload: { title: program.title },
  });

  return {
    error: null,
    success: `${program.title} arsive alindi.`,
  };
}
