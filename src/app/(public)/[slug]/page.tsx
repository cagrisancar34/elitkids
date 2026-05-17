import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicContentPage } from "@/components/public-content-page";
import { getLandingContentFromStorage } from "@/lib/landing-content-server";
import { buildSeoPageMetadata } from "@/lib/seo-metadata";
import { defaultSeoPages } from "@/lib/seo-pages";
import { resolvePublicRoute } from "@/lib/public-site-server";

export const dynamic = "force-dynamic";

type PublicContentPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return defaultSeoPages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: PublicContentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolvePublicRoute(slug);

  if (!resolved) {
    return {};
  }

  return buildSeoPageMetadata(resolved.page);
}

export default async function PublicDynamicPage({ params }: PublicContentPageProps) {
  const { slug } = await params;

  const [resolved, landingResult] = await Promise.all([
    resolvePublicRoute(slug),
    getLandingContentFromStorage(),
  ]);

  if (!resolved) {
    notFound();
  }

  return <PublicContentPage page={resolved.page} landingContent={landingResult.content} />;
}
