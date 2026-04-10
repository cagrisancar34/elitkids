import type { Metadata } from "next";

import type { SeoPageContent } from "@/lib/seo-pages";

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
      "Silivri'de yuzme, cimnastik, jimnastik ve tenis odakli cocuk spor programlari sunan Elit Sanat ve Spor Kulubu.",
    openGraph: {
      type: "website",
      siteName,
      title: siteName,
      description:
        "Silivri'de yuzme, cimnastik, jimnastik ve tenis odakli premium cocuk spor sistemi.",
      url: siteUrl,
      locale: "tr_TR",
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description:
        "Silivri'de yuzme, cimnastik, jimnastik ve tenis odakli premium cocuk spor sistemi.",
    },
  };
}

export function buildSeoPageMetadata(page: SeoPageContent): Metadata {
  const canonical = page.canonicalPath || `/${page.slug}`;

  return {
    title: {
      absolute: page.seoTitle,
    },
    description: page.metaDescription,
    alternates: {
      canonical,
    },
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

export function buildSeoPageJsonLd(page: SeoPageContent) {
  const canonical = `${siteUrl}${page.canonicalPath}`;

  const organization = {
    "@context": "https://schema.org",
    "@type": page.pageType === "contact" ? "Organization" : "SportsActivityLocation",
    name: siteName,
    url: canonical,
    telephone: "+90 530 065 77 77",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Silivri",
      addressRegion: "Istanbul",
      addressCountry: "TR",
    },
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

  return [organization, faq, breadcrumb];
}
