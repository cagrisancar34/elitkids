import type { MetadataRoute } from "next";

import { getLandingContentFromStorage } from "@/lib/landing-content-server";
import { getCustomPublicPagesFromStorage, getPublishedSeoPagesFromStorage } from "@/lib/public-site-server";
import { siteUrl } from "@/lib/seo-metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ pages }, landingResult, customResult] = await Promise.all([
    getPublishedSeoPagesFromStorage(),
    getLandingContentFromStorage(),
    getCustomPublicPagesFromStorage(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  if (
    landingResult.content.galleryPage.published &&
    landingResult.content.galleryPage.includeInSitemap
  ) {
    staticEntries.push({
      url: `${siteUrl}/galeri`,
      lastModified: landingResult.updatedAt ? new Date(landingResult.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  const seoEntries: MetadataRoute.Sitemap = pages
    .filter((page) => page.content.includeInSitemap !== false)
    .map((page) => ({
      url: `${siteUrl}${page.content.canonicalPath}`,
      lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: page.slug === "silivri-spor-okulu" ? 0.9 : 0.8,
    }));

  const customEntries: MetadataRoute.Sitemap = customResult.pages
    .filter((page) => page.content.published && page.content.includeInSitemap)
    .map((page) => ({
      url: `${siteUrl}${page.content.canonicalPath}`,
      lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.65,
    }));

  return [...staticEntries, ...seoEntries, ...customEntries];
}
