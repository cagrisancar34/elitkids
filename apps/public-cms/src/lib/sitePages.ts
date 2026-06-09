import "server-only";

import type { SitePage } from "@/payload-types";

import { getPublicCmsPayload } from "./payload-client";
import { isRecord } from "./payload-utils";
import { getPublicPath } from "./publicSite";
import { toPublicSitePath } from "./routes";

type RichContentBlock = Extract<
  NonNullable<SitePage["layout"]>[number],
  { blockType: "richContent" }
>;

function richText(paragraphs: string[]): RichContentBlock["content"] {
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

function getSitePagePath(page: SitePage) {
  return getPublicPath("site-pages", page as unknown as Record<string, unknown>);
}

const fallbackPages: SitePage[] = [
  {
    id: -1,
    title: "Bizi Tanıyın",
    slug: "bizi-taniyin",
    pageType: "custom",
    workflowStatus: "draft",
    hero: {
      eyebrow: "Bizi tanıyın",
      externalImage:
        "https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1800&q=85",
      heading: "Sporu ciddiye alan, oyunun sihrine inanan bir ekip.",
      imageAlt: "Doğa içinde birlikte yürüyen çocuklar",
      style: "image",
    },
    layout: [
      {
        blockType: "featureList",
        columns: "3",
        intro:
          "Ekip kurgusu, öğretmen dili, rota seçimi ve günlük akışlar aynı soruya cevap verir: Çocuk burada kendini güvende, meraklı ve canlı hisseder mi?",
        items: [
          {
            body: "Programların ana malzemesi açık hava, hareket ve gerçek deneyimdir.",
            icon: "leaf",
            title: "Doğaya yakın kalmak",
          },
          {
            body: "Aile iletişimi, kontenjan yönetimi ve program notları yönetim panelinde takip edilir.",
            icon: "shield",
            title: "Güvenli ekip ritmi",
          },
          {
            body: "Anne babalar, çocuklar, öğretmenler ve uzmanlar için ortak bir dil oluşturulur.",
            icon: "heart",
            title: "Benzer hassasiyetler",
          },
        ],
        title: "Çocukların biricikliğini merkeze alan programlar",
      },
    ],
    navigationLabel: "Bizi Tanıyın",
    showInHeader: true,
    headerOrder: 40,
    showInFooter: false,
    footerOrder: 40,
    seo: {
      description: "Dört Mevsim Doğada yaklaşımı, ekip ilkeleri ve çocuk odaklı program felsefesi.",
      title: "Bizi Tanıyın",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    _status: "published",
  },
  {
    id: -2,
    title: "Neler Yapıyoruz?",
    slug: "neler-yapiyoruz",
    pageType: "landing",
    workflowStatus: "draft",
    hero: {
      eyebrow: "Neler yapıyoruz?",
      heading: "Çocukların hareketini, merakını ve doğayla bağını büyütüyoruz",
      summary:
        "Programlar; güvenli ekip yönetimi, çocuk gelişimine duyarlı akış ve ailelerin gerçek ihtiyaçları üzerine kurgulanır.",
      style: "simple",
    },
    layout: [
      {
        blockType: "featureList",
        columns: "2",
        items: [
          {
            body: "Çocuklu aileler için konaklamalı, açık hava ağırlıklı ve öğretmen ekip eşlikli rotalar.",
            icon: "mountain",
            title: "Doğaya kaçış seyahatleri",
          },
          {
            body: "Yaşa uygun hareket, takım oyunu, denge ve dayanıklılık çalışmalarını eğlenceli akışlarla birleştirir.",
            icon: "bike",
            title: "Spor ve hareket kampları",
          },
          {
            body: "Doğa gözlemi, müzik, yaratıcı üretim ve hikaye anlatımı programların içine yerleşir.",
            icon: "brush",
            title: "Sanat ve üretim atölyeleri",
          },
          {
            body: "Spor, kültür ve şehir keşfini güvenli grup yönetimiyle birlikte planlayan özel kamplar.",
            icon: "plane",
            title: "Yurt dışı deneyimleri",
          },
        ],
      },
      {
        blockType: "callToAction",
        buttonLabel: "Programları incele",
        buttonUrl: "/programlar",
        title: "Tüm akışlar ödeme yerine görüşme ve ön başvuru üzerinden ilerler.",
        tone: "light",
      },
    ],
    navigationLabel: "Neler Yapıyoruz?",
    showInHeader: true,
    headerOrder: 30,
    showInFooter: false,
    footerOrder: 30,
    seo: {
      description: "Doğa seyahatleri, spor kampları, atölyeler ve yurt dışı programları.",
      title: "Neler Yapıyoruz?",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    _status: "published",
  },
  {
    id: -3,
    title: "İletişim",
    slug: "iletisim",
    pageType: "custom",
    workflowStatus: "draft",
    hero: {
      eyebrow: "İletişim",
      heading: "Programlar hakkında bilgi alın",
      summary:
        "Satın alma yerine ön görüşme ve başvuru akışı kullanılır. Formu bırakın veya WhatsApp üzerinden yazın.",
      style: "simple",
    },
    layout: [
      {
        blockType: "contactForm",
        body: "Sorularınızı iletin; ekip uygun program ve tarihler için sizinle iletişime geçsin.",
        eyebrow: "Ön başvuru",
        showContactDetails: true,
        title: "Sizinle tanışalım",
      },
    ],
    navigationLabel: "İletişim",
    showInHeader: false,
    headerOrder: 50,
    showInFooter: true,
    footerOrder: 10,
    seo: {
      description: "Programlar hakkında bilgi almak ve ön başvuru bırakmak için iletişim sayfası.",
      title: "İletişim",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    _status: "published",
  },
  {
    id: -4,
    title: "KVKK Aydınlatma Metni",
    slug: "kvkk",
    pageType: "custom",
    workflowStatus: "draft",
    hero: {
      eyebrow: "Yasal",
      heading: "KVKK Aydınlatma Metni",
      summary:
        "Bu alan teknik şablon olarak hazırlanmıştır. Nihai metin hukuk danışmanı tarafından onaylanmalıdır.",
      style: "simple",
    },
    layout: [
      {
        blockType: "richContent",
        content: richText([
          "Başvuru formlarında paylaşılan ad soyad, telefon, e-posta, çocuk yaşı ve mesaj bilgileri yalnızca program bilgilendirmesi ve iletişim amacıyla işlenir.",
          "Kullanıcı, form gönderimi sırasında ilgili aydınlatma metnini okuduğunu ve kendisine dönüş yapılmasını kabul ettiğini beyan eder.",
        ]),
        width: "narrow",
      },
    ],
    navigationLabel: "KVKK Aydınlatma Metni",
    showInHeader: false,
    headerOrder: 60,
    showInFooter: true,
    footerOrder: 20,
    seo: { title: "KVKK Aydınlatma Metni" },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    _status: "published",
  },
  {
    id: -5,
    title: "Gizlilik Politikası",
    slug: "gizlilik",
    pageType: "custom",
    workflowStatus: "draft",
    hero: {
      eyebrow: "Yasal",
      heading: "Gizlilik Politikası",
      summary:
        "Bu metin yer tutucudur; canlı yayından önce hukuki ve operasyonel gerçeklere göre güncellenmelidir.",
      style: "simple",
    },
    layout: [
      {
        blockType: "richContent",
        content: richText([
          "Site, başvuru ve iletişim süreçleri için gerekli minimum bilgileri toplar. Bilgiler yetkili ekip üyeleri tarafından görüntülenir ve üçüncü kişilerle amaç dışı paylaşılmaz.",
        ]),
        width: "narrow",
      },
    ],
    navigationLabel: "Gizlilik Politikası",
    showInHeader: false,
    headerOrder: 70,
    showInFooter: true,
    footerOrder: 30,
    seo: { title: "Gizlilik Politikası" },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    _status: "published",
  },
  {
    id: -6,
    title: "Çerez Politikası",
    slug: "cerez-politikasi",
    pageType: "custom",
    workflowStatus: "draft",
    hero: {
      eyebrow: "Yasal",
      heading: "Çerez Politikası",
      summary:
        "Analitik, güvenlik ve deneyim çerezleri canlı entegrasyonlara göre bu sayfada listelenmelidir.",
      style: "simple",
    },
    layout: [
      {
        blockType: "richContent",
        content: richText([
          "Demo sürümde zorunlu site çerezleri dışında pazarlama çerezi kurgulanmamıştır. Canlı yayında kullanılan servisler bu metne eklenmelidir.",
        ]),
        width: "narrow",
      },
    ],
    navigationLabel: "Çerez Politikası",
    showInHeader: false,
    headerOrder: 80,
    showInFooter: true,
    footerOrder: 40,
    seo: { title: "Çerez Politikası" },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    _status: "published",
  },
];

export function getFallbackSitePages() {
  return fallbackPages;
}

export async function getSitePage(slug: string, draft = false): Promise<SitePage | undefined> {
  try {
    const payload = await getPublicCmsPayload();
    const result = await payload.find({
      collection: "site-pages",
      depth: 2,
      limit: 1,
      ...(draft
        ? { draft: true as const }
        : {
            draft: false as const,
          }),
      where: {
        slug: {
          equals: slug,
        },
      },
    });

    const page = result.docs[0];
    if (page && isRecord(page)) {
      return page as SitePage;
    }
  } catch {
    // Fall back to the seeded demo content below.
  }

  return fallbackPages.find((page) => page.slug === slug);
}

export async function getSitePageByPath(path: string, draft = false): Promise<SitePage | undefined> {
  const requestedPath = toPublicSitePath(path);

  try {
    const payload = await getPublicCmsPayload();
    const result = await payload.find({
      collection: "site-pages",
      depth: 2,
      limit: 250,
      ...(draft
        ? { draft: true as const }
        : {
            draft: false as const,
          }),
      sort: "createdAt",
    });

    const match = (result.docs as SitePage[]).find((page) => getSitePagePath(page) === requestedPath);
    if (match) {
      return match;
    }
  } catch {
    // Fall back to the seeded demo content below.
  }

  return fallbackPages.find((page) => getSitePagePath(page) === requestedPath);
}

export async function getSitePageSlugs() {
  try {
    const payload = await getPublicCmsPayload();
    const result = await payload.find({
      collection: "site-pages",
      depth: 0,
      limit: 250,
      draft: false,
      sort: "slug",
    });

    const slugs = (result.docs as SitePage[])
      .filter((page) => getSitePagePath(page) !== "/")
      .map((page) => page.slug);

    if (slugs.length > 0) {
      return slugs;
    }
  } catch {
    // Fall back to the seeded demo content below.
  }

  return fallbackPages
    .filter((page) => getSitePagePath(page) !== "/")
    .map((page) => page.slug);
}

export async function getManagedNavigation(position: "footer" | "header") {
  const field = position === "header" ? "showInHeader" : "showInFooter";
  const order = position === "header" ? "headerOrder" : "footerOrder";
  const isVisible =
    position === "header"
      ? (page: SitePage) => Boolean(page.showInHeader)
      : (page: SitePage) => Boolean(page.showInFooter);
  const sortValue =
    position === "header"
      ? (page: SitePage) => Number(page.headerOrder || 0)
      : (page: SitePage) => Number(page.footerOrder || 0);

  try {
    const payload = await getPublicCmsPayload();
    const result = await payload.find({
      collection: "site-pages",
      depth: 0,
      limit: 250,
      draft: false,
      sort: order,
      where: {
        [field]: {
          equals: true,
        },
      },
    });

    const items = (result.docs as SitePage[])
      .filter(isVisible)
      .map((page) => ({
        href: `/${page.slug}`,
        label: page.navigationLabel || page.title,
      }));

    if (items.length > 0) {
      return items;
    }
  } catch {
    // Fall back to the seeded demo content below.
  }

  return fallbackPages
    .filter(isVisible)
    .sort((a, b) => sortValue(a) - sortValue(b))
    .map((page) => ({
      href: `/${page.slug}`,
      label: page.navigationLabel || page.title,
    }));
}
