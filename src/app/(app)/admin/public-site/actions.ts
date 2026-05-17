"use server";

import { revalidatePath } from "next/cache";

import { getActorOrganizationId, logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import { saveLandingContentToStorage, getLandingContentFromStorage } from "@/lib/landing-content-server";
import {
  archiveSeoPageInStorage,
  deleteCustomPublicPageFromStorage,
  duplicateCustomPublicPageInStorage,
  duplicateSeoPageInStorage,
  getCustomPublicPageBySlugFromStorage,
  listPublicPagesFromStorage,
  saveCustomPublicPageToStorage,
} from "@/lib/public-site-server";
import {
  createDefaultCustomPublicPage,
  isReservedPublicSlug,
  normalizeCustomPublicPageContent,
  type CustomPublicPageContent,
} from "@/lib/public-site";
import { mergeSeoPageContent, type SeoPageContent } from "@/lib/seo-pages";
import { saveSeoPageToStorage } from "@/lib/seo-pages-server";
import {
  createPublicPageSchema,
  duplicatePublicPageSchema,
  mutatePublicPageSchema,
  updatePublicPageSchema,
} from "@/lib/schemas/app-forms";
import { getSeoPageBySlugFromStorage } from "@/lib/seo-pages-server";

type ActionResult = {
  error: string | null;
  success: string | null;
};

type AdminAuthContext = NonNullable<Awaited<ReturnType<typeof getCurrentAuthContext>>> & {
  role: "admin";
  userId: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function requireAdmin(): Promise<AdminAuthContext | null> {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "admin" || !auth.userId) {
    return null;
  }

  return {
    ...auth,
    role: "admin",
    userId: auth.userId,
  };
}

function buildAffectedPaths(slug?: string) {
  return ["/admin", "/admin/public-site", "/sitemap.xml", slug ? `/${slug}` : null].filter(Boolean) as string[];
}

async function revalidatePublicSite(slug?: string) {
  for (const path of buildAffectedPaths(slug)) {
    revalidatePath(path);
  }

  revalidatePath("/");
  revalidatePath("/galeri");
}

async function ensureSlugAvailable(nextSlug: string, currentSlug?: string) {
  if (isReservedPublicSlug(nextSlug)) {
    return "Bu slug sistem tarafinda rezerve edilmis durumda.";
  }

  const publicPages = await listPublicPagesFromStorage();
  const collision = publicPages.pages.find(
    (page) =>
      page.slug === nextSlug &&
      page.slug !== currentSlug &&
      page.kind !== "home" &&
      !(page.kind === "gallery" && nextSlug === "galeri"),
  );

  if (collision) {
    return "Bu route baska bir public sayfa tarafindan kullaniliyor.";
  }

  return null;
}

export async function createPublicPageAction(formData: FormData): Promise<ActionResult> {
  const auth = await requireAdmin();

  if (!auth) {
    return { error: "Bu islem yalnizca admin tarafindan yapilabilir.", success: null };
  }

  const parsed = createPublicPageSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    template: formData.get("template"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Yeni sayfa verisi gecersiz.",
      success: null,
    };
  }

  const slugError = await ensureSlugAvailable(parsed.data.slug);
  if (slugError) {
    return { error: slugError, success: null };
  }

  const page = createDefaultCustomPublicPage(parsed.data);
  const result = await saveCustomPublicPageToStorage(page, auth.userId);

  if (result.error) {
    return { error: result.error, success: null };
  }

  const organizationId = await getActorOrganizationId(auth.userId);
  await logAuditEvent({
    organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Public sayfa olusturuldu",
    scope: "Public Site CMS",
    entityType: "homepage_settings",
    payload: {
      slug: parsed.data.slug,
      template: parsed.data.template,
      title: parsed.data.title,
    },
  });

  await revalidatePublicSite(parsed.data.slug);

  return {
    error: null,
    success: `${parsed.data.title} taslak olarak olusturuldu.`,
  };
}

export async function updatePublicPageAction(formData: FormData): Promise<ActionResult> {
  const auth = await requireAdmin();

  if (!auth) {
    return { error: "Bu islem yalnizca admin tarafindan yapilabilir.", success: null };
  }

  const parsed = updatePublicPageSchema.safeParse({
    kind: formData.get("kind"),
    slug: formData.get("slug"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Public sayfa verisi gecersiz.",
      success: null,
    };
  }

  let raw: unknown;

  try {
    raw = JSON.parse(parsed.data.content);
  } catch {
    return { error: "Sayfa JSON verisi okunamadi.", success: null };
  }

  if (!isRecord(raw)) {
    return { error: "Sayfa icerigi gecersiz.", success: null };
  }

  const nextSlug =
    parsed.data.kind === "seo"
      ? parsed.data.slug
      : typeof raw.slug === "string"
        ? raw.slug
        : parsed.data.slug;
  const slugError = await ensureSlugAvailable(nextSlug, parsed.data.slug);
  if (slugError) {
    return { error: slugError, success: null };
  }

  if (parsed.data.kind === "seo") {
    const current = await getSeoPageBySlugFromStorage(parsed.data.slug);

    if (!current.page) {
      return { error: "SEO sayfasi bulunamadi.", success: null };
    }

    const nextContent = mergeSeoPageContent(current.page, raw as Partial<SeoPageContent>);
    const result = await saveSeoPageToStorage(
      {
        ...nextContent,
        slug: nextSlug,
        canonicalPath:
          typeof raw.canonicalPath === "string" && raw.canonicalPath.startsWith("/")
            ? raw.canonicalPath
            : `/${nextSlug}`,
      },
      auth.userId,
    );

    if (result.error) {
      return { error: result.error, success: null };
    }
  } else {
    const current = await getCustomPublicPageBySlugFromStorage(parsed.data.slug);

    if (!current.page) {
      return { error: "Custom public sayfa bulunamadi.", success: null };
    }

    const nextContent = normalizeCustomPublicPageContent({
      ...current.page,
      ...(raw as Partial<CustomPublicPageContent>),
      slug: nextSlug,
      canonicalPath:
        typeof raw.canonicalPath === "string" && raw.canonicalPath.startsWith("/")
          ? raw.canonicalPath
          : `/${nextSlug}`,
    });

    const result = await saveCustomPublicPageToStorage(nextContent, auth.userId);

    if (result.error) {
      return { error: result.error, success: null };
    }

    if (nextSlug !== parsed.data.slug) {
      const deleteResult = await deleteCustomPublicPageFromStorage(parsed.data.slug);
      if (deleteResult.error) {
        return { error: deleteResult.error, success: null };
      }
    }
  }

  const organizationId = await getActorOrganizationId(auth.userId);
  await logAuditEvent({
    organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Public sayfa guncellendi",
    scope: "Public Site CMS",
    entityType: "homepage_settings",
    payload: {
      kind: parsed.data.kind,
      slug: nextSlug,
    },
  });

  await revalidatePublicSite(parsed.data.slug);
  if (nextSlug !== parsed.data.slug) {
    await revalidatePublicSite(nextSlug);
  }

  return { error: null, success: "Sayfa icerigi guncellendi." };
}

export async function mutatePublicPageAction(formData: FormData): Promise<ActionResult> {
  const auth = await requireAdmin();

  if (!auth) {
    return { error: "Bu islem yalnizca admin tarafindan yapilabilir.", success: null };
  }

  const parsed = mutatePublicPageSchema.safeParse({
    kind: formData.get("kind"),
    slug: formData.get("slug"),
    intent: formData.get("intent"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Sayfa aksiyonu gecersiz.",
      success: null,
    };
  }

  if (parsed.data.kind === "gallery") {
    const landing = await getLandingContentFromStorage();
    const nextContent = {
      ...landing.content,
      galleryPage: {
        ...landing.content.galleryPage,
        published: parsed.data.intent === "publish",
      },
    };

    const result = await saveLandingContentToStorage(nextContent, auth.userId);
    if (result.error) {
      return { error: result.error, success: null };
    }
  }

  if (parsed.data.kind === "seo") {
    const current = await getSeoPageBySlugFromStorage(parsed.data.slug);

    if (!current.page) {
      return { error: "SEO sayfasi bulunamadi.", success: null };
    }

    if (parsed.data.intent === "delete" || parsed.data.intent === "archive") {
      const result = await archiveSeoPageInStorage(parsed.data.slug, auth.userId);
      if (result.error) {
        return { error: result.error, success: null };
      }
    } else {
      const nextContent = mergeSeoPageContent(current.page, {
        published: parsed.data.intent === "publish",
        status: parsed.data.intent === "publish" ? "published" : "draft",
        includeInSitemap: parsed.data.intent === "publish" ? current.page.includeInSitemap : false,
        indexable: parsed.data.intent === "publish" ? current.page.indexable : false,
      });
      const result = await saveSeoPageToStorage(nextContent, auth.userId);
      if (result.error) {
        return { error: result.error, success: null };
      }
    }
  }

  if (parsed.data.kind === "custom") {
    if (parsed.data.intent === "delete") {
      const result = await deleteCustomPublicPageFromStorage(parsed.data.slug);
      if (result.error) {
        return { error: result.error, success: null };
      }
    } else {
      const current = await getCustomPublicPageBySlugFromStorage(parsed.data.slug);

      if (!current.page) {
        return { error: "Custom public sayfa bulunamadi.", success: null };
      }

      const nextContent = normalizeCustomPublicPageContent({
        ...current.page,
        published: parsed.data.intent === "publish",
        status:
          parsed.data.intent === "archive"
            ? "archived"
            : parsed.data.intent === "publish"
              ? "published"
              : "draft",
        includeInSitemap:
          parsed.data.intent === "publish" ? current.page.includeInSitemap : false,
        indexable: parsed.data.intent === "publish" ? current.page.indexable : false,
      });

      const result = await saveCustomPublicPageToStorage(nextContent, auth.userId);

      if (result.error) {
        return { error: result.error, success: null };
      }
    }
  }

  const organizationId = await getActorOrganizationId(auth.userId);
  await logAuditEvent({
    organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Public sayfa durumu guncellendi",
    scope: "Public Site CMS",
    entityType: "homepage_settings",
    payload: {
      kind: parsed.data.kind,
      slug: parsed.data.slug,
      intent: parsed.data.intent,
    },
  });

  await revalidatePublicSite(parsed.data.slug || undefined);

  return { error: null, success: "Sayfa aksiyonu tamamlandi." };
}

export async function duplicatePublicPageAction(formData: FormData): Promise<ActionResult> {
  const auth = await requireAdmin();

  if (!auth) {
    return { error: "Bu islem yalnizca admin tarafindan yapilabilir.", success: null };
  }

  const parsed = duplicatePublicPageSchema.safeParse({
    kind: formData.get("kind"),
    sourceSlug: formData.get("sourceSlug"),
    targetSlug: formData.get("targetSlug"),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Kopyalama verisi gecersiz.",
      success: null,
    };
  }

  const slugError = await ensureSlugAvailable(parsed.data.targetSlug);
  if (slugError) {
    return { error: slugError, success: null };
  }

  const result =
    parsed.data.kind === "seo"
      ? await duplicateSeoPageInStorage({
          sourceSlug: parsed.data.sourceSlug,
          targetSlug: parsed.data.targetSlug,
          title: parsed.data.title,
          updatedBy: auth.userId,
        })
      : await duplicateCustomPublicPageInStorage({
          sourceSlug: parsed.data.sourceSlug,
          targetSlug: parsed.data.targetSlug,
          title: parsed.data.title,
          updatedBy: auth.userId,
        });

  if (result.error) {
    return { error: result.error, success: null };
  }

  const organizationId = await getActorOrganizationId(auth.userId);
  await logAuditEvent({
    organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Public sayfa kopyalandi",
    scope: "Public Site CMS",
    entityType: "homepage_settings",
    payload: {
      kind: parsed.data.kind,
      sourceSlug: parsed.data.sourceSlug,
      targetSlug: parsed.data.targetSlug,
    },
  });

  await revalidatePublicSite(parsed.data.targetSlug);

  return { error: null, success: "Sayfa taslak olarak kopyalandi." };
}

export async function updateGallerySettingsAction(formData: FormData): Promise<ActionResult> {
  const auth = await requireAdmin();

  if (!auth) {
    return { error: "Bu islem yalnizca admin tarafindan yapilabilir.", success: null };
  }

  const landing = await getLandingContentFromStorage();
  const nextContent = {
    ...landing.content,
    galleryPage: {
      ...landing.content.galleryPage,
      published: formData.get("published") === "yes",
      indexable: formData.get("indexable") === "yes",
      includeInSitemap: formData.get("includeInSitemap") === "yes",
    },
  };

  const result = await saveLandingContentToStorage(nextContent, auth.userId);

  if (result.error) {
    return { error: result.error, success: null };
  }

  const organizationId = await getActorOrganizationId(auth.userId);
  await logAuditEvent({
    organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Galeri sayfasi guncellendi",
    scope: "Public Site CMS",
    entityType: "homepage_settings",
    payload: {
      published: nextContent.galleryPage.published,
      indexable: nextContent.galleryPage.indexable,
      includeInSitemap: nextContent.galleryPage.includeInSitemap,
    },
  });

  await revalidatePublicSite("galeri");

  return { error: null, success: "Galeri yayin ayarlari guncellendi." };
}
