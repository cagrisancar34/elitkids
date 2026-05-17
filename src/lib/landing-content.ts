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
  homepageMediaRail: {
    eyebrow: string;
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
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
  localProof: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      icon: IconKey;
    }>;
  };
  process: {
    eyebrow: string;
    title: string;
    description: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      id: string;
      quote: string;
      parentDisplayName: string;
      context: string;
      branch: string;
      childAgeGroup: string;
      approved: boolean;
      featured: boolean;
      sortOrder: number;
    }>;
  };
  galleryPage: {
    eyebrow: string;
    title: string;
    description: string;
    published: boolean;
    indexable: boolean;
    includeInSitemap: boolean;
  };
  galleryItems: Array<{
    id: string;
    image: string;
    title: string;
    description: string;
    category: "tesis" | "yuzme" | "cimnastik" | "tenis" | "genel";
    featured: boolean;
    sortOrder: number;
    published: boolean;
  }>;
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
    mobileStickyEyebrow: string;
    mobileStickyTitle: string;
    mobileStickyWhatsAppLabel: string;
    mobileStickyPhoneLabel: string;
    mobileStickyPrimaryLabel: string;
    whatsappLabel: string;
    phoneCtaLabel: string;
    recommendationLabel: string;
    recommendationHref: string;
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
    brandName: "Elit Sanat ve Spor Kulubu",
    brandTagline: "Silivri cocuk spor kulubu",
    logoLabel: "ES",
    logoImage: "",
    contactPhone: "+90 530 065 77 77",
    whatsappPhone: "+90 530 065 77 77",
    contactEmail: "iletisim@elitsanatvesporkulubu.com",
    location: "Silivri, Istanbul",
    copyright: "© 2026 Elit Sanat ve Spor Kulubu. Tum haklari saklidir.",
    footerBadge: "Silivri merkezli planli spor egitimi",
  },
  navbar: {
    links: [
      { label: "Branslar", href: "#programs" },
      { label: "Sistem", href: "#system" },
      { label: "Surec", href: "#process" },
      { label: "Iletisim", href: "#contact" },
    ],
    statusLabel: "Silivri kayit hatti acik",
    ctaLabel: "Hemen Kayit Ol",
    ctaHref: "/login",
  },
  hero: {
    eyebrow: "Silivri cocuk spor okulu",
    title: "Silivri'de cocugunuz",
    highlight: "yuzme,\ncimnastik ve\ntenisle planli\ngelisir.",
    description:
      "Elit Sanat ve Spor Kulubu, Silivri'de cocuklar icin yuzme, cimnastik ve tenis programlarini veli gorunurlugu, guvenli tesis akisi ve net kayit sureciyle birlestirir.",
    primaryCtaLabel: "Hemen Kayit Ol",
    primaryCtaHref: "#contact",
    secondaryCtaLabel: "WhatsApp ile Bilgi Al",
    secondaryCtaHref: "#contact",
    visualPrimaryImage:
      "https://images.unsplash.com/photo-1602211844066-d3bb556e983b?auto=format&fit=crop&w=900&q=80",
    visualSecondaryImage:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
  },
  homepageMediaRail: {
    eyebrow: "Tesis ve antrenman atmosferi",
    title: "Silivri'deki egitim ritmimizi tesisten gercek anlara bakarak hissedin.",
    description:
      "Yuzme, cimnastik ve tenis akisini yalnizca metinle degil; sahadan, tesisten ve ders ortamindan gercek karelerle gosteriyoruz.",
    ctaLabel: "Tum galeriyi gor",
    ctaHref: "/galeri",
  },
  stats: [
    {
      value: "Silivri",
      label: "lokal spor merkezi",
      description: "Tek lokasyonda hizli geri donus, net program yerlesimi ve ulasilabilir kayit akisi.",
      icon: "users",
    },
    {
      value: "3 Brans",
      label: "yuzme, cimnastik, tenis",
      description: "Yas grubu ve hedefe gore ayrilan programlarla cocuklar kendi ritminde ilerler.",
      icon: "waves",
    },
    {
      value: "Veli Paneli",
      label: "takvim ve odeme gorunurlugu",
      description: "Ders, yoklama, tahakkuk ve duyurular tek panelden izlenebilir.",
      icon: "sparkles",
    },
  ],
  methodology: {
    eyebrow: "Elit sistem omurgasi",
    title: "4G Egitim Sistemi",
    description: "Sporu yalnizca ders saati olarak degil; guven, gelisim, geri bildirim ve guleryuz ile kurulan surdurulebilir bir aile deneyimi olarak tasarliyoruz.",
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
    title: "Silivri'de her cocuk icin dogru ritmi olan bir spor programi kuruyoruz.",
    description:
      "Programlar yas, seviye ve ders ritmine gore sekillenir. Ama her programda guven, disiplin ve veli gorunurlugu ayni standardi korur.",
    items: [
      {
        title: "Yuzme Programi",
        description: "Su guveni, temel teknik ve stil gelisimi ayni planli progresyon icinde ilerler.",
        image:
          "https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?auto=format&fit=crop&w=1200&q=80",
        bullets: [
          "Suya alisma ve temel teknikler",
          "Stil gelistirme ve koordinasyon",
          "Olimpik olculerde steril havuz",
        ],
        href: "/silivri-yuzme-kursu",
        ctaLabel: "Yuzme Sayfasini Incele",
      },
      {
        title: "Cimnastik Programi",
        description: "Esneklik, denge, koordinasyon ve beden farkindaligini guclendiren temel altyapi programi.",
        image:
          "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
        bullets: [
          "Esneklik ve denge egitimi",
          "Temel akrobasi hareketleri",
          "Kondisyon ve postur duzeni",
        ],
        href: "/silivri-cimnastik-kursu",
        ctaLabel: "Cimnastik Sayfasini Incele",
      },
      {
        title: "Tenis Programi",
        description: "Dikkat, reaksiyon, koordinasyon ve saha disiplini ile ilerleyen cocuk tenis akisi.",
        image:
          "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
        bullets: [
          "Cocuklara uygun teknik temel",
          "Reaksiyon ve saha koordinasyonu",
          "Planli grup ve saat akisi",
        ],
        href: "/silivri-tenis-kursu",
        ctaLabel: "Tenis Programini Incele",
      },
    ],
  },
  coaches: {
    eyebrow: "Egitmenler",
    title: "Cocugun ritmine gore yon veren uzman ve iletisimi guclu kadro.",
    description:
      "Her egitmen saha deneyimini pedagojik yaklasim, guvenli ders akisi ve veliye karsi net iletisim diliyle birlestirir.",
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
    title: "Sadece ders acan bir yer degil,",
    highlight: "tam gorunurlu bir spor sistemi",
    description:
      "Her cocuk farkli ogrenir. Biz de Silivri'deki aileler icin kayit, takvim, gelisim, odeme ve iletisim akisini ayni sistemde toplayarak daha guvenli bir spor deneyimi kuruyoruz.",
    image:
      "https://images.unsplash.com/photo-1517837016564-bfc4fcb7d1d2?auto=format&fit=crop&w=1200&q=80",
    statValue: "Panel + Saha",
    statLabel: "tek yerden gorunurluk",
    points: [
      {
        title: "Her cocuk farkli hizda ilerler",
        description:
          "Hazirbulunusluk duzeyine gore sekillenen bir ritim kuruyor, grup yapisini buna gore planliyoruz.",
      },
      {
        title: "Uzman kadro, net operasyon",
        description:
          "Egitmen, grup, seans ve veli bilgilendirme akislarini tek cizgide yurutarak karisiklik alanlarini azaltiyoruz.",
      },
      {
        title: "Surdurulebilir gelisim",
        description:
          "Hedefimiz yalnizca performans degil; sporu seven, duzenli devam eden ve ozguven kazanan cocuklar yetistirmektir.",
      },
    ],
  },
  localProof: {
    eyebrow: "Silivri guven sinyalleri",
    title: "Ailelerin karar verirken baktigi temel guven noktalarini acik sekilde sunuyoruz.",
    description:
      "Lokasyon, veli gorunurlugu, tesis duzeni ve kayit sureci gibi kritik basliklari gizlemiyor; daha ilk ekranda gorunur hale getiriyoruz.",
    items: [
      {
        title: "Silivri merkezli net erisim",
        description: "Tek lokasyon, hizli geri donus ve ailelerin kolay bulabilecegi acik kurum kimligi.",
        icon: "map",
      },
      {
        title: "Veli paneli ile gorunurluk",
        description: "Takvim, odeme, duyuru ve gelisim sinyalleri panelde ayni yerde toplanir.",
        icon: "shield",
      },
      {
        title: "Guvenli tesis ve planli akıs",
        description: "Gruplar, alanlar ve seans ritmi karisik degil; kontrol edilebilir bir plan uzerinden ilerler.",
        icon: "clock",
      },
    ],
  },
  process: {
    eyebrow: "Kayit ve ilk ders sureci",
    title: "Bilgi almaktan ilk derse kadar sureci aile icin olabildigince sade tutuyoruz.",
    description:
      "Karar vermeyi zorlastiran belirsizligi azaltmak icin kayit oncesi iletisim, uygun grup secimi ve ilk ders akisini netlestiriyoruz.",
    steps: [
      {
        title: "1. Bilgi alin ve uygun bransi secin",
        description: "WhatsApp, telefon veya kisa form ile bize ulasin; ekibimiz yas grubu ve hedefe gore sizi yonlendirsin.",
      },
      {
        title: "2. Grup ve saat netlessin",
        description: "Yuzme, cimnastik veya tenis icin uygun grup, gun ve saat planini sizinle birlikte belirleyelim.",
      },
      {
        title: "3. Kayit, ilk ders ve panel erisimi",
        description: "Kayit sonrasi ilk ders bilgisi, odeme akisi ve veli paneli erisimi tek bir duzende aileye iletilir.",
      },
    ],
  },
  testimonials: {
    eyebrow: "Veli bakis acisi",
    title: "Ailelerin en cok deger verdigi sey, cocugun ilerlemesini ve kurum ciddiyetini ayni anda gorebilmek.",
    description:
      "SEO sayfalari ve ana sayfa yalnizca bilgi vermesin; karar asamasindaki aileye guven de versin diye yorum ve deneyim bloklarini one cikartiyoruz.",
    items: [
      {
        id: "testimonial-1",
        quote:
          "Silivri'de once duzenli iletisim aradik. Burada hem ders saatleri hem odeme hem de cocugumuzun devam durumu net oldu.",
        parentDisplayName: "Aylin K.",
        context: "Yuzme programi velisi",
        branch: "Yuzme",
        childAgeGroup: "7-10 yas",
        approved: true,
        featured: true,
        sortOrder: 1,
      },
      {
        id: "testimonial-2",
        quote:
          "Cocugumuzun hangi grupta oldugu, ilk ders saati ve sonraki adimlar karismadan ilerledi. Bizim icin en rahatlatan kisim buydu.",
        parentDisplayName: "Murat S.",
        context: "Cimnastik programi velisi",
        branch: "Cimnastik",
        childAgeGroup: "4-6 yas",
        approved: true,
        featured: true,
        sortOrder: 2,
      },
      {
        id: "testimonial-3",
        quote:
          "Tenis icin bilgi alirken sadece tanitim degil, gercek bir kayit sureci anlatildi. Bu da karar vermemizi kolaylastirdi.",
        parentDisplayName: "Zeynep T.",
        context: "Tenis programi velisi",
        branch: "Tenis",
        childAgeGroup: "10-12 yas",
        approved: true,
        featured: true,
        sortOrder: 3,
      },
    ],
  },
  galleryPage: {
    eyebrow: "Galeri",
    title: "Tesisi, branşlari ve ders atmosferini sahadan gercek karelerle inceleyin.",
    description:
      "Silivri'deki tesis, yuzme, cimnastik ve tenis akisini yayinlanan gorseller uzerinden kategori bazli inceleyebilirsiniz.",
    published: true,
    indexable: true,
    includeInSitemap: true,
  },
  galleryItems: [
    {
      id: "gallery-1",
      image:
        "https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?auto=format&fit=crop&w=1400&q=80",
      title: "Yuzme dersi hazirlik alani",
      description: "Havuz kenari akisi ve guvenli gecis ritmi.",
      category: "yuzme",
      featured: true,
      sortOrder: 1,
      published: true,
    },
    {
      id: "gallery-2",
      image:
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80",
      title: "Cimnastik koordinasyon calismasi",
      description: "Esneklik ve denge odakli cocuk grubu antrenmani.",
      category: "cimnastik",
      featured: true,
      sortOrder: 2,
      published: true,
    },
    {
      id: "gallery-3",
      image:
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1400&q=80",
      title: "Tenis saha ritmi",
      description: "Reaksiyon ve saha koordinasyonu odakli ders ortami.",
      category: "tenis",
      featured: true,
      sortOrder: 3,
      published: true,
    },
    {
      id: "gallery-4",
      image:
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1400&q=80",
      title: "Yuzme tesis genel gorunumu",
      description: "Tesis duzeni ve ders oncesi bekleme alani.",
      category: "tesis",
      featured: true,
      sortOrder: 4,
      published: true,
    },
  ],
  faq: {
    eyebrow: "Sik sorulan sorular",
    title: "Kayit, ilk ders, veli paneli ve program secimi hakkinda net cevaplar.",
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
      "Silivri'de spor okulu arayan aileler icin branş, yas grubu ve karar niyetine gore ayri sayfalar hazirliyoruz.",
    description:
      "Her branş ve lokal niyet icin ayri bilgi sayfalari hazirladik. Size en yakin karar basligina dogrudan gidin.",
    items: [
      { label: "Silivri Spor Okulu", href: "/silivri-spor-okulu" },
      { label: "Silivri Yuzme Kursu", href: "/silivri-yuzme-kursu" },
      { label: "Silivri Cimnastik Kursu", href: "/silivri-cimnastik-kursu" },
      { label: "Silivri Tenis Kursu", href: "/silivri-tenis-kursu" },
      { label: "Silivri Cocuk Spor Kursu", href: "/silivri-cocuk-spor-kursu" },
      { label: "Silivri Cocuk Yuzme Kursu", href: "/silivri-cocuk-yuzme-kursu" },
      { label: "4-6 Yas Yuzme", href: "/silivri-4-6-yas-yuzme-kursu" },
      { label: "7-10 Yas Yuzme", href: "/silivri-7-10-yas-yuzme-kursu" },
      { label: "Veli Takip Sistemi", href: "/veli-takip-sistemi" },
      { label: "Kayit ve Ilk Ders Sureci", href: "/kayit-ve-ilk-ders-sureci" },
    ],
  },
  cta: {
    title: "Program onerisi alin, uygun grubu ogrenin ve kayit surecini ayni gun icinde netlestirin.",
    description:
      "Silivri'de cocugunuz icin uygun yuzme, cimnastik veya tenis programini birlikte belirleyelim. Formu birakin, sizi arayalim.",
    mobileStickyEyebrow: "Silivri yeni kayit hatti",
    mobileStickyTitle: "Programi secmekte zorlanirsaniz bize yazin, ayni gun yonlendirelim.",
    mobileStickyWhatsAppLabel: "WhatsApp",
    mobileStickyPhoneLabel: "Telefon",
    mobileStickyPrimaryLabel: "Hemen Kayit Ol",
    whatsappLabel: "WhatsApp ile Ulas",
    phoneCtaLabel: "Telefon ile Ara",
    recommendationLabel: "Program Onerisi Iste",
    recommendationHref: "#contact",
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
      "Program onerisi istiyorum",
    ],
    submitLabel: "Basvuruyu Gonder",
    footnote: "Bu form bilgi alma ve ilk iletisim icindir; kaynak bilgisi ile birlikte admin ve manager paneline duser.",
  },
  footer: {
    description:
      "Silivri'de cocuklar icin yuzme, cimnastik ve tenis odakli planli spor egitimi sunuyoruz.",
    groups: [
      {
        title: "Kurumsal",
        links: [
          { label: "Elit Sanat ve Spor Kulubu", href: "/elit-sanat-ve-spor-kulubu" },
          { label: "Iletisim", href: "/iletisim" },
          { label: "Kayit ve ilk ders", href: "/kayit-ve-ilk-ders-sureci" },
          { label: "Veli takip sistemi", href: "/veli-takip-sistemi" },
          { label: "Galeri", href: "/galeri" },
        ],
      },
      {
        title: "Branslar",
        links: [
          { label: "Silivri Yuzme Kursu", href: "/silivri-yuzme-kursu" },
          { label: "Silivri Cimnastik Kursu", href: "/silivri-cimnastik-kursu" },
          { label: "Silivri Tenis Kursu", href: "/silivri-tenis-kursu" },
          { label: "Silivri Cocuk Spor Kursu", href: "/silivri-cocuk-spor-kursu" },
        ],
      },
    ],
    socials: [
      { label: "IG", href: "https://instagram.com", icon: "instagram" },
      { label: "YT", href: "https://youtube.com", icon: "youtube" },
    ],
    bottomText: "Elit Sanat ve Spor Kulubu · Silivri",
    bottomBadge: "Yuzme, cimnastik ve tenis odakli cocuk spor kulubu",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function createLandingEntityId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function mergeUnknown(base: unknown, override: unknown): unknown {
  if (Array.isArray(base)) {
    if (!Array.isArray(override)) {
      return base;
    }

    return override.map((overrideItem, index) => {
      const baseItem = base[index];
      return baseItem === undefined ? overrideItem : mergeUnknown(baseItem, overrideItem);
    });
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

  const merged = mergeUnknown(base, override) as LandingContent;

  merged.testimonials.items = merged.testimonials.items
    .map((item, index) => {
      const legacyItem = item as { author?: string };
      const legacyAuthor =
        typeof legacyItem.author === "string" ? legacyItem.author : "";

      return {
        ...item,
        id: item.id || createLandingEntityId("testimonial"),
        parentDisplayName: item.parentDisplayName || legacyAuthor || "Veli",
        branch: item.branch || "Genel",
        childAgeGroup: item.childAgeGroup || "",
        approved: typeof item.approved === "boolean" ? item.approved : true,
        featured: typeof item.featured === "boolean" ? item.featured : index < 3,
        sortOrder:
          typeof item.sortOrder === "number" && Number.isFinite(item.sortOrder)
            ? item.sortOrder
            : index + 1,
      };
    })
    .sort((left, right) => left.sortOrder - right.sortOrder);

  merged.galleryItems = merged.galleryItems
    .map((item, index) => ({
      ...item,
      id: item.id || createLandingEntityId("gallery"),
      description: item.description || "",
      category: item.category || "genel",
      featured: typeof item.featured === "boolean" ? item.featured : index < 4,
      sortOrder:
        typeof item.sortOrder === "number" && Number.isFinite(item.sortOrder)
          ? item.sortOrder
          : index + 1,
      published: typeof item.published === "boolean" ? item.published : true,
    }))
    .sort((left, right) => left.sortOrder - right.sortOrder);

  merged.galleryPage = {
    ...merged.galleryPage,
    published:
      typeof merged.galleryPage.published === "boolean" ? merged.galleryPage.published : true,
    indexable:
      typeof merged.galleryPage.indexable === "boolean" ? merged.galleryPage.indexable : true,
    includeInSitemap:
      typeof merged.galleryPage.includeInSitemap === "boolean"
        ? merged.galleryPage.includeInSitemap
        : true,
  };

  return merged;
}
