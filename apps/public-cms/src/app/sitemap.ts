import type { MetadataRoute } from "next";

import { getCMSGallerySlugs, getCMSPrograms } from "@/lib/cmsContent";
import { getPublishedNewsSlugs } from "@/lib/headlines";
import { getSitePageSlugs } from "@/lib/sitePages";
import { toPublicSitePath } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const now = new Date();
  const [newsSlugs, sitePageSlugs, programs, gallerySlugs] = await Promise.all([
    getPublishedNewsSlugs(),
    getSitePageSlugs(),
    getCMSPrograms(),
    getCMSGallerySlugs(),
  ]);

  return [
    "",
    toPublicSitePath("/programlar"),
    toPublicSitePath("/lokasyonlar"),
    ...sitePageSlugs.map((slug) => toPublicSitePath(`/${slug}`)),
    ...programs.map((program) => toPublicSitePath(`/programlar/${program.slug}`)),
    ...newsSlugs.map((slug) => toPublicSitePath(`/haberler/${slug}`)),
    ...gallerySlugs.map((slug) => toPublicSitePath(`/galeri/${slug}`)),
  ].map((path) => ({
    changeFrequency:
      path.startsWith("/site/programlar") || path.startsWith("/site/haberler") ? "weekly" : "monthly",
    lastModified: now,
    priority:
      path === ""
        ? 1
        : path.startsWith("/site/programlar") || path.startsWith("/site/haberler")
          ? 0.8
          : 0.6,
    url: `${siteUrl}${path}`,
  }));
}
