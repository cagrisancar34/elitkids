import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import { getLandingContentFromStorage } from "@/lib/landing-content-server";
import {
  buildPublicPageRecord,
  buildPublicPageKey,
  createDefaultCustomPublicPage,
  customPublicPageStoragePrefix,
  getCustomPublicPageStorageSlug,
  getSlugFromCustomPublicStorageSlug,
  normalizeCustomPublicPageContent,
  type CustomPublicPageContent,
  type CustomPublicPageTemplate,
  type PublicPageDetail,
  type PublicPageRecord,
  type PublicPageStatus,
} from "@/lib/public-site";
import {
  getDefaultSeoPageBySlug,
  getSlugFromStorageSlug,
  mergeSeoPageContent,
  type SeoPageContent,
  type SeoPageStorageRecord,
} from "@/lib/seo-pages";
import {
  getPublishedSeoPagesFromStorage as getPublishedSeoPagesFromSeoStorage,
  getSeoPageBySlugFromStorage,
  getSeoPagesFromStorage,
  saveSeoPageToStorage,
} from "@/lib/seo-pages-server";

type HomepageSettingsRow = {
  slug: string;
  content: unknown;
  updated_at: string | null;
  updated_by: string | null;
};

type PublicPagesResult = {
  pages: PublicPageRecord[];
  landingContent: Awaited<ReturnType<typeof getLandingContentFromStorage>>["content"];
  landingUpdatedAt: string | null;
  seoPages: SeoPageStorageRecord[];
  customPages: Array<{ slug: string; content: CustomPublicPageContent; updatedAt: string | null; updatedBy: string | null }>;
  error: string | null;
};

export type PublicPageInventoryResult = {
  pages: PublicPageRecord[];
  error: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function getUpdaterNameMap(rows: HomepageSettingsRow[]) {
  const profileIds = Array.from(
    new Set(rows.map((row) => row.updated_by).filter((value): value is string => Boolean(value))),
  );

  if (profileIds.length === 0) {
    return new Map<string, string>();
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return new Map<string, string>();
  }

  const { data } = await adminClient
    .from("profiles")
    .select("id, full_name")
    .in("id", profileIds);

  return new Map((data ?? []).map((profile) => [profile.id, profile.full_name || "Admin"]));
}

export async function getCustomPublicPagesFromStorage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      pages: [] as Array<{
        slug: string;
        content: CustomPublicPageContent;
        updatedAt: string | null;
        updatedBy: string | null;
      }>,
      error: "Supabase baglantisi kurulamadi.",
    };
  }

  const { data, error } = await supabase
    .from("homepage_settings")
    .select("slug, content, updated_at, updated_by")
    .like("slug", `${customPublicPageStoragePrefix}%`);

  if (error) {
    return {
      pages: [] as Array<{
        slug: string;
        content: CustomPublicPageContent;
        updatedAt: string | null;
        updatedBy: string | null;
      }>,
      error: error.message,
    };
  }

  return {
    pages: (data ?? []).flatMap((row) => {
      if (!isRecord(row.content)) {
        return [];
      }

      const slug = getSlugFromCustomPublicStorageSlug(row.slug);
      const baseTitle =
        typeof row.content.title === "string" && row.content.title.trim()
          ? row.content.title
          : slug;

      const template: CustomPublicPageTemplate =
        typeof row.content.template === "string" &&
        ["content", "service", "guide", "campaign"].includes(row.content.template)
          ? (row.content.template as CustomPublicPageTemplate)
          : "content";

      const base = createDefaultCustomPublicPage({
        slug,
        title: baseTitle,
        template,
      });

      const content = normalizeCustomPublicPageContent({
        ...base,
        ...(row.content as Partial<CustomPublicPageContent>),
        slug,
        canonicalPath:
          typeof row.content.canonicalPath === "string" && row.content.canonicalPath.startsWith("/")
            ? row.content.canonicalPath
            : `/${slug}`,
      });

      return [
        {
          slug,
          content,
          updatedAt: row.updated_at ?? null,
          updatedBy: row.updated_by ?? null,
        },
      ];
    }),
    error: null,
  };
}

export async function listPublicPagesFromStorage(): Promise<PublicPagesResult> {
  const [landingResult, seoResult, customResult, supabase] = await Promise.all([
    getLandingContentFromStorage(),
    getSeoPagesFromStorage(),
    getCustomPublicPagesFromStorage(),
    createSupabaseServerClient(),
  ]);

  const [homeRowResult, seoRowsResult, customRowsResult] = supabase
    ? await Promise.all([
        supabase
          .from("homepage_settings")
          .select("slug, content, updated_at, updated_by")
          .eq("slug", "home")
          .maybeSingle(),
        supabase
          .from("homepage_settings")
          .select("slug, content, updated_at, updated_by")
          .like("slug", "seo-page:%"),
        supabase
          .from("homepage_settings")
          .select("slug, content, updated_at, updated_by")
          .like("slug", `${customPublicPageStoragePrefix}%`),
      ])
    : [
        { data: null, error: null },
        { data: [] as HomepageSettingsRow[], error: null },
        { data: [] as HomepageSettingsRow[], error: null },
      ];

  const homeRow = homeRowResult.data
    ? ([homeRowResult.data] as HomepageSettingsRow[])
    : [];
  const rows = [
    ...homeRow,
    ...((seoRowsResult.data as HomepageSettingsRow[] | null) ?? []),
    ...((customRowsResult.data as HomepageSettingsRow[] | null) ?? []),
  ];
  const updaterMap = await getUpdaterNameMap(rows);
  const seoRowMap = new Map(
    (((seoRowsResult.data as HomepageSettingsRow[] | null) ?? [])).map((row) => [
      getSlugFromStorageSlug(row.slug),
      row,
    ]),
  );

  const customPages = customResult.pages.map((page) => ({
    ...page,
    updatedBy: page.updatedBy ? updaterMap.get(page.updatedBy) ?? page.updatedBy : null,
  }));

  const pages: PublicPageRecord[] = [
    buildPublicPageRecord({
      kind: "home",
      slug: "",
      title: "Anasayfa",
      pageType: "Sistem",
      status: "published",
      published: true,
      indexable: true,
      includeInSitemap: true,
      deletable: false,
      updatedAt: landingResult.updatedAt,
      updatedBy: homeRow[0]?.updated_by ? updaterMap.get(homeRow[0].updated_by) ?? homeRow[0].updated_by : null,
    }),
    buildPublicPageRecord({
      kind: "gallery",
      slug: "galeri",
      title: landingResult.content.galleryPage.title,
      pageType: "Sistem",
      status: landingResult.content.galleryPage.published ? "published" : "draft",
      published: landingResult.content.galleryPage.published,
      indexable: landingResult.content.galleryPage.indexable,
      includeInSitemap: landingResult.content.galleryPage.includeInSitemap,
      deletable: false,
      updatedAt: landingResult.updatedAt,
      updatedBy: homeRow[0]?.updated_by ? updaterMap.get(homeRow[0].updated_by) ?? homeRow[0].updated_by : null,
    }),
    ...seoResult.pages.map((page) => {
      const row = seoRowMap.get(page.slug);
      return buildPublicPageRecord({
        kind: "seo",
        slug: page.slug,
        title: page.content.title,
        pageType: page.content.pageType,
        status: page.content.status ?? (page.content.published ? "published" : "draft"),
        published: page.content.published,
        indexable: typeof page.content.indexable === "boolean" ? page.content.indexable : true,
        includeInSitemap:
          typeof page.content.includeInSitemap === "boolean"
            ? page.content.includeInSitemap
            : page.content.published,
        deletable: true,
        updatedAt: page.updatedAt,
        updatedBy: row?.updated_by ? updaterMap.get(row.updated_by) ?? row.updated_by : null,
      });
    }),
    ...customPages.map((page) =>
      buildPublicPageRecord({
        kind: "custom",
        slug: page.slug,
        title: page.content.title,
        pageType: page.content.template,
        status: page.content.status,
        published: page.content.published,
        indexable: page.content.indexable,
        includeInSitemap: page.content.includeInSitemap,
        deletable: true,
        updatedAt: page.updatedAt,
        updatedBy: page.updatedBy,
      }),
    ),
  ];

  return {
    pages,
    landingContent: landingResult.content,
    landingUpdatedAt: landingResult.updatedAt,
    seoPages: seoResult.pages,
    customPages,
    error: landingResult.error ?? seoResult.error ?? customResult.error,
  };
}

export async function listPublicPageInventoryFromStorage(): Promise<PublicPageInventoryResult> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      pages: [],
      error: "Supabase baglantisi kurulamadi.",
    };
  }

  const { data, error } = await supabase
    .from("homepage_settings")
    .select("slug, content, updated_at, updated_by");

  if (error) {
    return {
      pages: [],
      error: error.message,
    };
  }

  const rows = (data as HomepageSettingsRow[] | null) ?? [];
  const updaterMap = await getUpdaterNameMap(rows);
  const rowMap = new Map(rows.map((row) => [row.slug, row]));
  const homeRow = rowMap.get("home");
  const homeContent = isRecord(homeRow?.content) ? homeRow.content : null;
  const galleryPage =
    homeContent && isRecord(homeContent.galleryPage) ? homeContent.galleryPage : null;

  const pages: PublicPageRecord[] = [
    buildPublicPageRecord({
      kind: "home",
      slug: "",
      title: "Anasayfa",
      pageType: "Sistem",
      status: "published",
      published: true,
      indexable: true,
      includeInSitemap: true,
      deletable: false,
      updatedAt: homeRow?.updated_at ?? null,
      updatedBy: homeRow?.updated_by ? updaterMap.get(homeRow.updated_by) ?? homeRow.updated_by : null,
    }),
    buildPublicPageRecord({
      kind: "gallery",
      slug: "galeri",
      title:
        galleryPage && typeof galleryPage.title === "string" && galleryPage.title.trim()
          ? galleryPage.title
          : "Galeri",
      pageType: "Sistem",
      status:
        galleryPage && typeof galleryPage.published === "boolean" && galleryPage.published
          ? "published"
          : "draft",
      published: galleryPage && typeof galleryPage.published === "boolean" ? galleryPage.published : false,
      indexable: galleryPage && typeof galleryPage.indexable === "boolean" ? galleryPage.indexable : true,
      includeInSitemap:
        galleryPage && typeof galleryPage.includeInSitemap === "boolean"
          ? galleryPage.includeInSitemap
          : true,
      deletable: false,
      updatedAt: homeRow?.updated_at ?? null,
      updatedBy: homeRow?.updated_by ? updaterMap.get(homeRow.updated_by) ?? homeRow.updated_by : null,
    }),
  ];

  for (const row of rows) {
    if (row.slug.startsWith("seo-page:")) {
      const slug = getSlugFromStorageSlug(row.slug);
      const base = getDefaultSeoPageBySlug(slug);
      if (!base || !isRecord(row.content)) {
        continue;
      }

      const content = mergeSeoPageContent(base, row.content as Partial<SeoPageContent>);
      pages.push(
        buildPublicPageRecord({
          kind: "seo",
          slug,
          title: content.title,
          pageType: content.pageType,
          status: content.status ?? (content.published ? "published" : "draft"),
          published: content.published,
          indexable: typeof content.indexable === "boolean" ? content.indexable : true,
          includeInSitemap:
            typeof content.includeInSitemap === "boolean" ? content.includeInSitemap : content.published,
          deletable: true,
          updatedAt: row.updated_at ?? null,
          updatedBy: row.updated_by ? updaterMap.get(row.updated_by) ?? row.updated_by : null,
        }),
      );
      continue;
    }

    if (row.slug.startsWith(customPublicPageStoragePrefix) && isRecord(row.content)) {
      const slug = getSlugFromCustomPublicStorageSlug(row.slug);
      const baseTitle =
        typeof row.content.title === "string" && row.content.title.trim() ? row.content.title : slug;
      const template: CustomPublicPageTemplate =
        typeof row.content.template === "string" &&
        ["content", "service", "guide", "campaign"].includes(row.content.template)
          ? (row.content.template as CustomPublicPageTemplate)
          : "content";
      const content = normalizeCustomPublicPageContent({
        ...createDefaultCustomPublicPage({
          slug,
          title: baseTitle,
          template,
        }),
        ...(row.content as Partial<CustomPublicPageContent>),
        slug,
      });

      pages.push(
        buildPublicPageRecord({
          kind: "custom",
          slug,
          title: content.title,
          pageType: content.template,
          status: content.status,
          published: content.published,
          indexable: content.indexable,
          includeInSitemap: content.includeInSitemap,
          deletable: true,
          updatedAt: row.updated_at ?? null,
          updatedBy: row.updated_by ? updaterMap.get(row.updated_by) ?? row.updated_by : null,
        }),
      );
    }
  }

  return {
    pages,
    error: null,
  };
}

export async function getPublicPageByIdentifier(identifier: string): Promise<PublicPageDetail | null> {
  if (identifier === "home") {
    const result = await getLandingContentFromStorage();
    return {
      kind: "home",
      key: "home",
      title: "Anasayfa",
      content: result.content,
    };
  }

  if (identifier === "gallery") {
    const result = await getLandingContentFromStorage();
    return {
      kind: "gallery",
      key: "gallery",
      title: result.content.galleryPage.title,
      content: result.content,
    };
  }

  if (identifier.startsWith("seo:")) {
    const slug = identifier.replace("seo:", "");
    const result = await getSeoPageBySlugFromStorage(slug);

    if (!result.page) {
      return null;
    }

    return {
      kind: "seo",
      key: buildPublicPageKey("seo", slug),
      title: result.page.title,
      content: result.page,
    };
  }

  if (identifier.startsWith("custom:")) {
    const slug = identifier.replace("custom:", "");
    const result = await getCustomPublicPageBySlugFromStorage(slug);

    if (!result.page) {
      return null;
    }

    return {
      kind: "custom",
      key: buildPublicPageKey("custom", slug),
      title: result.page.title,
      content: result.page,
    };
  }

  return null;
}

export async function getCustomPublicPageBySlugFromStorage(slug: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { page: null as CustomPublicPageContent | null, updatedAt: null, updatedBy: null, error: "Supabase baglantisi kurulamadi." };
  }

  const { data, error } = await supabase
    .from("homepage_settings")
    .select("content, updated_at, updated_by")
    .eq("slug", getCustomPublicPageStorageSlug(slug))
    .maybeSingle();

  if (error || !data || !isRecord(data.content)) {
    return { page: null as CustomPublicPageContent | null, updatedAt: null, updatedBy: null, error: error?.message ?? null };
  }

  const template: CustomPublicPageTemplate =
    typeof data.content.template === "string" &&
    ["content", "service", "guide", "campaign"].includes(data.content.template)
      ? (data.content.template as CustomPublicPageTemplate)
      : "content";

  const title =
    typeof data.content.title === "string" && data.content.title.trim()
      ? data.content.title
      : slug;

  const base = createDefaultCustomPublicPage({
    slug,
    title,
    template,
  });

  return {
    page: normalizeCustomPublicPageContent({
      ...base,
      ...(data.content as Partial<CustomPublicPageContent>),
      slug,
      canonicalPath:
        typeof data.content.canonicalPath === "string" && data.content.canonicalPath.startsWith("/")
          ? data.content.canonicalPath
          : `/${slug}`,
    }),
    updatedAt: data.updated_at ?? null,
    updatedBy: data.updated_by ?? null,
    error: null,
  };
}

export async function saveCustomPublicPageToStorage(
  content: CustomPublicPageContent,
  updatedBy: string,
) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return { error: "Supabase admin baglantisi kurulamadi." };
  }

  const { error } = await adminClient.from("homepage_settings").upsert(
    {
      slug: getCustomPublicPageStorageSlug(content.slug),
      content,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" },
  );

  return {
    error: error?.message ?? null,
  };
}

export async function deleteCustomPublicPageFromStorage(slug: string) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return { error: "Supabase admin baglantisi kurulamadi." };
  }

  const { error } = await adminClient
    .from("homepage_settings")
    .delete()
    .eq("slug", getCustomPublicPageStorageSlug(slug));

  return {
    error: error?.message ?? null,
  };
}

export async function archiveSeoPageInStorage(slug: string, updatedBy: string) {
  const fallback = getDefaultSeoPageBySlug(slug);

  if (!fallback) {
    return { error: "SEO sayfasi bulunamadi." };
  }

  const nextContent = mergeSeoPageContent(fallback, {
    published: false,
    status: "archived",
    indexable: false,
    includeInSitemap: false,
  });

  return saveSeoPageToStorage(nextContent, updatedBy);
}

export async function duplicateSeoPageInStorage(input: {
  sourceSlug: string;
  targetSlug: string;
  title: string;
  updatedBy: string;
}) {
  const source = await getSeoPageBySlugFromStorage(input.sourceSlug);

  if (!source.page) {
    return { error: "Kopyalanacak SEO sayfasi bulunamadi." };
  }

  const nextContent = createDefaultCustomPublicPage({
    slug: input.targetSlug,
    title: input.title,
    template: "service",
  });

  return saveCustomPublicPageToStorage(
    normalizeCustomPublicPageContent({
      ...nextContent,
      ...source.page,
      slug: input.targetSlug,
      title: input.title,
      seoTitle: `${input.title} | Elit Sanat ve Spor Kulubu`,
      canonicalPath: `/${input.targetSlug}`,
      template: "service",
      status: "draft",
      published: false,
      includeInSitemap: false,
    }),
    input.updatedBy,
  );
}

export async function duplicateCustomPublicPageInStorage(input: {
  sourceSlug: string;
  targetSlug: string;
  title: string;
  updatedBy: string;
}) {
  const source = await getCustomPublicPageBySlugFromStorage(input.sourceSlug);

  if (!source.page) {
    return { error: "Kopyalanacak public sayfa bulunamadi." };
  }

  return saveCustomPublicPageToStorage(
    normalizeCustomPublicPageContent({
      ...source.page,
      slug: input.targetSlug,
      title: input.title,
      seoTitle: `${input.title} | Elit Sanat ve Spor Kulubu`,
      canonicalPath: `/${input.targetSlug}`,
      status: "draft",
      published: false,
      includeInSitemap: false,
    }),
    input.updatedBy,
  );
}

export async function resolvePublicRoute(slug: string) {
  const seoFallback = getDefaultSeoPageBySlug(slug);

  if (seoFallback) {
    const result = await getSeoPageBySlugFromStorage(slug);
    const page = result.page;

    if (page && page.published && page.status !== "archived") {
      return {
        kind: "seo" as const,
        page,
      };
    }
  }

  const custom = await getCustomPublicPageBySlugFromStorage(slug);
  if (custom.page && custom.page.published && custom.page.status !== "archived") {
    return {
      kind: "custom" as const,
      page: custom.page,
    };
  }

  return null;
}

export function deriveStatusFromPublished(published: boolean, status?: PublicPageStatus) {
  if (status === "archived") {
    return "archived";
  }

  return published ? "published" : "draft";
}

export async function getPublishedSeoPagesFromStorage() {
  return getPublishedSeoPagesFromSeoStorage();
}
