import "server-only";

import type { SerializedEditorState } from "lexical";

import type { Headline as HeadlineDoc, Program as ProgramDoc } from "@/payload-types";

import { getPublicCmsPayload } from "./payload-client";
import { getText, isRecord, resolveMediaUrl, resolveRelationText } from "./payload-utils";
import { toPublicSitePath } from "./routes";

export type HomepageHeadline = {
  buttonLabel: string;
  href: string;
  id: string;
  image: string;
  kicker: string;
  summary: string;
  title: string;
};

export type NewsArticle = HomepageHeadline & {
  content: SerializedEditorState;
  ctaHref?: string;
  ctaLabel?: string;
  publishedAt: string;
  slug: string;
};

function createArticleContent(paragraphs: string[]): SerializedEditorState {
  return {
    root: {
      children: paragraphs.map((text) => ({
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text,
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        type: "paragraph",
        version: 1,
      })),
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

const fallbackArticles: NewsArticle[] = [
  {
    buttonLabel: "Haberi oku",
    content: createArticleContent([
      "Longoz ormanlarının sakin ritminde çocukların hareket, keşif ve merak duygusunu bir araya getiren yeni dönem programımız için kayıtlar başladı.",
      "Üç günlük akış boyunca kano, orman yürüyüşü, açık hava oyunları ve masal saatleri yer alıyor. Program, çocukların doğayla güvenli biçimde bağ kurmasına alan açarken ailelere de birlikte nefes alabilecekleri bir deneyim sunuyor.",
      "Program tarihleri, yaş grubu ve ön başvuru ayrıntıları için ilgili program sayfasını inceleyebilirsiniz.",
    ]),
    ctaHref: "/site/programlar/minik-sporcular-longoz-ormanlarinda",
    ctaLabel: "Programı incele",
    href: "/site/haberler/minik-sporcular-longoz-ormanlarinda",
    id: "longoz",
    image:
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1900&q=88",
    kicker: "Yeni dönem kayıtları",
    publishedAt: "2026-06-01T09:00:00.000Z",
    slug: "minik-sporcular-longoz-ormanlarinda",
    summary:
      "Longoz ormanlarında kano, açık hava oyunları ve ailece iyi gelen üç günlük doğa programı.",
    title: "Minik Sporcular Longoz Ormanları'nda",
  },
  {
    buttonLabel: "Haberi oku",
    content: createArticleContent([
      "Kapadokya'nın vadileri bu bahar çocukların merakıyla yeniden keşfediliyor. Yeni dönem rotası; yürüyüş, jeoloji, tarih ve yaratıcı üretimi dengeli bir akışta buluşturuyor.",
      "Çocuklar araziyi gözlemlerken, aileler bölgenin hikayelerini birlikte deneyimleyecek. Her durak yaş grubuna uygun etkinlikler ve uzman ekip eşliğiyle planlandı.",
      "Kontenjan ve tarih bilgileri için program detayını ziyaret ederek ön başvurunuzu bırakabilirsiniz.",
    ]),
    ctaHref: "/site/programlar/minik-sporcular-kapadokyada",
    ctaLabel: "Programı incele",
    href: "/site/haberler/bahar-doneminde-kapadokya-kesfi",
    id: "kapadokya",
    image:
      "https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?auto=format&fit=crop&w=1900&q=88",
    kicker: "Öne çıkan rota",
    publishedAt: "2026-05-28T09:00:00.000Z",
    slug: "bahar-doneminde-kapadokya-kesfi",
    summary:
      "Vadi yürüyüşleri, yaratıcı atölyeler ve çocukların merakını büyüten benzersiz bir keşif.",
    title: "Bahar Döneminde Kapadokya Keşfi",
  },
  {
    buttonLabel: "Haberi oku",
    content: createArticleContent([
      "Spor, kültür ve dil pratiğini güvenli bir kamp ritminde buluşturan Londra Yaz Kampı için ön başvuru dönemi açıldı.",
      "Program boyunca çocuklar günlük spor etkinliklerine katılırken şehri deneyimleyecek, doğal İngilizce pratiği yapacak ve farklı kültürlerle tanışacak.",
      "Yaş grubu, kamp süresi ve ön görüşme süreciyle ilgili ayrıntılar program sayfasında yer alıyor.",
    ]),
    ctaHref: "/site/programlar/gymy-kids-londra-yaz-kampi",
    ctaLabel: "Ön bilgi alın",
    href: "/site/haberler/londra-yaz-kampi-on-basvurulari-aciliyor",
    id: "londra",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1900&q=88",
    kicker: "Yurt dışı yaz kampı",
    publishedAt: "2026-05-20T09:00:00.000Z",
    slug: "londra-yaz-kampi-on-basvurulari-aciliyor",
    summary:
      "Spor, kültür ve dil pratiğini güvenli bir kamp ritminde buluşturan Londra deneyimi.",
    title: "Londra Yaz Kampı Ön Başvuruları Açılıyor",
  },
];

const defaultHeadlineImage =
  fallbackArticles[0]?.image ||
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85";

function articlePath(slug: string) {
  return toPublicSitePath(`/haberler/${slug}`);
}

function getFallbackArticleBySlug(slug: string) {
  return fallbackArticles.find((article) => article.slug === slug) ?? null;
}

function isSerializedEditorState(value: unknown): value is SerializedEditorState {
  return isRecord(value) && isRecord(value.root) && Array.isArray(value.root.children);
}

function mapHeadlineDoc(doc: HeadlineDoc): HomepageHeadline {
  const fallback = getFallbackArticleBySlug(doc.slug);
  const programSlug = resolveRelationText((doc as { program?: ProgramDoc | number | null }).program, ["slug"]);
  const href =
    doc.linkType === "program" && programSlug
      ? toPublicSitePath(`/programlar/${programSlug}`)
      : doc.linkType === "custom" && getText(doc.customUrl)
        ? doc.customUrl!
        : articlePath(doc.slug);

  return {
    buttonLabel: getText(doc.buttonLabel, fallback?.buttonLabel ?? "Haberi oku"),
    href,
    id: String(doc.id),
    image: resolveMediaUrl(doc.image, doc.externalImage, fallback?.image ?? defaultHeadlineImage),
    kicker: getText(doc.kicker, fallback?.kicker ?? "Öne çıkan"),
    summary: getText(doc.summary, fallback?.summary ?? ""),
    title: getText(doc.title, fallback?.title ?? "Başlıksız haber"),
  };
}

function mapNewsArticleDoc(doc: HeadlineDoc): NewsArticle {
  const fallback = getFallbackArticleBySlug(doc.slug);
  const base = mapHeadlineDoc(doc);
  const programSlug = resolveRelationText((doc as { program?: ProgramDoc | number | null }).program, ["slug"]);
  const ctaHref =
    doc.linkType === "program" && programSlug
      ? toPublicSitePath(`/programlar/${programSlug}`)
      : doc.linkType === "custom" && getText(doc.customUrl)
        ? doc.customUrl!
        : fallback?.ctaHref;
  const content = isSerializedEditorState(doc.content)
    ? doc.content
    : fallback?.content ?? createArticleContent([base.summary || base.title]);

  return {
    ...base,
    content,
    ctaHref,
    ctaLabel: getText(doc.buttonLabel, fallback?.ctaLabel ?? base.buttonLabel),
    publishedAt: getText(doc.publishedAt, fallback?.publishedAt ?? new Date().toISOString()),
    slug: doc.slug,
  };
}

async function fetchHeadlineDocs(draft = false) {
  const payload = await getPublicCmsPayload();
  const result = await payload.find({
    collection: "headlines",
    depth: 1,
    limit: 250,
    ...(draft
      ? { draft: true as const }
      : {
          draft: false as const,
          where: {
            isActive: {
              equals: true,
            },
          },
        }),
    sort: "order",
  });

  return result.docs as HeadlineDoc[];
}

export async function getHomepageHeadlines(draft = false): Promise<HomepageHeadline[]> {
  try {
    const docs = await fetchHeadlineDocs(draft);
    if (docs.length > 0) {
      return docs.map(mapHeadlineDoc);
    }
  } catch {
    // Fall back to the seeded demo content below.
  }

  return fallbackArticles.map((article) => ({
    buttonLabel: article.buttonLabel,
    href: article.href,
    id: article.id,
    image: article.image,
    kicker: article.kicker,
    summary: article.summary,
    title: article.title,
  }));
}

export async function getNewsArticleBySlug(
  slug: string,
  draft = false,
): Promise<NewsArticle | undefined> {
  try {
    const payload = await getPublicCmsPayload();
    const result = await payload.find({
      collection: "headlines",
      depth: 1,
      limit: 1,
      where: {
        slug: {
          equals: slug,
        },
        ...(draft
          ? {}
          : {
              isActive: {
                equals: true,
              },
            }),
      },
      ...(draft ? { draft: true as const } : { draft: false as const }),
    });

    const doc = result.docs[0];
    if (doc) {
      return mapNewsArticleDoc(doc as HeadlineDoc);
    }
  } catch {
    // Fall back to the seeded demo content below.
  }

  return fallbackArticles.find((item) => item.slug === slug);
}

export async function getPublishedNewsSlugs() {
  try {
    const docs = await fetchHeadlineDocs(false);
    if (docs.length > 0) {
      return docs.map((article) => article.slug);
    }
  } catch {
    // Fall back to the seeded demo content below.
  }

  return fallbackArticles.map((article) => article.slug);
}
