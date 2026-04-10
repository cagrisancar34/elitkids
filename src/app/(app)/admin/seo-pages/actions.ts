"use server";

import { revalidatePath } from "next/cache";

import { getActorOrganizationId, logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import {
  getDefaultSeoPageBySlug,
  mergeSeoPageContent,
  type SeoPageContent,
} from "@/lib/seo-pages";
import { saveSeoPageToStorage } from "@/lib/seo-pages-server";
import { updateSeoPageContentSchema } from "@/lib/schemas/app-forms";

export type SeoPageEditorActionState = {
  error: string | null;
  success: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function updateSeoPageContentAction(
  _previousState: SeoPageEditorActionState,
  formData: FormData,
): Promise<SeoPageEditorActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "admin" || !auth.userId) {
    return {
      error: "Bu islem yalnizca admin tarafindan yapilabilir.",
      success: null,
    };
  }

  const parsed = updateSeoPageContentSchema.safeParse({
    slug: formData.get("slug"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "SEO sayfa formu gecersiz.",
      success: null,
    };
  }

  const fallback = getDefaultSeoPageBySlug(parsed.data.slug);

  if (!fallback) {
    return {
      error: "Guncellenmek istenen SEO sayfasi bulunamadi.",
      success: null,
    };
  }

  let nextContent: SeoPageContent;

  try {
    const raw = JSON.parse(parsed.data.content) as unknown;
    nextContent = mergeSeoPageContent(
      fallback,
      isRecord(raw) ? (raw as Partial<SeoPageContent>) : null,
    );
  } catch {
    return {
      error: "SEO sayfa JSON verisi okunamadi.",
      success: null,
    };
  }

  const result = await saveSeoPageToStorage(nextContent, auth.userId);

  if (result.error) {
    return {
      error: result.error,
      success: null,
    };
  }

  const organizationId = await getActorOrganizationId(auth.userId);
  await logAuditEvent({
    organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "SEO sayfasi guncellendi",
    scope: "SEO sayfalari",
    entityType: "homepage_settings",
    payload: {
      slug: nextContent.slug,
      published: nextContent.published,
      canonicalPath: nextContent.canonicalPath,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/seo-pages");
  revalidatePath(nextContent.canonicalPath);
  revalidatePath("/sitemap.xml");

  return {
    error: null,
    success: `${nextContent.title} sayfasi guncellendi.`,
  };
}
