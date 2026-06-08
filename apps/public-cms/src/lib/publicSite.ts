import type { CollectionBeforeChangeHook, Field, Payload } from "payload";
import { toPublicSitePath } from "./routes.ts";

export type PublicSiteSource = "galleries" | "headlines" | "programs" | "site-pages";
export type PublicSiteType =
  | "custom"
  | "gallery"
  | "home"
  | "landing"
  | "news"
  | "program"
  | "system";

export type ReadinessResult = {
  critical: string[];
  warnings: string[];
  score: number;
};

export type PublicSiteInventoryItem = {
  criticalCount: number;
  editHref: string;
  path: string;
  previewHref: string;
  readiness: number;
  source: PublicSiteSource;
  status: "draft" | "published" | "published-with-draft" | "review";
  title: string;
  type: PublicSiteType;
  updatedAt: string;
  warningCount: number;
};

type PublicDocument = Record<string, unknown>;

const sourceLabels: Record<PublicSiteType, string> = {
  custom: "Custom sayfa",
  gallery: "Galeri",
  home: "Ana sayfa",
  landing: "Landing",
  news: "Haber",
  program: "Program",
  system: "Sistem sayfası",
};

export const workflowField: Field = {
  name: "workflowStatus",
  label: "Yayın akışı",
  type: "select",
  admin: {
    description: "Editör incelemeye gönderir; Admin hazır içeriği yayınlar.",
  },
  defaultValue: "draft",
  options: [
    { label: "Taslak", value: "draft" },
    { label: "İncelemede", value: "review" },
  ],
  required: true,
};

export const sharedSeoFields: Field[] = [
  {
    name: "title",
    label: "Meta başlık",
    type: "text",
  },
  {
    name: "description",
    label: "Meta açıklama",
    type: "textarea",
  },
  {
    name: "image",
    label: "Sosyal paylaşım görseli",
    type: "upload",
    relationTo: "media",
  },
  {
    name: "canonicalUrl",
    label: "Canonical URL",
    type: "text",
    admin: {
      description: "Boş bırakılırsa sayfanın kendi public adresi kullanılır.",
    },
  },
  {
    name: "noIndex",
    label: "Arama motorlarından gizle",
    type: "checkbox",
    defaultValue: false,
  },
];

function asRecord(value: unknown): PublicDocument {
  return typeof value === "object" && value !== null ? (value as PublicDocument) : {};
}

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasRelation(value: unknown) {
  return typeof value === "number" || typeof value === "string" || Boolean(value && typeof value === "object");
}

function hasMedia(primary: unknown, external: unknown) {
  return hasRelation(primary) || hasText(external);
}

function hasRichText(value: unknown) {
  const root = asRecord(value).root;
  const children = asRecord(root).children;
  return Array.isArray(children) && children.length > 0;
}

function addSharedChecks(data: PublicDocument, result: ReadinessResult, path: string) {
  const seo = asRecord(data.seo);

  if (!hasText(data.title)) result.critical.push("Başlık eksik");
  if (!hasText(path)) result.critical.push("Public URL eksik");
  if (!hasText(seo.title)) result.critical.push("Meta başlık eksik");
  if (!hasText(seo.description)) result.critical.push("Meta açıklama eksik");
  if (!hasRelation(seo.image)) result.warnings.push("Sosyal paylaşım görseli önerilir");
  if (!hasText(seo.canonicalUrl)) result.warnings.push("Canonical URL otomatik kullanılacak");
}

export function getPublicPath(source: PublicSiteSource, data: PublicDocument) {
  const slug = hasText(data.slug) ? String(data.slug).replace(/^\/+|\/+$/g, "") : "";

  if (source === "site-pages") {
    const pageType = data.pageType;
    if (pageType === "home") return "/";
    if (hasText(data.systemPath)) return toPublicSitePath(String(data.systemPath));
    return slug ? toPublicSitePath(`/${slug}`) : "";
  }

  if (source === "programs") return slug ? toPublicSitePath(`/programlar/${slug}`) : "";
  if (source === "headlines") return slug ? toPublicSitePath(`/haberler/${slug}`) : "";
  if (source === "galleries") return slug ? toPublicSitePath(`/galeri/${slug}`) : "";
  return "";
}

export function getPublicType(source: PublicSiteSource, data: PublicDocument): PublicSiteType {
  if (source === "programs") return "program";
  if (source === "headlines") return "news";
  if (source === "galleries") return "gallery";
  if (data.pageType === "home") return "home";
  if (data.pageType === "landing") return "landing";
  if (data.pageType === "system") return "system";
  return "custom";
}

export function getReadiness(source: PublicSiteSource, data: PublicDocument): ReadinessResult {
  const result: ReadinessResult = { critical: [], score: 0, warnings: [] };
  const path = getPublicPath(source, data);
  addSharedChecks(data, result, path);

  if (source === "site-pages") {
    const hero = asRecord(data.hero);
    const layout = Array.isArray(data.layout) ? data.layout : [];
    if (!hasText(hero.heading)) result.critical.push("Kapak başlığı eksik");
    if (hero.style === "image" && !hasMedia(hero.image, hero.externalImage)) {
      result.critical.push("Kapak görseli eksik");
    }
    if (hero.style === "image" && !hasText(hero.imageAlt)) result.critical.push("Kapak alternatif metni eksik");
    if (data.pageType === "home") {
      const homeMetrics = Array.isArray(data.homeMetrics) ? data.homeMetrics : [];
      const homeProcess = asRecord(data.homeProcess);
      const homeSteps = Array.isArray(homeProcess.steps) ? homeProcess.steps : [];

      if (!homeMetrics.length) result.critical.push("Ana metrikler eksik");
      if (!hasText(homeProcess.title) || !hasText(homeProcess.description) || !homeSteps.length) {
        result.critical.push("Nasıl çalışır bölümü eksik");
      }
      if (!hasText(data.partnerEyebrow)) {
        result.warnings.push("Partner alanı üst başlığı önerilir");
      }
    }
    if (!layout.length && data.pageType !== "system" && data.pageType !== "home") {
      result.critical.push("Sayfa içeriği eksik");
    }
  }

  if (source === "programs") {
    if (!hasText(data.summary)) result.critical.push("Program özeti eksik");
    if (!hasRelation(data.category)) result.critical.push("Kategori eksik");
    if (!hasText(data.audience)) result.critical.push("Yaş grubu eksik");
    if (!hasMedia(data.cover, data.externalCover)) result.critical.push("Kapak görseli eksik");
    if (!hasText(data.coverAlt)) result.critical.push("Kapak alternatif metni eksik");
    if (!Array.isArray(data.dates) || !data.dates.length) result.critical.push("En az bir tarih gerekli");
  }

  if (source === "headlines") {
    if (!hasText(data.summary)) result.critical.push("Haber özeti eksik");
    if (!hasRichText(data.content)) result.critical.push("Haber içeriği eksik");
    if (!hasMedia(data.image, data.externalImage)) result.critical.push("Haber görseli eksik");
    if (!hasText(data.imageAlt)) result.critical.push("Haber görseli alternatif metni eksik");
    if (!hasText(data.publishedAt)) result.critical.push("Yayın tarihi eksik");
  }

  if (source === "galleries") {
    const images = Array.isArray(data.images) ? data.images : [];
    if (!hasMedia(data.cover, data.externalCover)) result.critical.push("Galeri kapağı eksik");
    if (!images.length) result.critical.push("Galeride en az bir görsel gerekli");
    if (images.some((item) => !hasText(asRecord(item).alt))) result.critical.push("Galeri görsellerinde alternatif metin eksik");
  }

  const total = result.critical.length + result.warnings.length;
  result.score = total === 0 ? 100 : Math.max(0, 100 - result.critical.length * 20 - result.warnings.length * 5);
  return result;
}

export function createPublishingHook(source: PublicSiteSource): CollectionBeforeChangeHook {
  return ({ data, req }) => {
    const document = asRecord(data);
    if (document._status !== "published") return data;
    if (asRecord(req.context).skipPublishValidation === true) return data;

    const role = asRecord(req.user).role;
    if (req.user && role !== "admin") {
      throw new Error("Yalnızca Admin rolü içerik yayınlayabilir.");
    }

    const readiness = getReadiness(source, document);
    if (readiness.critical.length) {
      throw new Error(`Yayınlanmadan önce tamamlanması gerekenler: ${readiness.critical.join(", ")}`);
    }

    return data;
  };
}

export function createRouteRegistryHook(source: PublicSiteSource): CollectionBeforeChangeHook {
  return async ({ data, originalDoc, req }) => {
    const document = { ...asRecord(originalDoc), ...asRecord(data) };
    await assertUniquePublicPath(req.payload, source, document, asRecord(originalDoc).id as number | string | undefined);
    return data;
  };
}

export function getTypeLabel(type: PublicSiteType) {
  return sourceLabels[type];
}

export async function assertUniquePublicPath(
  payload: Payload,
  source: PublicSiteSource,
  data: PublicDocument,
  currentID?: number | string,
) {
  const path = getPublicPath(source, data);
  if (!path) return;

  const collections: PublicSiteSource[] = ["site-pages", "programs", "headlines", "galleries"];
  for (const collection of collections) {
    const result = await payload.find({ collection, depth: 0, limit: 250 });
    const conflict = result.docs.find((doc) => {
      if (collection === source && String(doc.id) === String(currentID || "")) return false;
      return getPublicPath(collection, asRecord(doc)) === path;
    });

    if (conflict) throw new Error(`Public URL başka bir içerik tarafından kullanılıyor: ${path}`);
  }
}
