import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GalleryPageClient } from "@/components/gallery-page-client";
import { getLandingContentFromStorage } from "@/lib/landing-content-server";
import { siteName, siteUrl } from "@/lib/seo-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { content } = await getLandingContentFromStorage();
  const title = `${content.galleryPage.title} | ${siteName}`;
  const description = content.galleryPage.description;

  return {
    title,
    description,
    alternates: {
      canonical: "/galeri",
    },
    robots:
      content.galleryPage.indexable === false
        ? {
            index: false,
            follow: false,
          }
        : undefined,
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      url: `${siteUrl}/galeri`,
      locale: "tr_TR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function GalleryPage() {
  const { content } = await getLandingContentFromStorage();

  if (!content.galleryPage.published) {
    notFound();
  }

  const galleryJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: content.galleryPage.title,
    description: content.galleryPage.description,
    url: `${siteUrl}/galeri`,
    isPartOf: siteUrl,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Galeri",
        item: `${siteUrl}/galeri`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(galleryJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <GalleryPageClient content={content} />
    </>
  );
}
