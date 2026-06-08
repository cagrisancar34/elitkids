export type ProgramStatus = "open" | "soon" | "full";
export type Region = "domestic" | "international";

export type Program = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  categoryLabel: string;
  region: Region;
  audience: string;
  season: string;
  location: string;
  locationSlug: string;
  image: string;
  status: ProgramStatus;
  featured: boolean;
  priceLabel: string;
  dates: { label: string; capacityStatus: "available" | "limited" | "full" }[];
  highlights: string[];
  details: { heading: string; body: string }[];
  included: string[];
  excluded: string[];
  faq: { question: string; answer: string }[];
};

export type Location = {
  slug: string;
  title: string;
  city: string;
  country: string;
  summary: string;
  image: string;
};

export const categories = [
  { slug: "seyahat", title: "Seyahatler", type: "travel" },
  { slug: "kamp", title: "Kamplar", type: "camp" },
  { slug: "atolye", title: "Atölyeler", type: "workshop" },
  { slug: "yurt-disi", title: "Yurt Dışı", type: "international" },
];

export const locations: Location[] = [
  {
    slug: "longoz",
    title: "Longoz Ormanları",
    city: "İğneada",
    country: "Türkiye",
    summary:
      "Subasar ormanları, göller ve açık hava oyunlarıyla çocuklu aileler için güçlü bir doğa rotası.",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=85",
  },
  {
    slug: "kapadokya",
    title: "Kapadokya",
    city: "Nevşehir",
    country: "Türkiye",
    summary:
      "Peribacaları, yürüyüş parkurları ve yaratıcı atölyelerle merak duygusunu besleyen bir keşif alanı.",
    image:
      "https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?auto=format&fit=crop&w=1400&q=85",
  },
  {
    slug: "londra",
    title: "Londra Yaz Kampı",
    city: "Londra",
    country: "İngiltere",
    summary:
      "Spor, kültür ve şehir deneyimini güvenli bir kamp ritmiyle buluşturan yurt dışı programı.",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=85",
  },
];

export const programs: Program[] = [
  {
    slug: "minik-sporcular-longoz-ormanlarinda",
    title: "Minik Sporcular Longoz Ormanları'nda",
    summary:
      "Açık hava oyunları, orman yürüyüşü, kano ve masal saatleriyle ailece nefes alan üç günlük doğa programı.",
    category: "seyahat",
    categoryLabel: "Seyahat",
    region: "domestic",
    audience: "4-12 yaş",
    season: "Kış / İlkbahar",
    location: "Longoz Ormanları",
    locationSlug: "longoz",
    image:
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1600&q=85",
    status: "open",
    featured: true,
    priceLabel: "Bilgi almak için iletişime geçin",
    dates: [
      { label: "18-20 Ocak", capacityStatus: "limited" },
      { label: "24-26 Ocak", capacityStatus: "available" },
      { label: "31 Ocak-2 Şubat", capacityStatus: "available" },
    ],
    highlights: ["Orman yürüyüşü", "Kano", "Macera parkı", "Masal saati"],
    details: [
      {
        heading: "Program",
        body:
          "İlk gün tanışma çemberi ve akşam masalıyla başlar. İkinci gün rehberli Longoz yürüyüşü, açık hava oyunları ve atölyelerle devam eder. Son gün macera parkı ve kapanış çemberiyle tamamlanır.",
      },
      {
        heading: "Konaklama",
        body:
          "Ailelerin doğaya yakın ama konforlu kalabileceği bungalov/glamping oda düzeni temel alınır. Oda seçenekleri ve uygunluk CMS üzerinden ayrıca yönetilir.",
      },
      {
        heading: "Ulaşım",
        body:
          "Bu rota özel araç katılımına uygundur. Arazi ve hava koşullarına göre günlük akışta değişiklik yapılabilir.",
      },
    ],
    included: [
      "Program boyunca Gymy Kids atölyeleri",
      "Rehberli doğa yürüyüşü",
      "Belirtilen öğünler",
      "Seyahat yöneticisi eşliği",
    ],
    excluded: ["Ulaşım", "Kişisel harcamalar", "Program dışı aktiviteler"],
    faq: [
      {
        question: "Çocuklar programa yalnız mı katılıyor?",
        answer:
          "Bu rota aile katılımlı olarak kurgulanır. Çocuklar aktivitelerde öğretmen ekibiyle çalışırken ebeveynler program ritmine dahil olur.",
      },
      {
        question: "Program hava koşullarından etkilenir mi?",
        answer:
          "Açık hava programlarında güvenlik önceliklidir. Hava koşullarına göre akış, süre veya etkinlik sıralaması güncellenebilir.",
      },
    ],
  },
  {
    slug: "minik-sporcular-kapadokyada",
    title: "Minik Sporcular Kapadokya'da",
    summary:
      "Jeoloji, tarih, yürüyüş ve yaratıcı üretimi çocukların merakıyla buluşturan deneyimli bir rota.",
    category: "seyahat",
    categoryLabel: "Seyahat",
    region: "domestic",
    audience: "6-12 yaş",
    season: "İlkbahar",
    location: "Kapadokya",
    locationSlug: "kapadokya",
    image:
      "https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?auto=format&fit=crop&w=1600&q=85",
    status: "open",
    featured: true,
    priceLabel: "Ön başvuru ile bilgi verilir",
    dates: [
      { label: "19-21 Nisan", capacityStatus: "available" },
      { label: "23-25 Mayıs", capacityStatus: "available" },
    ],
    highlights: ["Vadi yürüyüşü", "Seramik atölyesi", "Müze gezisi", "Takım oyunları"],
    details: [
      {
        heading: "Program",
        body:
          "Vadi yürüyüşleri, bölge anlatımları ve yaratıcı atölyeler çocukların gözlem ve üretim becerilerini destekleyecek şekilde planlanır.",
      },
      {
        heading: "Konaklama",
        body:
          "Çocuklu ailelere uygun, merkezi ve güvenli tesisler tercih edilir. Oda ve grup detayları başvuru sonrası paylaşılır.",
      },
      {
        heading: "Özel notlar",
        body:
          "Bölge yürüyüşleri için rahat ayakkabı ve katmanlı kıyafet önerilir. Günlük akış, grubun yaş dağılımına göre dengelenir.",
      },
    ],
    included: ["Atölyeler", "Rehberlik", "Program içi transferler", "Seyahat sigortası"],
    excluded: ["Uçak/şehirlerarası ulaşım", "Kişisel harcamalar"],
    faq: [
      {
        question: "Yürüyüşler zor mu?",
        answer:
          "Parkurlar çocuklu ailelere uygun seçilir. Tempo en küçük katılımcıların konforuna göre ayarlanır.",
      },
    ],
  },
  {
    slug: "gymy-kids-londra-yaz-kampi",
    title: "Gymy Kids Londra Yaz Kampı",
    summary:
      "Spor, dil pratiği ve şehir kültürünü güvenli bir kamp akışıyla birleştiren yurt dışı yaz deneyimi.",
    category: "yurt-disi",
    categoryLabel: "Yurt Dışı",
    region: "international",
    audience: "8-14 yaş",
    season: "Yaz",
    location: "Londra",
    locationSlug: "londra",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1600&q=85",
    status: "soon",
    featured: true,
    priceLabel: "Kontenjan ve fiyat bilgisi yakında",
    dates: [
      { label: "Haziran dönemi", capacityStatus: "available" },
      { label: "Temmuz dönemi", capacityStatus: "available" },
    ],
    highlights: ["Çoklu spor", "Şehir keşfi", "Dil pratiği", "Güvenli grup akışı"],
    details: [
      {
        heading: "Program",
        body:
          "Kamp akışı sabah spor blokları, öğleden sonra kültür gezileri ve akşam grup değerlendirmeleriyle dengelenir.",
      },
      {
        heading: "Başvuru süreci",
        body:
          "Yurt dışı programlarında ön görüşme, belge kontrolü ve kontenjan onayı birlikte yürütülür.",
      },
    ],
    included: ["Kamp programı", "Ekip eşliği", "Program içi ulaşım", "Seçili öğünler"],
    excluded: ["Vize masrafları", "Uçak bileti", "Kişisel harcamalar"],
    faq: [
      {
        question: "Vize süreci destekleniyor mu?",
        answer:
          "Başvuru sonrası ailelere gerekli evrak listesi ve süreç takvimi paylaşılır.",
      },
    ],
  },
  {
    slug: "orman-atolyesi-guzel-bir-sabah",
    title: "Ormanda Güzel Bir Sabah",
    summary:
      "Hafta sonu kısa kaçamak arayan aileler için oyun, hareket ve doğa gözlemi odaklı atölye.",
    category: "atolye",
    categoryLabel: "Atölye",
    region: "domestic",
    audience: "3-7 yaş",
    season: "Her mevsim",
    location: "İstanbul",
    locationSlug: "longoz",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85",
    status: "full",
    featured: false,
    priceLabel: "Yeni tarih için bilgi alın",
    dates: [{ label: "Yeni tarih yakında", capacityStatus: "full" }],
    highlights: ["Doğa oyunu", "Denge çalışmaları", "Mini atölye", "Aile katılımı"],
    details: [
      {
        heading: "Program",
        body:
          "Kısa süreli atölye, çocukların hareket ihtiyacını doğa gözlemi ve yaratıcı oyunla birleştirir.",
      },
    ],
    included: ["Atölye yürütücüsü", "Malzemeler", "Mini ikram"],
    excluded: ["Ulaşım"],
    faq: [
      {
        question: "Yağmurda yapılır mı?",
        answer:
          "Hafif yağmurda uygun ekipmanla yapılabilir. Güvenli olmayan koşullarda tarih ertelenir.",
      },
    ],
  },
];

export const testimonials = [
  {
    title: "Güvenle Doğaya",
    body:
      "Doğanın içinde, özenle seçilmiş rotalarda uzman rehberlerle dolaşmak bize iyi ki dedirtti. Ekibin enerjisi ve özeni bütün deneyimi çok kıymetli kıldı.",
    parentName: "İlknur Ü.",
    childInfo: "Atlas, 6",
    programName: "Longoz Ormanları",
  },
  {
    title: "Dönmek İstemedi",
    body:
      "Program çok iyi planlanmıştı. Öğretmenlerin çocuklarla iletişimi harikaydı; kızımızın dönmek istememesi bizim için en net gösterge oldu.",
    parentName: "Yasemin Ç.",
    childInfo: "Leyla, 5",
    programName: "Çeşme Programı",
  },
  {
    title: "Konforlu Doğa Kaçamağı",
    body:
      "Hem çocuklar hem yetişkinler için dengeli, eğitici ve huzurlu bir deneyimdi. Program akışı çok iyi düşünülmüştü.",
    parentName: "Ahu A.",
    childInfo: "Rüzgar, 8",
    programName: "Kazdağları",
  },
];

export const partners = ["Gymy Kids", "Courself", "The Champions Team", "Polat"];

export function getFeaturedPrograms() {
  return programs.filter((program) => program.featured);
}

export function getProgramBySlug(slug: string) {
  return programs.find((program) => program.slug === slug);
}

export function getStatusLabel(status: ProgramStatus) {
  const labels: Record<ProgramStatus, string> = {
    full: "Kontenjan doldu",
    open: "Başvuru açık",
    soon: "Yakında",
  };

  return labels[status];
}

export function getRegionLabel(region: Region) {
  return region === "domestic" ? "Yurt içi" : "Yurt dışı";
}
