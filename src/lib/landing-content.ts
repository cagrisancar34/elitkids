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
  | "youtube"
  | "waves"
  | "sparkles";

export type LandingContent = {
  siteSettings: {
    brandName: string;
    brandTagline: string;
    logoLabel: string;
    logoImage: string;
    contactPhone: string;
    whatsappPhone: string;
    contactEmail: string;
    location: string;
    copyright: string;
    footerBadge: string;
  };
  navbar: {
    links: Array<{ label: string; href: string }>;
    statusLabel: string;
    ctaLabel: string;
    ctaHref: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    visualPrimaryImage: string;
    visualSecondaryImage: string;
  };
  stats: Array<{
    value: string;
    label: string;
    description: string;
    icon: IconKey;
  }>;
  methodology: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      icon: IconKey;
    }>;
  };
  programs: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      image: string;
      bullets: string[];
      href: string;
      ctaLabel: string;
    }>;
  };
  coaches: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      name: string;
      specialty: string;
      bio: string;
      image: string;
    }>;
  };
  whyUs: {
    title: string;
    highlight: string;
    description: string;
    image: string;
    statValue: string;
    statLabel: string;
    points: Array<{
      title: string;
      description: string;
    }>;
  };
  faq: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  guide: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      label: string;
      href: string;
    }>;
  };
  cta: {
    title: string;
    description: string;
    whatsappLabel: string;
    phoneCtaLabel: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    statusLabel: string;
    statusPlaceholder: string;
    statusOptions: string[];
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
    bottomText: string;
    bottomBadge: string;
  };
};

export const defaultLandingContent: LandingContent = {
  siteSettings: {
    brandName: "Elit Kids",
    brandTagline: "Cocuk spor akademisi",
    logoLabel: "EK",
    logoImage: "",
    contactPhone: "+90 555 000 00 00",
    whatsappPhone: "+90 555 000 00 00",
    contactEmail: "iletisim@elitkids.com",
    location: "Istanbul, Turkiye",
    copyright: "© 2026 Elit Kids Athletic Academy. Tum haklari saklidir.",
    footerBadge: "Designed for Excellence",
  },
  navbar: {
    links: [
      { label: "Programs", href: "#programs" },
      { label: "System", href: "#system" },
      { label: "Why Us", href: "#why-us" },
      { label: "Contact", href: "#contact" },
    ],
    statusLabel: "Canli vitrinde",
    ctaLabel: "Hemen Kayit Ol",
    ctaHref: "/login",
  },
  hero: {
    eyebrow: "Premium gelisim modeli",
    title: "Silivri Elit Kids'de",
    highlight: "Cocugunuz sadece\nspor yapmaz,\ndogru sistemle\ngelisir.",
    description:
      "Planli, guvenli ve olculebilir gelisim modeli ile gelecegin saglikli nesillerini yetistiriyoruz.",
    primaryCtaLabel: "Hemen Kayit Ol",
    primaryCtaHref: "#contact",
    secondaryCtaLabel: "Programlari Incele",
    secondaryCtaHref: "#programs",
    visualPrimaryImage:
      "https://images.unsplash.com/photo-1602211844066-d3bb556e983b?auto=format&fit=crop&w=900&q=80",
    visualSecondaryImage:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
  },
  stats: [
    {
      value: "4-12 Yas",
      label: "gelisim odakli yas grubu",
      description: "Motor beceri ve disiplin omurgasi icin erken yas planlamasi.",
      icon: "users",
    },
    {
      value: "Yuzme",
      label: "olimpik temelli egitim",
      description: "Su guveni, teknik progresyon ve kondisyon beraber ilerler.",
      icon: "waves",
    },
    {
      value: "Cimnastik",
      label: "koordinasyon ve guc",
      description: "Esneklik, denge ve postur hattini sistemli sekilde gelistirir.",
      icon: "sparkles",
    },
  ],
  methodology: {
    eyebrow: "Benzersiz metodoloji",
    title: "4G Egitim Sistemi",
    description: "Sporu sadece hareket degil, karakter ve ritim insasi olarak goruyoruz.",
    items: [
      {
        title: "Guvenlik",
        description: "Tum tesis, ekipman ve uygulama akisi cocuk ergonomisine uygun kurulur.",
        icon: "shield",
      },
      {
        title: "Guler yuz",
        description: "Pedagojik formasyon sahibi egitmenlerle motive eden bir atmosfer sunulur.",
        icon: "heart",
      },
      {
        title: "Gelisim",
        description: "Her seans somut verilerle izlenir, fiziksel ilerleme duzenli olculur.",
        icon: "medal",
      },
      {
        title: "Geri bildirim",
        description: "Veliler gelisim ritmini duzenli raporlar ve acik geri bildirimlerle takip eder.",
        icon: "quote",
      },
    ],
  },
  programs: {
    eyebrow: "Branslarimiz",
    title: "Her brans kendi sahnesine, kendi ritmine ve kendi disiplinine sahip.",
    description:
      "Premium tesis standardi, net egitim plani ve guclu iletisim hattiyla cocuklarin gelisim yolculugunu destekliyoruz.",
    items: [
      {
        title: "Yuzme Programi",
        description: "Suya alisma, temel teknikler ve stil gelisimi ayni akademik cizgide ilerler.",
        image:
          "https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?auto=format&fit=crop&w=1200&q=80",
        bullets: [
          "Suya alisma ve temel teknikler",
          "Stil gelistirme ve koordinasyon",
          "Olimpik olculerde steril havuz",
        ],
        href: "#contact",
        ctaLabel: "Detayli Bilgi Al",
      },
      {
        title: "Cimnastik Programi",
        description: "Esneklik, denge ve akrobasi temelli ilerleyen guclu bir koordinasyon hattı.",
        image:
          "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
        bullets: [
          "Esneklik ve denge egitimi",
          "Temel akrobasi hareketleri",
          "Kondisyon ve postur duzeni",
        ],
        href: "#contact",
        ctaLabel: "Detayli Bilgi Al",
      },
      {
        title: "Gelisim Takibi",
        description: "Ailelerin anlik gorunurluk alabildigi veri destekli sporcu takip modeli.",
        image:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        bullets: [
          "Aylik fiziksel analiz raporu",
          "Mobil erisim ve veli gorunurlugu",
          "Bireysel gelisim mentorlugu",
        ],
        href: "#contact",
        ctaLabel: "Sistemi Incele",
      },
    ],
  },
  coaches: {
    eyebrow: "Egitmenler",
    title: "Cocugun ritmine gore yon veren uzman kadro.",
    description:
      "Her egitmen saha deneyimini pedagojik yaklasim ve net iletisim diliyle birlestirir.",
    items: [
      {
        name: "Ece Yilmaz",
        specialty: "Cocuk gelisimi ve temel hareket egitimi",
        bio: "Minik sporcularin denge, ritim ve ozguven gelisimini adim adim takip eder.",
        image:
          "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Mert Demir",
        specialty: "Atletik performans ve koordinasyon calismalari",
        bio: "Temel teknigi guc, hiz ve surekli saha disiplini ile birlestiren performans odakli akisi yonetir.",
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Selin Acar",
        specialty: "Cimnastik, esneklik ve postur egitimi",
        bio: "Koordinasyon ve vucut farkindaligini erken yas gruplarinda guvenli sekilde insa eder.",
        image:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  whyUs: {
    title: "Sadece bir spor merkezi degil, bir",
    highlight: "gelisim sistemi",
    description:
      "Her cocuk farkli ogrenir. Biz standart kaliplar yerine cocugun ritmine gore sekillenen, bilimsel ve surdurulebilir bir ilerleme yolu kuruyoruz.",
    image:
      "https://images.unsplash.com/photo-1517837016564-bfc4fcb7d1d2?auto=format&fit=crop&w=1200&q=80",
    statValue: "10k+",
    statLabel: "Mutlu mezun ogrenci",
    points: [
      {
        title: "Her cocuk farkli ogrenir",
        description:
          "Hazirbulunusluk duzeyine gore sekillenen dinamik bir ogrenme haritasi olusturuyoruz.",
      },
      {
        title: "Uzman kadro, bilimsel yaklasim",
        description:
          "Egitmenlerimiz cocuk psikolojisi ve motor gelisim alaninda da egitimli profesyonellerdir.",
      },
      {
        title: "Surdurulebilir basari",
        description:
          "Hedefimiz sadece madalya degil; ozguvenli, disiplinli ve sporu seven bireyler yetistirmektir.",
      },
    ],
  },
  faq: {
    eyebrow: "Sik sorulan sorular",
    title: "Kayit, deneme dersi ve gelisim takibi hakkinda net cevaplar.",
    description:
      "Velilerin ilk gorusmeden kayit anina kadar sordugu en kritik basliklari tek yerde topladik.",
    items: [
      {
        question: "Deneme dersi sunuyor musunuz?",
        answer:
          "Evet. Yas grubu ve uygun kontenjana gore ucretsiz tanisma dersi planliyoruz.",
      },
      {
        question: "Veli panelinde hangi bilgiler gorulur?",
        answer:
          "Program takvimi, devam durumu, tahakkuklar, odemeler ve duyurular tek panelde gorulur.",
      },
      {
        question: "Kayit olduktan sonra gelisim nasil takip edilir?",
        answer:
          "Seans devam durumu, egitmen notlari ve donemsel performans sinyalleri veliye acik sekilde tutulur.",
      },
      {
        question: "Program degisikligi veya yenileme nasil yapilir?",
        answer:
          "Destek paneli veya yonetici ekibi uzerinden talep olusturularak yeni program/plana gecis saglanir.",
      },
    ],
  },
  guide: {
    eyebrow: "Silivri spor rehberi",
    title:
      "Silivri'de yuzme, cimnastik, jimnastik, tenis ve spor okulu arayanlar icin ayri sayfalar.",
    description:
      "Her brans ve lokal niyet icin ayri bilgi sayfalari hazirladik. Size en uygun basliga dogrudan gidin.",
    items: [
      { label: "Silivri Spor Okulu", href: "/silivri-spor-okulu" },
      { label: "Silivri Yuzme Kursu", href: "/silivri-yuzme-kursu" },
      { label: "Silivri Cimnastik Kursu", href: "/silivri-cimnastik-kursu" },
      { label: "Silivri Jimnastik Kursu", href: "/silivri-jimnastik-kursu" },
      { label: "Silivri Tenis Kursu", href: "/silivri-tenis-kursu" },
      { label: "Elit Sanat ve Spor Kulubu", href: "/elit-sanat-ve-spor-kulubu" },
      { label: "Iletisim", href: "/iletisim" },
    ],
  },
  cta: {
    title: "Sampiyonlarin Arasina Katilin",
    description:
      "Ucretsiz tanisma dersi ve gelisim analizi icin formu doldurun, biz sizi arayalim.",
    whatsappLabel: "WhatsApp ile Ulas",
    phoneCtaLabel: "Telefon ile Ara",
    fullNameLabel: "Ad Soyad",
    fullNamePlaceholder: "Adiniz Soyadiniz",
    emailLabel: "Email Adresi",
    emailPlaceholder: "eposta@adresiniz.com",
    phoneLabel: "Telefon Numarasi",
    phonePlaceholder: "05XX XXX XX XX",
    statusLabel: "Durum",
    statusPlaceholder: "Talep tipini secin",
    statusOptions: [
      "Bilgi almak istiyorum",
      "On kayit yaptirmak istiyorum",
      "Deneme dersi talep ediyorum",
    ],
    submitLabel: "Basvuruyu Gonder",
    footnote: "Bu form bilgi alma ve ilk iletisim icindir; gonderilen basvurular admin ve manager panelinde gorunur.",
  },
  footer: {
    description:
      "Yeni nesil spor akademisi anlayisi ile cocuklarin fiziksel ve karakter gelisimine yon veriyoruz.",
    groups: [
      {
        title: "Kurumsal",
        links: [
          { label: "Privacy Policy", href: "#" },
          { label: "Terms of Service", href: "#" },
          { label: "Careers", href: "#" },
          { label: "Academy Press", href: "#" },
        ],
      },
      {
        title: "Hizli Baglantilar",
        links: [
          { label: "Yuzme Programi", href: "#programs" },
          { label: "Cimnastik Programi", href: "#programs" },
          { label: "Ucretsiz Deneme", href: "#contact" },
          { label: "Subelerimiz", href: "#contact" },
        ],
      },
    ],
    socials: [
      { label: "IG", href: "https://instagram.com", icon: "instagram" },
      { label: "YT", href: "https://youtube.com", icon: "youtube" },
    ],
    bottomText: "Elit Kids Athletic Academy. The Kinetic Editorial.",
    bottomBadge: "Designed for Excellence",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeUnknown(base: unknown, override: unknown): unknown {
  if (Array.isArray(base)) {
    if (!Array.isArray(override)) {
      return base;
    }

    return base.map((baseItem, index) => mergeUnknown(baseItem, override[index]));
  }

  if (isRecord(base)) {
    if (!isRecord(override)) {
      return base;
    }

    const merged: Record<string, unknown> = { ...base };

    Object.keys(base).forEach((key) => {
      merged[key] = mergeUnknown(base[key], override[key]);
    });

    return merged;
  }

  return override ?? base;
}

export function mergeLandingContent(
  base: LandingContent,
  override?: Partial<LandingContent> | null,
): LandingContent {
  if (!override) {
    return base;
  }

  return mergeUnknown(base, override) as LandingContent;
}
