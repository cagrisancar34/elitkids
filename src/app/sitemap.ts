import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo-metadata";
import { getPublishedSeoPagesFromStorage } from "@/lib/seo-pages-server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { pages } = await getPublishedSeoPagesFromStorage();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const seoEntries: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${siteUrl}${page.content.canonicalPath}`,
    lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: page.slug === "silivri-spor-okulu" ? 0.9 : 0.8,
  }));

  return [...staticEntries, ...seoEntries];
}
