import config from "../src/payload.config.ts";
import { categories, locations, partners, programs, testimonials } from "../src/lib/content.ts";
import { getFallbackSitePages } from "../src/lib/sitePages.ts";
import { getPayload, type CollectionSlug } from "payload";

const payload = await getPayload({ config });

function richText(text: string) {
  return {
    root: {
      children: [{
        children: [{ detail: 0, format: 0, mode: "normal", style: "", text, type: "text", version: 1 }],
        direction: "ltr",
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        type: "paragraph",
        version: 1,
      }],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

async function upsert(collection: CollectionSlug, slugField: string, value: string, data: Record<string, unknown>) {
  const existing = await payload.find({
    collection,
    limit: 1,
    where: { [slugField]: { equals: value } },
  });
  if (existing.docs[0]) {
    await payload.update({ collection, id: existing.docs[0].id, data: data as never, draft: false });
    console.log(`Güncellendi: ${collection} / ${value}`);
    return existing.docs[0].id;
  }
  const created = await payload.create({ collection, data: data as never, draft: false });
  console.log(`Oluşturuldu: ${collection} / ${value}`);
  return created.id;
}

const categoryIDs = new Map<string, number | string>();
for (const category of categories) {
  categoryIDs.set(category.slug, await upsert("categories", "slug", category.slug, {
    description: `${category.title} için public site içerik kategorisi.`,
    isFeatured: true,
    slug: category.slug,
    title: category.title,
    type: category.type,
  }));
}

const locationIDs = new Map<string, number | string>();
for (const location of locations) {
  locationIDs.set(location.slug, await upsert("locations", "slug", location.slug, {
    city: location.city,
    country: location.country,
    externalCover: location.image,
    slug: location.slug,
    summary: location.summary,
    title: location.title,
  }));
}

for (const program of programs) {
  await upsert("programs", "slug", program.slug, {
    _status: "published",
    audience: program.audience,
    category: categoryIDs.get(program.category),
    coverAlt: program.title,
    dates: program.dates,
    details: program.details,
    excluded: program.excluded.map((item) => ({ item })),
    externalCover: program.image,
    faq: program.faq,
    featured: program.featured,
    included: program.included.map((item) => ({ item })),
    location: locationIDs.get(program.locationSlug),
    price: { label: program.priceLabel, showPrice: false },
    region: program.region,
    season: program.season,
    seo: { description: program.summary, title: program.title },
    slug: program.slug,
    availabilityStatus: program.status,
    summary: program.summary,
    title: program.title,
    workflowStatus: "draft",
  });
}

for (const testimonial of testimonials) {
  await upsert("testimonials", "title", testimonial.title, { ...testimonial, isFeatured: true });
}

for (const [index, title] of partners.entries()) {
  await upsert("partners", "title", title, { isActive: true, order: index + 1, title });
}

const news = [
  {
    image: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1900&q=88",
    slug: "minik-sporcular-longoz-ormanlarinda",
    summary: "Longoz ormanlarında kano, açık hava oyunları ve ailece iyi gelen üç günlük doğa programı.",
    title: "Minik Sporcular Longoz Ormanları'nda",
  },
  {
    image: "https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?auto=format&fit=crop&w=1900&q=88",
    slug: "bahar-doneminde-kapadokya-kesfi",
    summary: "Vadi yürüyüşleri, yaratıcı atölyeler ve çocukların merakını büyüten benzersiz bir keşif.",
    title: "Bahar Döneminde Kapadokya Keşfi",
  },
  {
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1900&q=88",
    slug: "londra-yaz-kampi-on-basvurulari-aciliyor",
    summary: "Spor, kültür ve dil pratiğini güvenli bir kamp ritminde buluşturan Londra deneyimi.",
    title: "Londra Yaz Kampı Ön Başvuruları Açılıyor",
  },
];
for (const [index, item] of news.entries()) {
  await upsert("headlines", "slug", item.slug, {
    _status: "published",
    content: richText(item.summary),
    externalImage: item.image,
    imageAlt: item.title,
    isActive: true,
    kicker: "Öne çıkan",
    linkType: "none",
    order: index + 1,
    publishedAt: new Date(Date.now() - index * 86400000).toISOString(),
    seo: { description: item.summary, title: item.title },
    slug: item.slug,
    summary: item.summary,
    title: item.title,
    workflowStatus: "draft",
  });
}

const existingHeadlines = await payload.find({ collection: "headlines", draft: true, limit: 250 });
for (const headline of existingHeadlines.docs) {
  if (!headline.imageAlt) {
    const seo = headline.seo || {};
    await payload.update({
      collection: "headlines",
      id: headline.id,
      context: { skipPublishValidation: true },
      data: {
        imageAlt: headline.title,
        seo: {
          ...seo,
          description: seo.description || headline.summary || headline.title,
          title: seo.title || headline.title,
        },
      },
      draft: headline._status !== "published",
    });
  }
}

for (const page of getFallbackSitePages()) {
  const clean = { ...page } as Record<string, unknown>;
  delete clean.id;
  delete clean.createdAt;
  delete clean.updatedAt;
  clean.pageType = "custom";
  clean.workflowStatus = "draft";
  clean.seo = {
    ...(typeof clean.seo === "object" && clean.seo ? clean.seo : {}),
    description: (clean.seo as Record<string, unknown> | undefined)?.description || (page.hero.summary || `${page.title} sayfası.`),
  };
  await upsert("site-pages", "slug", page.slug, clean);
}

const systemPages = [
  {
    hero: {
      externalImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&q=85",
      heading: "Dört Mevsim Doğada",
      imageAlt: "Doğada aileler için keşif rotası",
      style: "image",
      summary: "Çocukların merakını, ailelerin güven ihtiyacını ve doğanın iyi gelen ritmini aynı programda buluşturuyoruz.",
    },
    layout: [{ blockType: "callToAction", buttonLabel: "Programları keşfet", buttonUrl: "/programlar", title: "Yeni rotaları birlikte keşfedin.", tone: "green" }],
    homeMetrics: [
      { icon: "leaf", label: "Doğa rotaları", value: "Her mevsim açık hava" },
      { icon: "users", label: "Yaş grupları", value: "3-14 yaş arası" },
      { icon: "calendar", label: "Takvim", value: "Sezonluk oturumlar" },
      { icon: "shield", label: "Güven", value: "Öğretmen ekip eşliği" },
    ],
    homeProcess: {
      description: "Ekip CMS panelinden programları, tarihleri, lokasyonları, yorumları ve başvuruları tek yerden yönetir.",
      eyebrow: "Nasıl çalışır?",
      steps: [
        { text: "Program içeriği ve tarih oturumları panelden güncellenir." },
        { text: "Ziyaretçi filtrelerle uygun rotayı bulur ve detay sayfasında ön başvuru bırakır." },
        { text: "Başvurular yönetim panelinde durum ve iç notlarla takip edilir." },
      ],
      title: "Yönetilebilir, sade ve güven veren başvuru akışı",
    },
    pageType: "home",
    partnerEyebrow: "Katkılarıyla",
    path: "/",
    slug: "ana-sayfa",
    title: "Ana Sayfa",
  },
  {
    hero: { eyebrow: "Program keşfi", heading: "Ailenize uygun etkinliği bulun", style: "simple", summary: "Kategori, rota, yaş grubu ve durum filtreleriyle doğru programa hızlıca ulaşın." },
    layout: [],
    pageType: "system",
    path: "/programlar",
    slug: "programlar",
    title: "Programlar",
  },
  {
    hero: { eyebrow: "Rotalar", heading: "Programların geçtiği yerler", style: "simple", summary: "Her lokasyon çocuklu ailelerin güvenliği, erişimi ve deneyim derinliği düşünülerek seçilir." },
    layout: [],
    pageType: "system",
    path: "/lokasyonlar",
    slug: "lokasyonlar",
    title: "Lokasyonlar",
  },
];
for (const page of systemPages) {
  await upsert("site-pages", "slug", page.slug, {
    _status: "published",
    hero: page.hero,
    homeMetrics: "homeMetrics" in page ? page.homeMetrics : undefined,
    homeProcess: "homeProcess" in page ? page.homeProcess : undefined,
    layout: page.layout,
    pageType: page.pageType,
    partnerEyebrow: "partnerEyebrow" in page ? page.partnerEyebrow : undefined,
    seo: { description: page.hero.summary, title: page.title },
    slug: page.slug,
    systemPath: page.path,
    title: page.title,
    workflowStatus: "draft",
  });
}

await upsert("galleries", "slug", "dogada-anlar", {
  _status: "published",
  externalCover: locations[0].image,
  images: locations.map((location) => ({ alt: location.title, caption: location.summary, externalImage: location.image })),
  seo: { description: "Dört Mevsim Doğada programlarından seçilmiş anlar.", title: "Doğada Anlar" },
  slug: "dogada-anlar",
  summary: "Programlardan, rotalardan ve birlikte geçirilen anlardan seçkiler.",
  title: "Doğada Anlar",
  workflowStatus: "draft",
});

await payload.updateGlobal({
  slug: "site-settings",
  data: {
    address: "Erenköy Mah. Çamlıköşk Sk. No:3A Kadıköy/İstanbul",
    copyrightText: "Tüm hakları saklıdır. Bu demo satış ve ödeme akışı içermez.",
    email: "merhaba@dortmevsimdogada.com",
    footerBrand: "Dört Mevsim Doğada",
    footerHeadline: "Çocuklu aileler için güvenli, canlı ve doğaya yakın programlar.",
    phone: "+90 555 111 22 33",
    whatsappNumber: "905551112233",
  },
});
console.log("Güncellendi: global / site-settings");

process.exit(0);
