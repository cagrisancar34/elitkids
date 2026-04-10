"use server";

import { revalidatePath } from "next/cache";

import { getActorOrganizationId, logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import { getOrCreateOrganizationContext } from "@/lib/organization-context";
import { createCatalogItemSchema } from "@/lib/schemas/app-forms";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type ProgramResourceActionState = {
  error: string | null;
  success: string | null;
};

const initialState: ProgramResourceActionState = {
  error: null,
  success: null,
};

type ResourceType = "programType" | "category" | "sportsBranch" | "area";

const resourceMap: Record<
  ResourceType,
  {
    table: "program_types" | "categories" | "sports_branches" | "areas";
    label: string;
  }
> = {
  programType: {
    table: "program_types",
    label: "Program tipi",
  },
  category: {
    table: "categories",
    label: "Kategori",
  },
  sportsBranch: {
    table: "sports_branches",
    label: "Brans",
  },
  area: {
    table: "areas",
    label: "Alan / Pist",
  },
};

function slugify(input: string) {
  return input
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

async function createCatalogResource(
  resourceType: ResourceType,
  formData: FormData,
): Promise<ProgramResourceActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "admin" || !auth.userId) {
    return {
      error: "Bu alan yalnizca admin tarafindan guncellenebilir.",
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

  const context = await getOrCreateOrganizationContext(auth.userId);

  if (context.error || !context.organizationId) {
    return {
      error: context.error ?? "Kurum baglami cozulmedi.",
      success: null,
    };
  }

  const rawName = String(formData.get("name") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const branchIdRaw = String(formData.get("branchId") ?? "").trim();

  const parsed = createCatalogItemSchema.safeParse({
    name: rawName,
    slug: rawSlug || slugify(rawName),
    branchId: branchIdRaw || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? `${resourceMap[resourceType].label} bilgisi gecersiz.`,
      success: null,
    };
  }

  const payload: Record<string, unknown> = {
    organization_id: context.organizationId,
    name: parsed.data.name,
    slug: parsed.data.slug,
  };

  if (resourceType === "area") {
    payload.branch_id = parsed.data.branchId ?? null;
  }

  const { data, error } = await adminClient
    .from(resourceMap[resourceType].table)
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    const duplicate =
      error.code === "23505"
        ? `${resourceMap[resourceType].label} slug'i zaten kullanimda.`
        : error.message;

    return {
      error: duplicate,
      success: null,
    };
  }

  await logAuditEvent({
    organizationId: await getActorOrganizationId(auth.userId),
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: `${resourceMap[resourceType].label} olusturuldu`,
    scope: "Program kaynaklari",
    entityType: resourceMap[resourceType].table,
    entityId: data.id,
    payload: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      branchId: parsed.data.branchId ?? null,
    },
  });

  revalidatePath("/admin/program-resources");
  revalidatePath("/manager/programs");
  revalidatePath("/manager/sessions");

  return {
    error: null,
    success: `${resourceMap[resourceType].label} eklendi.`,
  };
}

export async function createProgramTypeAction(
  _previousState: ProgramResourceActionState,
  formData: FormData,
): Promise<ProgramResourceActionState> {
  return createCatalogResource("programType", formData);
}

export async function createCategoryAction(
  _previousState: ProgramResourceActionState,
  formData: FormData,
): Promise<ProgramResourceActionState> {
  return createCatalogResource("category", formData);
}

export async function createSportsBranchAction(
  _previousState: ProgramResourceActionState,
  formData: FormData,
): Promise<ProgramResourceActionState> {
  return createCatalogResource("sportsBranch", formData);
}

export async function createAreaAction(
  _previousState: ProgramResourceActionState,
  formData: FormData,
): Promise<ProgramResourceActionState> {
  return createCatalogResource("area", formData);
}

export async function deleteCatalogResourceAction(
  _previousState: ProgramResourceActionState,
  formData: FormData,
): Promise<ProgramResourceActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "admin" || !auth.userId) {
    return {
      error: "Bu alan yalnizca admin tarafindan guncellenebilir.",
      success: null,
    };
  }

  const resourceType = String(formData.get("resourceType") ?? "") as ResourceType;
  const resourceId = String(formData.get("resourceId") ?? "").trim();

  if (!(resourceType in resourceMap) || !resourceId) {
    return {
      error: "Silinecek kaynak secilemedi.",
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

  const { error } = await adminClient.from(resourceMap[resourceType].table).delete().eq("id", resourceId);

  if (error) {
    return {
      error:
        error.code === "23503"
          ? "Bu kaynak aktif program veya seanslarda kullaniliyor; once bagli kayitlari guncelle."
          : error.message,
      success: null,
    };
  }

  await logAuditEvent({
    organizationId: await getActorOrganizationId(auth.userId),
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: `${resourceMap[resourceType].label} silindi`,
    scope: "Program kaynaklari",
    entityType: resourceMap[resourceType].table,
    entityId: resourceId,
  });

  revalidatePath("/admin/program-resources");
  revalidatePath("/manager/programs");
  revalidatePath("/manager/sessions");

  return {
    error: null,
    success: `${resourceMap[resourceType].label} kaldirildi.`,
  };
}

export { initialState as initialProgramResourceActionState };
