import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentPage } from "@/components/ContentPage";
import { canPreview } from "@/lib/preview";
import { getSitePage } from "@/lib/sitePages";

type Args = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export const revalidate = 60;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const page = await getSitePage(slug);

  if (!page) {
    return {};
  }

  const image =
    typeof page.seo?.image === "object" && page.seo.image?.url
      ? page.seo.image.url
      : typeof page.hero.image === "object" && page.hero.image?.url
        ? page.hero.image.url
        : page.hero.externalImage || undefined;

  return {
    description: page.seo?.description || page.hero.summary || undefined,
    openGraph: {
      description: page.seo?.description || page.hero.summary || undefined,
      images: image ? [{ url: image }] : undefined,
      title: page.seo?.title || page.title,
    },
    title: page.seo?.title || page.title,
  };
}

export default async function ManagedContentPage({ params, searchParams }: Args) {
  const { slug } = await params;
  const page = await getSitePage(slug, await canPreview(searchParams));

  if (!page) {
    notFound();
  }

  return <ContentPage page={page} />;
}
