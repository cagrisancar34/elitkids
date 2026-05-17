import type { LandingContent } from "@/lib/landing-content";
import type { SeoPageContent } from "@/lib/seo-pages";

export type PublicPageKind = "home" | "gallery" | "seo" | "custom";
export type PublicPageStatus = "draft" | "published" | "archived";
export type CustomPublicPageTemplate = "content" | "service" | "guide" | "campaign";
export type CustomSectionBlockStyle = "plain" | "highlight" | "proof";

export type CustomSectionBlock = {
  id: string;
  eyebrow?: string;
  title: string;
  body: string;
  style: CustomSectionBlockStyle;
};

export type CustomPublicPageContent = Omit<SeoPageContent, "status"> & {
  template: CustomPublicPageTemplate;
  status: PublicPageStatus;
  indexable: boolean;
  includeInSitemap: boolean;
  customSections: CustomSectionBlock[];
};

export type PublicPageRecord = {
  id: string;
  kind: PublicPageKind;
  slug: string;
  route: string;
  title: string;
  pageType: string;
  status: PublicPageStatus;
  published: boolean;
  indexable: boolean;
  includeInSitemap: boolean;
  deletable: boolean;
  previewHref: string;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type PublicPageDetail =
  | {
      kind: "home";
      key: "home";
      title: string;
      content: LandingContent;
    }
  | {
      kind: "gallery";
      key: "gallery";
      title: string;
      content: LandingContent;
    }
  | {
      kind: "seo";
      key: string;
      title: string;
      content: SeoPageContent;
    }
  | {
      kind: "custom";
      key: string;
      title: string;
      content: CustomPublicPageContent;
    };

export type PublicSiteChecklistItem = {
  id: string;
  label: string;
  tone: "ok" | "warn";
  detail?: string;
};

export type PublicPageRenderable = Pick<
  SeoPageContent,
  | "slug"
  | "pageType"
  | "title"
  | "seoTitle"
  | "metaDescription"
  | "canonicalPath"
  | "heroEyebrow"
  | "heroTitle"
  | "heroDescription"
  | "introTitle"
  | "introBody"
  | "sectionOneTitle"
  | "sectionOneBody"
  | "sectionTwoTitle"
  | "sectionTwoBody"
  | "sectionThreeTitle"
  | "sectionThreeBody"
  | "bulletItems"
  | "faqTitle"
  | "faqDescription"
  | "faqItems"
  | "ctaTitle"
  | "ctaDescription"
  | "ctaPrimaryLabel"
  | "ctaPrimaryHref"
  | "ctaSecondaryLabel"
  | "ctaSecondaryHref"
  | "locationTitle"
  | "locationBody"
  | "targetLocation"
  | "targetBranch"
  | "targetAgeGroup"
  | "testimonialQuote"
  | "testimonialAuthor"
  | "testimonialRole"
  | "internalLinks"
  | "published"
  | "indexable"
  | "includeInSitemap"
> & {
  customSections?: CustomSectionBlock[];
};

export const customPublicPageStoragePrefix = "public-page:";

const reservedPublicSlugs = new Set([
  "",
  "admin",
  "manager",
  "coach",
  "parent",
  "login",
  "galeri",
  "api",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

export function getCustomPublicPageStorageSlug(slug: string) {
  return `${customPublicPageStoragePrefix}${slug}`;
}

export function getSlugFromCustomPublicStorageSlug(storageSlug: string) {
  return storageSlug.replace(customPublicPageStoragePrefix, "");
}

export function isReservedPublicSlug(slug: string) {
  return reservedPublicSlugs.has(slug.trim().toLowerCase());
}

function buildTemplateDefaults(
  template: CustomPublicPageTemplate,
  title: string,
): Pick<CustomPublicPageContent, "pageType" | "heroEyebrow" | "targetBranch" | "targetAgeGroup"> {
  if (template === "service") {
    return {
      pageType: "service",
      heroEyebrow: "Hizmet sayfasi",
      targetBranch: title,
      targetAgeGroup: "Tum aileler",
    };
  }

  if (template === "guide") {
    return {
      pageType: "brand",
      heroEyebrow: "Rehber sayfasi",
      targetBranch: title,
      targetAgeGroup: "Tum aileler",
    };
  }

  if (template === "campaign") {
    return {
      pageType: "contact",
      heroEyebrow: "Kampanya sayfasi",
      targetBranch: title,
      targetAgeGroup: "Sinirli donem",
    };
  }

  return {
    pageType: "brand",
    heroEyebrow: "Icerik sayfasi",
    targetBranch: title,
    targetAgeGroup: "Tum aileler",
  };
}

export function createDefaultCustomPublicPage(input: {
  slug: string;
  title: string;
  template: CustomPublicPageTemplate;
}): CustomPublicPageContent {
  const { slug, title, template } = input;
  const templateDefaults = buildTemplateDefaults(template, title);

  return {
    slug,
    template,
    status: "draft",
    pageType: templateDefaults.pageType,
    title,
    seoTitle: `${title} | Elit Sanat ve Spor Kulubu`,
    metaDescription: `${title} sayfasini Elit Sanat ve Spor Kulubu public vitrini icinde yonetin.`,
    canonicalPath: `/${slug}`,
    heroEyebrow: templateDefaults.heroEyebrow,
    heroTitle: title,
    heroDescription: `${title} icin public icerik, CTA ve SEO akislarini buradan yonetin.`,
    introTitle: `${title} hakkinda`,
    introBody: `${title} sayfasinin giris anlatimi burada yer alir.`,
    sectionOneTitle: "Birinci bolum",
    sectionOneBody: "Bu bolum sayfanin ilk ana mesajini tasir.",
    sectionTwoTitle: "Ikinci bolum",
    sectionTwoBody: "Bu bolum detayli bilgi ve guven sinyalleri icin kullanilir.",
    sectionThreeTitle: "Ucuncu bolum",
    sectionThreeBody: "Bu bolum CTA oncesi son anlatim alani olarak kullanilir.",
    bulletItems: [
      "Temel deger onerisi",
      "Public CTA uyumu",
      "Lokal guven sinyali",
      "Net yonlendirme",
    ],
    faqTitle: `${title} SSS`,
    faqDescription: "Sik sorulan sorulari burada kisa cevaplarla yonetin.",
    faqItems: [
      {
        question: `${title} sayfasi ne icin kullanilir?`,
        answer: "Bu sayfa public vitrinde belirli bir hizmet, rehber veya kampanyayi anlatmak icin kullanilir.",
      },
      {
        question: "Bu sayfa yayina alinmadan once ne kontrol edilmeli?",
        answer: "SEO alani, CTA metinleri, ic linkler ve route uyumu kontrol edilmelidir.",
      },
      {
        question: "Sayfa yayina alindiginda sitemap'e girer mi?",
        answer: "Include in sitemap secenegi acik oldugunda sitemap'e eklenir.",
      },
    ],
    ctaTitle: `${title} icin ekibimizle hizli sekilde iletisime gecin.`,
    ctaDescription: "WhatsApp, telefon veya bilgi alma formu ile size en uygun yonlendirmeyi yapalim.",
    ctaPrimaryLabel: "Bilgi al",
    ctaPrimaryHref: "/#contact",
    ctaSecondaryLabel: "WhatsApp",
    ctaSecondaryHref: "/#contact",
    locationTitle: "Silivri odakli public sayfa",
    locationBody: "Bu sayfa Silivri odakli public vitrin stratejisinin parcasi olarak yonetilir.",
    targetLocation: "Silivri",
    targetBranch: templateDefaults.targetBranch,
    targetAgeGroup: templateDefaults.targetAgeGroup,
    testimonialQuote: "",
    testimonialAuthor: "",
    testimonialRole: "",
    internalLinks: [],
    customSections: [
      {
        id: `${slug}-blok-1`,
        eyebrow: "One cikan konu",
        title: `${title} icin ilk net mesaj`,
        body: "Bu blok, sayfanin ilk destek mesajini daha guclu bir sekilde anlatmak icin kullanilir.",
        style: "highlight",
      },
      {
        id: `${slug}-blok-2`,
        eyebrow: "Saha ayrintisi",
        title: "Aileye guven veren operasyon detaylari",
        body: "Burada tesis, ekip, surec veya program akisi gibi karar destekleyici bilgiler verilir.",
        style: "proof",
      },
    ],
    published: false,
    indexable: true,
    includeInSitemap: true,
  };
}

export function normalizeCustomPublicPageContent(
  content: CustomPublicPageContent,
): CustomPublicPageContent {
  return {
    ...content,
    status: content.status ?? (content.published ? "published" : "draft"),
    indexable: typeof content.indexable === "boolean" ? content.indexable : true,
    includeInSitemap:
      typeof content.includeInSitemap === "boolean" ? content.includeInSitemap : content.published,
    customSections: Array.isArray(content.customSections)
      ? content.customSections
          .filter((item) => typeof item?.title === "string" && typeof item?.body === "string")
          .map((item, index) => ({
            id:
              typeof item.id === "string" && item.id.trim()
                ? item.id
                : `${content.slug}-blok-${index + 1}`,
            eyebrow: typeof item.eyebrow === "string" ? item.eyebrow : "",
            title: item.title,
            body: item.body,
            style:
              item.style === "highlight" || item.style === "proof" ? item.style : "plain",
          }))
      : [],
  };
}

export function buildPublicPageChecklist(page: {
  seoTitle?: string;
  metaDescription?: string;
  ctaTitle?: string;
  ctaPrimaryLabel?: string;
  faqItems?: Array<{ question?: string; answer?: string }>;
  internalLinks?: Array<{ label?: string; href?: string }>;
  published?: boolean;
  customSections?: CustomSectionBlock[];
}, options?: {
  availableRoutes?: Set<string>;
}): PublicSiteChecklistItem[] {
  const checklist: PublicSiteChecklistItem[] = [];
  const brokenInternalLinks = (page.internalLinks ?? [])
    .map((item) => item.href?.trim() ?? "")
    .filter((href) => {
      if (!href) return true;
      if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return false;
      }
      if (href.startsWith("#")) {
        return false;
      }
      if (!href.startsWith("/")) {
        return true;
      }
      const pathname = href.split("#")[0]?.split("?")[0] ?? href;
      return options?.availableRoutes ? !options.availableRoutes.has(pathname) : false;
    });

  checklist.push({
    id: "seo-title",
    label: page.seoTitle?.trim() ? "SEO title hazir" : "SEO title eksik",
    tone: page.seoTitle?.trim() ? "ok" : "warn",
  });
  checklist.push({
    id: "meta-description",
    label: page.metaDescription?.trim() ? "Meta description hazir" : "Meta description eksik",
    tone: page.metaDescription?.trim() ? "ok" : "warn",
  });
  checklist.push({
    id: "cta",
    label:
      page.ctaTitle?.trim() && page.ctaPrimaryLabel?.trim()
        ? "CTA hazir"
        : "CTA alani eksik",
    tone:
      page.ctaTitle?.trim() && page.ctaPrimaryLabel?.trim()
        ? "ok"
        : "warn",
  });
  checklist.push({
    id: "faq",
    label:
      (page.faqItems ?? []).some((item) => item.question?.trim() && item.answer?.trim())
        ? "SSS alani hazir"
        : "SSS alani bos",
    tone:
      (page.faqItems ?? []).some((item) => item.question?.trim() && item.answer?.trim())
        ? "ok"
        : "warn",
  });
  checklist.push({
    id: "internal-links",
    label: brokenInternalLinks.length === 0 ? "Ic linkler tutarli" : "Kirik ic link var",
    tone: brokenInternalLinks.length === 0 ? "ok" : "warn",
    detail:
      brokenInternalLinks.length > 0
        ? `Kontrol et: ${brokenInternalLinks.join(", ")}`
        : undefined,
  });
  if (page.customSections) {
    checklist.push({
      id: "custom-sections",
      label:
        page.customSections.some((section) => section.title.trim() && section.body.trim())
          ? `${page.customSections.length} section block hazir`
          : "Section block eksik",
      tone:
        page.customSections.some((section) => section.title.trim() && section.body.trim())
          ? "ok"
          : "warn",
    });
  }
  checklist.push({
    id: "publish-ready",
    label:
      page.published &&
      checklist.some((item) => item.id === "seo-title" && item.tone === "warn")
        ? "Yayindaki sayfada eksik alan var"
        : page.published
          ? "Sayfa yayinda"
          : "Sayfa taslakta",
    tone:
      page.published &&
      checklist.some((item) => item.id === "seo-title" && item.tone === "warn")
        ? "warn"
        : "ok",
  });

  return checklist;
}

export function getPublicPageStatusLabel(status: PublicPageStatus) {
  if (status === "published") {
    return "Yayinda";
  }
  if (status === "archived") {
    return "Arsivde";
  }
  return "Taslak";
}

export function buildPublicPageKey(kind: PublicPageKind, slug: string) {
  return kind === "home" || kind === "gallery" ? kind : `${kind}:${slug}`;
}

export function buildPublicPageRecord(input: {
  kind: PublicPageKind;
  slug: string;
  title: string;
  pageType: string;
  status: PublicPageStatus;
  published: boolean;
  indexable: boolean;
  includeInSitemap: boolean;
  deletable: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
}): PublicPageRecord {
  const route = input.kind === "home" ? "/" : `/${input.slug}`;

  return {
    id: buildPublicPageKey(input.kind, input.slug),
    kind: input.kind,
    slug: input.slug,
    route,
    title: input.title,
    pageType: input.pageType,
    status: input.status,
    published: input.published,
    indexable: input.indexable,
    includeInSitemap: input.includeInSitemap,
    deletable: input.deletable,
    previewHref: route,
    updatedAt: input.updatedAt,
    updatedBy: input.updatedBy,
  };
}
