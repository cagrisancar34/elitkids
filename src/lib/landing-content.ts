export type IconKey =
  | "snowflake"
  | "users"
  | "medal"
  | "shield"
  | "clock"
  | "map"
  | "dumbbell"
  | "heart"
  | "news"
  | "star"
  | "quote"
  | "instagram"
  | "youtube";

export type LandingContent = {
  siteSettings: {
    brandName: string;
    brandTagline: string;
    contactPhone: string;
    contactEmail: string;
    copyright: string;
  };
  navbar: {
    logoLabel: string;
    links: Array<{ label: string; href: string }>;
    ctaLabel: string;
    ctaHref: string;
  };
  hero: {
    badge: string;
    title: string;
    highlight: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    backgroundImage: string;
  };
  stats: Array<{
    value: string;
    label: string;
    description: string;
    icon: IconKey;
  }>;
  programs: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      image: string;
      href: string;
      ctaLabel: string;
      layout: "wide" | "tall" | "full";
    }>;
  };
  whyUs: {
    eyebrow: string;
    title: string;
    description: string;
    image: string;
    features: Array<{
      title: string;
      description: string;
      icon: IconKey;
    }>;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      name: string;
      role: string;
      quote: string;
      rating: number;
      avatar?: string;
    }>;
  };
  news: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      image: string;
      category: string;
      title: string;
      description: string;
      href: string;
    }>;
  };
  cta: {
    eyebrow: string;
    title: string;
    description: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    branchLabel: string;
    branchPlaceholder: string;
    noteLabel: string;
    notePlaceholder: string;
    submitLabel: string;
    footnote: string;
  };
  footer: {
    description: string;
    groups: Array<{
      title: string;
      links: Array<{ label: string; href: string }>;
    }>;
    socials: Array<{
      label: string;
      href: string;
      icon: IconKey;
    }>;
  };
};

export const defaultLandingContent: LandingContent = {
  siteSettings: {
    brandName: "Buz Akademi",
    brandTagline: "Premium buz sporlari akademisi",
    contactPhone: "+90 850 190 42 85",
    contactEmail: "iletisim@buzakademi.com",
    copyright: "Buz Akademi. Tum haklari saklidir.",
  },
  navbar: {
    logoLabel: "BA",
    links: [
      { label: "Branslar", href: "#branslar" },
      { label: "Programlar", href: "#programlar" },
      { label: "Egitmenler", href: "#neden-biz" },
      { label: "Tesisler", href: "#tesisler" },
      { label: "Duyurular", href: "#haberler" },
    ],
    ctaLabel: "Hemen Kayit Ol",
    ctaHref: "#kayit",
  },
  hero: {
    badge: "2026 sezon kayitlari acildi",
    title: "Buzda zarafet,",
    highlight: "akademik disiplinle",
    description:
      "Patenden buz hokeyine uzanan premium programlarimizla sporculari guvenli, rafine ve ilham veren bir akademi deneyimiyle bulusturuyoruz.",
    primaryCtaLabel: "Hemen Kayit Ol",
    primaryCtaHref: "#kayit",
    secondaryCtaLabel: "Programlari Incele",
    secondaryCtaHref: "#branslar",
    backgroundImage:
      "https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=1800&q=80",
  },
  stats: [
    {
      value: "15+",
      label: "yillik deneyim",
      description: "Buz ustunde nesiller boyu sureklilik kuran egitim omurgasi.",
      icon: "snowflake",
    },
    {
      value: "500+",
      label: "aktif sporcu",
      description: "Her sezon farkli seviyelerde ritmini bulan genis akademi toplulugu.",
      icon: "users",
    },
    {
      value: "12+",
      label: "milli atlet",
      description: "Yarismaci gelisim programindan cikmis ulusal seviye sporcular.",
      icon: "medal",
    },
  ],
  programs: {
    eyebrow: "Branslar",
    title: "Buz ustunde her yolculuk, karakterli bir antrenman diliyle baslar.",
    description:
      "Her brans kendi ritmini tasir; biz o ritmi editorial bir sahneleme, guclu teknik egitim ve sahici atmosferle sunuyoruz.",
    items: [
      {
        title: "Artistik Patinaj",
        description:
          "Zarafet, denge ve sahne bilincini teknik dogrulukla birlestiren premium program.",
        image:
          "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80",
        href: "#kayit",
        ctaLabel: "Detaylari Gor",
        layout: "wide",
      },
      {
        title: "Buz Hokeyi",
        description:
          "Hiz, kuvvet ve takim ritmini modern saha standardinda bulusturan rekabetci gelisim hatti.",
        image:
          "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=900&q=80",
        href: "#kayit",
        ctaLabel: "Takim Programi",
        layout: "tall",
      },
      {
        title: "Surat Pateni",
        description:
          "Ivme, teknik cizgi ve dayaniklilik uzerine kurulan yuksek tempolu performans yolu.",
        image:
          "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1500&q=80",
        href: "#kayit",
        ctaLabel: "Performans Plani",
        layout: "full",
      },
    ],
  },
  whyUs: {
    eyebrow: "Neden Biz",
    title: "Gelecegin sampiyonlarini bugunden yetistiren sakin ama iddiali bir kultur.",
    description:
      "Buz Akademi yalnizca ders veren bir kurum degil; sporcu psikolojisini, aile iletisimi ve guvenli ilerleme cizgisini ayni kalite standardinda yoneten bir gelisim ortami.",
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
    features: [
      {
        title: "Uluslararasi standarda yakin metodoloji",
        description:
          "Teknik kadromuz gelisim planlarini yas ve seviye bazli net kilometre taslariyla kurar.",
        icon: "medal",
      },
      {
        title: "Guvenli ve izlenebilir egitim",
        description:
          "Her sporcu icin devam, yuklenme ve saha disi koordinasyon duzenli takip edilir.",
        icon: "shield",
      },
      {
        title: "Modern tesis ritmi",
        description:
          "Pist saatleri, isinma alanlari ve aile akisi premium bir deneyim olarak tasarlanir.",
        icon: "map",
      },
      {
        title: "Performans odakli destek",
        description:
          "Fiziksel gelisim, mental dayaniklilik ve surekli geri bildirim tek omurgada ilerler.",
        icon: "dumbbell",
      },
    ],
  },
  testimonials: {
    eyebrow: "Deneyimler",
    title: "Sporcu ve veli tarafinda guven, ilham ve devam hissi birakiyoruz.",
    description:
      "Akademi atmosferinin en dogru olcusu, piste gelen sporcularin ve ailelerin hissettigi netliktir.",
    items: [
      {
        name: "Aylin Yildiz",
        role: "Veli",
        quote:
          "Kizim pistte hem cok daha guvenli hem de cok daha istekli. Akademinin duzeni bizi ilk haftadan itibaren rahatlatti.",
        rating: 5,
      },
      {
        name: "Deniz Erdem",
        role: "Milli takim adayi sporcu",
        quote:
          "Antrenman kalitesi kadar ortam da cok kuvvetli. Her seansa ne icin geldigimi biliyorum ve ritmimi koruyabiliyorum.",
        rating: 5,
      },
      {
        name: "Mert Kaya",
        role: "Veli",
        quote:
          "Iletisimleri net, ekip profesyonel ve tesis kullanimi son derece duzenli. Premium bir deneyim hissi veriyor.",
        rating: 5,
      },
    ],
  },
  news: {
    eyebrow: "Akademi Guncel",
    title: "Sezon takvimi, etkinlikler ve pistten gelen yeni haberler.",
    description:
      "Akademi vitrinini canli tutan tum duyurular tek bir editoryal akista ilerler.",
    items: [
      {
        image:
          "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80",
        category: "Basari Hikayesi",
        title: "Balkan Sampiyonasi icin 3 sporcu milli havuza davet edildi",
        description:
          "Yarisma gelisim grubumuzdan uc sporcu yeni sezon performans havuzuna secildi.",
        href: "#kayit",
      },
      {
        image:
          "https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=900&q=80",
        category: "Etkinlik",
        title: "Yeni donem tanitim gunu ve ucretsiz deneme dersi",
        description:
          "Aileler ve aday sporcular icin pist uzeri tanisma programi acildi.",
        href: "#kayit",
      },
      {
        image:
          "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=900&q=80",
        category: "Duyuru",
        title: "Milli performans atolyemiz yenilenmis programiyla basliyor",
        description:
          "Kuvvet, denge ve esneklik hattinda yeni salon kurgusu kullanima giriyor.",
        href: "#kayit",
      },
    ],
  },
  cta: {
    eyebrow: "Kayit Basvurusu",
    title: "Sampiyonlarin arasina katilmak icin ilk adimi bugun at.",
    description:
      "Brans, yas seviyesi ve hedefe gore sana uygun grup planini iletelim. Akademi ekibi ayni gun icinde geri donus saglar.",
    fullNameLabel: "Adiniz soyadiniz",
    fullNamePlaceholder: "Sporcu veya veli adi",
    emailLabel: "E-posta adresi",
    emailPlaceholder: "ornek@buzakademi.com",
    phoneLabel: "Telefon numarasi",
    phonePlaceholder: "+90 5xx xxx xx xx",
    branchLabel: "Ilgilendiginiz brans",
    branchPlaceholder: "Artistik patinaj, buz hokeyi, surat pateni...",
    noteLabel: "Kisa not",
    notePlaceholder: "Yas, deneyim seviyesi veya hedefinizden kisaca bahsedin.",
    submitLabel: "Basvuruyu Gonder",
    footnote:
      "Form kurgusu su an statik fallback ile calisir; ileride Supabase uzerinden admin panelden guncellenebilir.",
  },
  footer: {
    description:
      "Buz Akademi, sporculari premium egitim, rafine tesis deneyimi ve guvenli ilerleme cizgisiyle bulusturur.",
    groups: [
      {
        title: "Akademi",
        links: [
          { label: "Hakkimizda", href: "#neden-biz" },
          { label: "Egitmenler", href: "#neden-biz" },
          { label: "Branslar", href: "#branslar" },
        ],
      },
      {
        title: "Guncel",
        links: [
          { label: "Duyurular", href: "#haberler" },
          { label: "Sezon Takvimi", href: "#haberler" },
          { label: "Basvuru", href: "#kayit" },
        ],
      },
      {
        title: "Iletisim",
        links: [
          { label: "Tesisler", href: "#tesisler" },
          { label: "Kayit Ofisi", href: "#kayit" },
          { label: "Bize Ulasin", href: "#kayit" },
        ],
      },
    ],
    socials: [
      { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
      { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
    ],
  },
};

export function mergeLandingContent(
  base: LandingContent,
  override?: Partial<LandingContent> | null,
): LandingContent {
  if (!override) {
    return base;
  }

  return {
    ...base,
    ...override,
    siteSettings: {
      ...base.siteSettings,
      ...override.siteSettings,
    },
    navbar: {
      ...base.navbar,
      ...override.navbar,
      links: override.navbar?.links ?? base.navbar.links,
    },
    hero: {
      ...base.hero,
      ...override.hero,
    },
    programs: {
      ...base.programs,
      ...override.programs,
      items: override.programs?.items ?? base.programs.items,
    },
    whyUs: {
      ...base.whyUs,
      ...override.whyUs,
      features: override.whyUs?.features ?? base.whyUs.features,
    },
    testimonials: {
      ...base.testimonials,
      ...override.testimonials,
      items: override.testimonials?.items ?? base.testimonials.items,
    },
    news: {
      ...base.news,
      ...override.news,
      items: override.news?.items ?? base.news.items,
    },
    cta: {
      ...base.cta,
      ...override.cta,
    },
    footer: {
      ...base.footer,
      ...override.footer,
      groups: override.footer?.groups ?? base.footer.groups,
      socials: override.footer?.socials ?? base.footer.socials,
    },
    stats: override.stats ?? base.stats,
  };
}

