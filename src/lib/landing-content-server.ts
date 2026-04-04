import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import {
  defaultLandingContent,
  mergeLandingContent,
  type LandingContent,
} from "@/lib/landing-content";

const HOMEPAGE_SLUG = "home";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type LandingContentResult = {
  content: LandingContent;
  updatedAt: string | null;
  error: string | null;
};

function normalizeLandingContentError(code: string | undefined, message: string) {
  if (code === "PGRST205") {
    return "Landing content tablosu henuz hazir degil. 0005_homepage_content.sql migration dosyasini calistir.";
  }

  return message;
}

export async function getLandingContentFromStorage(): Promise<LandingContentResult> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      content: defaultLandingContent,
      updatedAt: null,
      error: "Supabase baglantisi kurulamadi.",
    };
  }

  const { data, error } = await supabase
    .from("homepage_settings")
    .select("content, updated_at")
    .eq("slug", HOMEPAGE_SLUG)
    .maybeSingle();

  if (error) {
    return {
      content: defaultLandingContent,
      updatedAt: null,
      error: normalizeLandingContentError(error.code, error.message),
    };
  }

  return {
    content: mergeLandingContent(
      defaultLandingContent,
      isRecord(data?.content) ? (data.content as Partial<LandingContent>) : null,
    ),
    updatedAt: data?.updated_at ?? null,
    error: null,
  };
}

export async function saveLandingContentToStorage(
  content: LandingContent,
  updatedBy: string,
) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return {
      error: "Supabase admin baglantisi kurulamadi.",
    };
  }

  const { error } = await adminClient.from("homepage_settings").upsert(
    {
      slug: HOMEPAGE_SLUG,
      content,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" },
  );

  return {
    error: error ? normalizeLandingContentError(error.code, error.message) : null,
  };
}
