import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import {
  defaultSeoPages,
  getDefaultSeoPageBySlug,
  getSeoPageStorageSlug,
  getSlugFromStorageSlug,
  mergeSeoPageContent,
  type SeoPageContent,
  type SeoPageStorageRecord,
} from "@/lib/seo-pages";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type SeoPagesResult = {
  pages: SeoPageStorageRecord[];
  error: string | null;
};

function normalizeSeoPageError(code: string | undefined, message: string) {
  if (code === "PGRST205") {
    return "SEO sayfa kayitlari henuz hazir degil. Varsayilan icerik gosteriliyor.";
  }

  return message;
}

export async function getSeoPagesFromStorage(): Promise<SeoPagesResult> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      pages: defaultSeoPages.map((page) => ({
        slug: page.slug,
        content: page,
        updatedAt: null,
      })),
      error: "Supabase baglantisi kurulamadi.",
    };
  }

  const { data, error } = await supabase
    .from("homepage_settings")
    .select("slug, content, updated_at")
    .like("slug", "seo-page:%");

  if (error) {
    return {
      pages: defaultSeoPages.map((page) => ({
        slug: page.slug,
        content: page,
        updatedAt: null,
      })),
      error: normalizeSeoPageError(error.code, error.message),
    };
  }

  const storedBySlug = new Map(
    (data ?? []).map((row) => [getSlugFromStorageSlug(row.slug), row]),
  );

  return {
    pages: defaultSeoPages.map((page) => {
      const row = storedBySlug.get(page.slug);

      return {
        slug: page.slug,
        content: mergeSeoPageContent(
          page,
          isRecord(row?.content) ? (row.content as Partial<SeoPageContent>) : null,
        ),
        updatedAt: row?.updated_at ?? null,
      };
    }),
    error: null,
  };
}

export async function getSeoPageBySlugFromStorage(slug: string) {
  const fallback = getDefaultSeoPageBySlug(slug);

  if (!fallback) {
    return {
      page: null,
      updatedAt: null,
      error: null,
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      page: fallback,
      updatedAt: null,
      error: "Supabase baglantisi kurulamadi.",
    };
  }

  const { data, error } = await supabase
    .from("homepage_settings")
    .select("content, updated_at")
    .eq("slug", getSeoPageStorageSlug(slug))
    .maybeSingle();

  if (error) {
    return {
      page: fallback,
      updatedAt: null,
      error: normalizeSeoPageError(error.code, error.message),
    };
  }

  return {
    page: mergeSeoPageContent(
      fallback,
      isRecord(data?.content) ? (data.content as Partial<SeoPageContent>) : null,
    ),
    updatedAt: data?.updated_at ?? null,
    error: null,
  };
}

export async function saveSeoPageToStorage(content: SeoPageContent, updatedBy: string) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return {
      error: "Supabase admin baglantisi kurulamadi.",
    };
  }

  const { error } = await adminClient.from("homepage_settings").upsert(
    {
      slug: getSeoPageStorageSlug(content.slug),
      content,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" },
  );

  return {
    error: error ? normalizeSeoPageError(error.code, error.message) : null,
  };
}

export async function getPublishedSeoPagesFromStorage() {
  const result = await getSeoPagesFromStorage();

  return {
    pages: result.pages.filter((page) => page.content.published),
    error: result.error,
  };
}
