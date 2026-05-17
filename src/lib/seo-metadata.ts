import type { Metadata } from "next";

import type { PublicPageRenderable } from "@/lib/public-site";

export const siteUrl = "https://elitsanatvesporkulubu.com";
export const siteName = "Elit Sanat ve Spor Kulubu";

export function buildRootMetadata(): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description:
      "Silivri'de cocuklar icin yuzme, cimnastik ve tenis odakli planli spor egitimi sunan Elit Sanat ve Spor Kulubu.",
    openGraph: {
      type: "website",
      siteName,
      title: siteName,
      description:
        "Silivri'de yuzme, cimnastik ve tenis odakli planli cocuk spor sistemi.",
      url: siteUrl,
      locale: "tr_TR",
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description:
        "Silivri'de yuzme, cimnastik ve tenis odakli planli cocuk spor sistemi.",
    },
  };
}

export function buildSeoPageMetadata(page: PublicPageRenderable): Metadata {
  const canonical = page.canonicalPath || `/${page.slug}`;

  return {
    title: {
      absolute: page.seoTitle,
    },
    description: page.metaDescription,
    alternates: {
      canonical,
    },
    robots:
      page.indexable === false
        ? {
            index: false,
            follow: false,
          }
        : undefined,
    openGraph: {
      type: "website",
      siteName,
      title: page.seoTitle,
      description: page.metaDescription,
      url: canonical,
      locale: "tr_TR",
    },
    twitter: {
      card: "summary_large_image",
      title: page.seoTitle,
      description: page.metaDescription,
    },
  };
}

export function buildSeoPageJsonLd(page: PublicPageRenderable) {
  const canonical = `${siteUrl}${page.canonicalPath}`;

  const organization = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: siteName,
    url: siteUrl,
    telephone: "+90 530 065 77 77",
    address: {
      "@type": "PostalAddress",
      addressLocality: page.targetLocation || "Silivri",
      addressRegion: "Istanbul",
      addressCountry: "TR",
    },
  };

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    url: canonical,
    description: page.metaDescription,
    about: [page.targetBranch, page.targetAgeGroup, page.targetLocation].filter(Boolean),
  };

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": page.pageType === "contact" ? "Organization" : "LocalBusiness",
    name: siteName,
    url: siteUrl,
    telephone: "+90 530 065 77 77",
    areaServed: page.targetLocation || "Silivri",
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumb = {
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
        name: page.title,
        item: canonical,
      },
    ],
  };

  return [organization, localBusiness, webPage, faq, breadcrumb];
}
