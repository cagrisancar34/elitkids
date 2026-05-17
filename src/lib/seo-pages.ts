export type SeoPageType = "service" | "brand" | "contact";

export type SeoFaqItem = {
  question: string;
  answer: string;
};

export type SeoPageContent = {
  slug: string;
  pageType: SeoPageType;
  status?: "draft" | "published" | "archived";
  title: string;
  seoTitle: string;
  metaDescription: string;
  canonicalPath: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  introTitle: string;
  introBody: string;
  sectionOneTitle: string;
  sectionOneBody: string;
  sectionTwoTitle: string;
  sectionTwoBody: string;
  sectionThreeTitle: string;
  sectionThreeBody: string;
  bulletItems: string[];
  faqTitle: string;
  faqDescription: string;
  faqItems: SeoFaqItem[];
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  locationTitle: string;
  locationBody: string;
  targetLocation?: string;
  targetBranch?: string;
  targetAgeGroup?: string;
  testimonialQuote?: string;
  testimonialAuthor?: string;
  testimonialRole?: string;
  internalLinks?: Array<{
    label: string;
    href: string;
  }>;
  published: boolean;
  indexable?: boolean;
  includeInSitemap?: boolean;
};

export type SeoPageStorageRecord = {
  slug: string;
  content: SeoPageContent;
  updatedAt: string | null;
};

export const seoPageStoragePrefix = "seo-page:";

export const defaultSeoPages: SeoPageContent[] = [
  {
    slug: "silivri-spor-okulu",
    pageType: "service",
    title: "Silivri Spor Okulu",
    seoTitle: "Silivri Spor Okulu | Elit Sanat ve Spor Kulubu",
    metaDescription:
      "Silivri spor okulu arayan aileler icin yuzme, cimnastik ve tenis odakli premium egitim akisi. Elit Sanat ve Spor Kulubu ile cocugunuz dogru sistemle ilerlesin.",
    canonicalPath: "/silivri-spor-okulu",
    heroEyebrow: "Silivri lokal gelisim merkezi",
    heroTitle: "Silivri spor okulu arayan aileler icin dogru sistem burada.",
    heroDescription:
      "Elit Sanat ve Spor Kulubu, Silivri'de yuzme, cimnastik ve tenis branlarinda cocuklarin yasina uygun premium spor egitimi sunar.",
    introTitle: "Silivri'de spora dogru baslangic",
    introBody:
      "Sporu sadece ders saati olarak degil; disiplin, motor gelisim ve ozguven insasi olarak kuruyoruz. Silivri'de spor okulu arayan aileler icin kayit, takip ve veli iletisim akisi ayni sistemde ilerler.",
    sectionOneTitle: "Brans yapisi",
    sectionOneBody:
      "Yuzme, cimnastik ve tenis programlari yas gruplarina gore planlanir. Her brans kendi ritmine, kendi egitmen cizgisine ve kendi gelisim adimlarina sahiptir.",
    sectionTwoTitle: "Veli gorunurlugu",
    sectionTwoBody:
      "Veliler takvim, yoklama, odeme ve gelisim akislarini panel uzerinden izleyebilir. Bu sayede spor deneyimi sadece sahada degil, evde de gorunur hale gelir.",
    sectionThreeTitle: "Silivri odakli operasyon",
    sectionThreeBody:
      "Tek fiziksel lokasyon, net program akisi ve hizli geri donus sistemi ile Silivri icindeki aileler icin ulasilabilir ve kontrollu bir spor deneyimi sunuyoruz.",
    bulletItems: [
      "Silivri merkezli net lokasyon ve ulasim kolayligi",
      "Yuzme, cimnastik ve tenis icin ayri program yapisi",
      "Veli paneli ile takvim, odeme ve ilerleme gorunurlugu",
      "Planli kayit ve hizli geri donus akisi",
    ],
    faqTitle: "Silivri spor okulu hakkinda sik sorulanlar",
    faqDescription:
      "Program secimi, yas grubu ve kayit sureci hakkinda en cok sorulan basliklari burada topladik.",
    faqItems: [
      {
        question: "Silivri spor okulu olarak hangi branlari sunuyorsunuz?",
        answer:
          "Yuzme, cimnastik ve tenis odakli programlarimiz bulunur. Yas grubu ve hedefe gore en uygun program akisi onerilir.",
      },
      {
        question: "Kayit once bilgi alma seklinde yapilabiliyor mu?",
        answer:
          "Evet. Anasayfadaki bilgi alma formu ile ekip size geri doner, uygun program ve yas grubu eslestirmesi yapilir.",
      },
      {
        question: "Veliler programi nasil takip ediyor?",
        answer:
          "Takvim, yoklama, odeme ve gelisim sinyalleri veli panelinde goruntulenebilir.",
      },
    ],
    ctaTitle: "Silivri'de cocugunuz icin uygun spor programini birlikte belirleyelim.",
    ctaDescription:
      "Bilgi alma formunu doldurun ya da dogrudan bizi arayin. Ekip ayni gun icinde size geri donsun.",
    ctaPrimaryLabel: "Bilgi al",
    ctaPrimaryHref: "/#contact",
    ctaSecondaryLabel: "Hemen kayit ol",
    ctaSecondaryHref: "/#hero",
    locationTitle: "Silivri lokasyonu",
    locationBody:
      "Elit Sanat ve Spor Kulubu, Silivri'de cocuklara premium spor deneyimi sunan merkezi bir tesis yapisinda hizmet verir.",
    targetLocation: "Silivri",
    targetBranch: "Yuzme, cimnastik ve tenis",
    targetAgeGroup: "4-14 yas",
    testimonialQuote:
      "Karar verirken yalnizca bir kurs degil, cocugumuzun devamini gorebildigimiz bir sistem ariyorduk.",
    testimonialAuthor: "Derya A.",
    testimonialRole: "Silivri spor okulu velisi",
    internalLinks: [
      { label: "Silivri Yuzme Kursu", href: "/silivri-yuzme-kursu" },
      { label: "Silivri Cimnastik Kursu", href: "/silivri-cimnastik-kursu" },
      { label: "Kayit ve Ilk Ders Sureci", href: "/kayit-ve-ilk-ders-sureci" },
    ],
    published: true,
  },
  {
    slug: "silivri-yuzme-kursu",
    pageType: "service",
    title: "Silivri Yuzme Kursu",
    seoTitle: "Silivri Yuzme Kursu | Elit Sanat ve Spor Kulubu",
    metaDescription:
      "Silivri yuzme kursu arayan aileler icin teknik gelisim, su guveni ve yas grubuna uygun premium yuzme programi.",
    canonicalPath: "/silivri-yuzme-kursu",
    heroEyebrow: "Yuzme programi",
    heroTitle: "Silivri yuzme kursu arayan aileler icin planli ve guvenli bir sistem.",
    heroDescription:
      "Su guveni, temel teknik ve stil gelisimi ayni egitim cizgisinde ilerler. Elit Sanat ve Spor Kulubu'nde yuzme sadece ders degil, kontrollu gelisim programidir.",
    introTitle: "Yuzmede guven ve teknik ayni anda ilerler",
    introBody:
      "Silivri yuzme kursu ihtiyacinda en onemli konu cocugun suya güvenle adapte olmasi ve dogru teknikle ilerlemesidir. Programlarimiz yas ve seviyeye gore kademelendirilir.",
    sectionOneTitle: "Seviye temelli planlama",
    sectionOneBody:
      "Yeni baslayan ogrenciler, suya alisma ve temel nefes ritmiyle ilerler. Orta ve ileri seviyelerde teknik detay ve kondisyon odagi artar.",
    sectionTwoTitle: "Aile icin net gorunurluk",
    sectionTwoBody:
      "Veliler takvim ve devam akislarini panelden takip ederek ders duzenini net sekilde gorebilir.",
    sectionThreeTitle: "Silivri'de yuzme egitimi arayanlar icin fark",
    sectionThreeBody:
      "Duzensiz ders yerine surekli bir progresyon modeli kuruyoruz; bu da cocuklarda teknik ve ozguven gelisimini hizlandirir.",
    bulletItems: [
      "Suya alisma ve temel teknik egitimi",
      "Seviyeye gore grup planlamasi",
      "Veliye acik ders ve devam gorunurlugu",
      "Silivri merkezli planli yuzme programi",
    ],
    faqTitle: "Silivri yuzme kursu FAQ",
    faqDescription: "Yuzme egitimiyle ilgili temel sorularin kisa cevaplari.",
    faqItems: [
      {
        question: "Silivri'de yuzme kursu kac yas icin uygun?",
        answer:
          "Program yapisi yas ve hazirbulunusluk duzeyine gore ayrilir. Uygun gruplandirma ekip tarafindan belirlenir.",
      },
      {
        question: "Yuzme kursunda hedef sadece teknik mi?",
        answer:
          "Hayir. Su guveni, koordinasyon, kondisyon ve disiplin de ayni programin parcasi olarak ilerler.",
      },
      {
        question: "Bilgi almadan kayit olur muyum?",
        answer:
          "Isterseniz once bilgi alma formu doldurup uygun grup ve saatleri ogrenebilirsiniz.",
      },
    ],
    ctaTitle: "Silivri yuzme kursu icin size uygun grup planini iletelim.",
    ctaDescription:
      "Bilgi alma formunu doldurun ya da dogrudan telefon ve WhatsApp hattimizdan bize ulasin.",
    ctaPrimaryLabel: "Bilgi alma formu",
    ctaPrimaryHref: "/#contact",
    ctaSecondaryLabel: "WhatsApp ile ulas",
    ctaSecondaryHref: "/#contact",
    locationTitle: "Silivri'de yuzme egitimi",
    locationBody:
      "Programlar Silivri lokasyonunda guvenli, planli ve veliye acik bir operasyon ritmiyle yurur.",
    targetLocation: "Silivri",
    targetBranch: "Yuzme",
    targetAgeGroup: "4-14 yas",
    testimonialQuote:
      "Yuzme icin arastirma yaparken duzenli saat, net grup yapisi ve veli gorunurlugu bizim icin en kritik konulardi.",
    testimonialAuthor: "Seda T.",
    testimonialRole: "Yuzme programi velisi",
    internalLinks: [
      { label: "Silivri Cocuk Yuzme Kursu", href: "/silivri-cocuk-yuzme-kursu" },
      { label: "4-6 Yas Yuzme", href: "/silivri-4-6-yas-yuzme-kursu" },
      { label: "7-10 Yas Yuzme", href: "/silivri-7-10-yas-yuzme-kursu" },
    ],
    published: true,
  },
  {
    slug: "silivri-cimnastik-kursu",
    pageType: "service",
    title: "Silivri Cimnastik Kursu",
    seoTitle: "Silivri Cimnastik Kursu | Elit Sanat ve Spor Kulubu",
    metaDescription:
      "Silivri cimnastik kursu arayan aileler icin esneklik, denge ve koordinasyon odakli premium cocuk cimnastik programi.",
    canonicalPath: "/silivri-cimnastik-kursu",
    heroEyebrow: "Cimnastik programi",
    heroTitle: "Silivri cimnastik kursu arayan aileler icin guclu koordinasyon hattı.",
    heroDescription:
      "Elit Sanat ve Spor Kulubu'nde cimnastik programlari esneklik, denge, postur ve ozguven gelişimini ayni ritimde ilerletir.",
    introTitle: "Cimnastik ile temel beden farkindaligi",
    introBody:
      "Silivri cimnastik kursu aramalarinda ailelerin en cok aradigi konu cocugun temel beden hakimiyetini guvenli sekilde gelistirmesidir. Programlarimiz tam olarak bu ihtiyaca cevap verir.",
    sectionOneTitle: "Denge ve koordinasyon",
    sectionOneBody:
      "Temel hareket kaliplari, esneklik ve denge egzersizleri cocugun genel spor altyapisini guclendirir.",
    sectionTwoTitle: "Postur ve kontrol",
    sectionTwoBody:
      "Duzenli cimnastik egitimi beden farkindaligini ve durus kalitesini destekler; bu da diger spor branslarina da olumlu yansir.",
    sectionThreeTitle: "Silivri'de premium grup duzeni",
    sectionThreeBody:
      "Gruplar yas ve seviyeye gore ayrilir, cocuklar kendilerine uygun tempoda ama net bir metodoloji ile ilerler.",
    bulletItems: [
      "Esneklik, denge ve koordinasyon gelisimi",
      "Guvenli grup akisi ve pedagojik iletisim",
      "Postur ve beden farkindaligi odagi",
      "Silivri icinde planli cimnastik egitimi",
    ],
    faqTitle: "Silivri cimnastik kursu FAQ",
    faqDescription: "Cimnastik programi hakkinda sik sorulan sorular.",
    faqItems: [
      {
        question: "Cimnastik hangi cocuklar icin uygundur?",
        answer:
          "Motor beceri, esneklik ve koordinasyon gelistirmek isteyen cocuklar icin guclu bir temel programdir.",
      },
      {
        question: "Programlar yas grubuna gore ayriliyor mu?",
        answer:
          "Evet. Yas ve hazirbulunusluk seviyesine gore ayrilan gruplar sayesinde cocuklar kendi ritimlerinde ilerler.",
      },
      {
        question: "Veliler ders akisini goruntuleyebiliyor mu?",
        answer:
          "Takvim, yoklama ve genel ilerleme sinyalleri veli tarafinda gorulebilir.",
      },
    ],
    ctaTitle: "Silivri cimnastik kursu icin uygun grup ve saatleri ogrenin.",
    ctaDescription:
      "Ekip size geri donsun; yas grubu ve hedefe gore en uygun cimnastik planini paylasalim.",
    ctaPrimaryLabel: "Bilgi al",
    ctaPrimaryHref: "/#contact",
    ctaSecondaryLabel: "Telefon ile ara",
    ctaSecondaryHref: "/#contact",
    locationTitle: "Silivri'de cimnastik egitimi",
    locationBody:
      "Silivri lokasyonunda cocuklar icin koordinasyon ve denge odakli premium cimnastik akisi sunuyoruz.",
    targetLocation: "Silivri",
    targetBranch: "Cimnastik",
    targetAgeGroup: "4-12 yas",
    testimonialQuote:
      "Cimnastikte aradigimiz sey sadece hareket degil, cocugumuzun ozguvenle ve guvenli bir ortamda ilerlemesiydi.",
    testimonialAuthor: "Pelin Y.",
    testimonialRole: "Cimnastik programi velisi",
    internalLinks: [
      { label: "Silivri Jimnastik Kursu", href: "/silivri-jimnastik-kursu" },
      { label: "Silivri Cocuk Spor Kursu", href: "/silivri-cocuk-spor-kursu" },
      { label: "Veli Takip Sistemi", href: "/veli-takip-sistemi" },
    ],
    published: true,
  },
  {
    slug: "silivri-jimnastik-kursu",
    pageType: "service",
    title: "Silivri Jimnastik Kursu",
    seoTitle: "Silivri Jimnastik Kursu | Elit Sanat ve Spor Kulubu",
    metaDescription:
      "Silivri jimnastik kursu aramalarinda denge, esneklik ve temel beden kontrolune odaklanan premium cocuk programi.",
    canonicalPath: "/silivri-jimnastik-kursu",
    heroEyebrow: "Jimnastik programi",
    heroTitle: "Silivri jimnastik kursu icin aradiginiz duzenli gelisim modeli.",
    heroDescription:
      "Cimnastik ve jimnastik aramalarinin iki varyasyonunu da ayni profesyonel hizmet yapisiyla karsiliyoruz: kontrollu, guvenli ve veliye acik spor egitimi.",
    introTitle: "Jimnastikte dogru temel",
    introBody:
      "Silivri jimnastik kursu arayan aileler icin temel ihtiyac; cocugun esneklik, denge ve koordinasyon yapisini guvenli sekilde gelistirmektir. Programin temeli bu yaklasimdir.",
    sectionOneTitle: "Temel hareket egitimi",
    sectionOneBody:
      "Jimnastik dersleri hareket kalitesi ve beden kontrolunu sistemli sekilde guclendirir. Bu da cocugun spora adaptasyonunu kolaylastirir.",
    sectionTwoTitle: "Erken yas avantajı",
    sectionTwoBody:
      "Erken yaslarda beden farkindaligi kazanimi, hem spor hem gunluk yasam disiplini acisindan belirgin fayda saglar.",
    sectionThreeTitle: "Silivri icin net kayit akisi",
    sectionThreeBody:
      "Aile once bilgi alir, sonra uygun saat ve grup eslestirilir. Kayit sureci rastgele degil, kontrollu ilerler.",
    bulletItems: [
      "Denge ve hareket kalitesini guclendiren program",
      "Erken yas icin uygun grup akisi",
      "Silivri icinde planli kayit ve takip yapisi",
      "Veliler icin net iletisim ve gorunurluk",
    ],
    faqTitle: "Silivri jimnastik kursu FAQ",
    faqDescription: "Jimnastik aramalari icin en gerekli cevaplar.",
    faqItems: [
      {
        question: "Jimnastik ve cimnastik ayri programlar mi?",
        answer:
          "Kullanim farkli yazimlardan gelir; hizmet omurgasi ayni koordinasyon ve beden gelisimi cizgisinde ilerler.",
      },
      {
        question: "Silivri'de deneme dersi oluyor mu?",
        answer:
          "Uygun gruplarda once bilgi alma ve tanisma sureci planlanabilir.",
      },
      {
        question: "Veliler ne kadar gorunurluk alir?",
        answer:
          "Program takvimi ve operasyon sinyalleri veli tarafinda takip edilebilir.",
      },
    ],
    ctaTitle: "Silivri jimnastik kursu icin uygun grubu birlikte belirleyelim.",
    ctaDescription:
      "Bilgi alma formu, telefon ve WhatsApp hatti ile hizli sekilde bize ulasabilirsiniz.",
    ctaPrimaryLabel: "Bilgi alma formu",
    ctaPrimaryHref: "/#contact",
    ctaSecondaryLabel: "WhatsApp ile ulas",
    ctaSecondaryHref: "/#contact",
    locationTitle: "Silivri'de jimnastik egitimi",
    locationBody:
      "Silivri lokasyonumuzda jimnastik/cimnastik egitimini ayni premium metodoloji ile sunuyoruz.",
    targetLocation: "Silivri",
    targetBranch: "Jimnastik",
    targetAgeGroup: "4-12 yas",
    testimonialQuote:
      "Yazim farkli olsa da biz asil olarak guvenli ve duzenli bir beden gelisimi programi ariyorduk.",
    testimonialAuthor: "Gul K.",
    testimonialRole: "Jimnastik programi velisi",
    internalLinks: [
      { label: "Silivri Cimnastik Kursu", href: "/silivri-cimnastik-kursu" },
      { label: "Kayit ve Ilk Ders Sureci", href: "/kayit-ve-ilk-ders-sureci" },
      { label: "Iletisim", href: "/iletisim" },
    ],
    published: true,
  },
  {
    slug: "silivri-tenis-kursu",
    pageType: "service",
    title: "Silivri Tenis Kursu",
    seoTitle: "Silivri Tenis Kursu | Elit Sanat ve Spor Kulubu",
    metaDescription:
      "Silivri tenis kursu arayan aileler icin koordinasyon, dikkat ve disiplin odakli premium cocuk tenis programi.",
    canonicalPath: "/silivri-tenis-kursu",
    heroEyebrow: "Tenis programi",
    heroTitle: "Silivri tenis kursu icin cocuklara uygun ritim, saha ve takip yapisi.",
    heroDescription:
      "Tenis programlari koordinasyon, dikkat, reaksiyon ve disiplin gelisimini ayni egitim hattinda toplar. Elit Sanat ve Spor Kulubu bunu Silivri'de sistemli sekilde sunar.",
    introTitle: "Teniste teknikten once temel koordinasyon",
    introBody:
      "Silivri tenis kursu aramalarinda ailelerin en cok bekledigi sey; cocugun oyunu sevecegi ama ayni zamanda duzenli teknik altyapi kazanacagi bir sistemdir. Program yapimiz bunun icin kuruldu.",
    sectionOneTitle: "Oyunla ogreten plan",
    sectionOneBody:
      "Derslerde dikkat ve motivasyon kaybolmadan teknik temel insa edilir; boylece spor kalici hale gelir.",
    sectionTwoTitle: "Bireysel ritim + grup disiplini",
    sectionTwoBody:
      "Cocuklar bir yandan kendi hizlarinda ilerler, diger yandan grup icinde saha disiplini kazanir.",
    sectionThreeTitle: "Silivri'de erisilebilir tenis egitimi",
    sectionThreeBody:
      "Ailelere uygun saatler, net tesis bilgisi ve hizli geri donus sistemi sayesinde karar sureci kolaylasir.",
    bulletItems: [
      "Koordinasyon ve dikkat gelisimi",
      "Cocuklara uygun teknik temel",
      "Saha disiplini ve surekli ilerleme",
      "Silivri icinde premium tenis programi",
    ],
    faqTitle: "Silivri tenis kursu FAQ",
    faqDescription: "Tenis programi ile ilgili en cok sorulan sorular.",
    faqItems: [
      {
        question: "Tenis kursu hangi cocuklar icin uygun?",
        answer:
          "Reaksiyon, koordinasyon ve odak gelistirmek isteyen cocuklar icin cok guclu bir brans yapisidir.",
      },
      {
        question: "Silivri tenis kursunda seviyeler ayriliyor mu?",
        answer:
          "Evet. Baslangic ve ilerleyen ogrenciler ayni tempoda degil, uygun seviye akisi ile ilerler.",
      },
      {
        question: "Bilgi alip sonra kayit olabilir miyim?",
        answer:
          "Evet. Once form doldurup geri arama alabilir, sonra size uygun gruba gecis yapabilirsiniz.",
      },
    ],
    ctaTitle: "Silivri tenis kursu icin uygun saat ve grup bilgisini alin.",
    ctaDescription:
      "Ayni gun icinde size geri donelim ve tenis programi icin net yonlendirme yapalim.",
    ctaPrimaryLabel: "Bilgi al",
    ctaPrimaryHref: "/#contact",
    ctaSecondaryLabel: "Telefon ile ara",
    ctaSecondaryHref: "/#contact",
    locationTitle: "Silivri'de tenis",
    locationBody:
      "Silivri lokasyonumuzda tenis egitimi; saha duzeni, koordinasyon odagi ve veli iletisim gorunurlugu ile sunulur.",
    targetLocation: "Silivri",
    targetBranch: "Tenis",
    targetAgeGroup: "6-14 yas",
    testimonialQuote:
      "Tenis tarafinda en rahatlatan sey, cocugumuzun hangi grupta oldugu ve surecin nasil islediginin acik sekilde anlatilmasiydi.",
    testimonialAuthor: "Onur B.",
    testimonialRole: "Tenis programi velisi",
    internalLinks: [
      { label: "Silivri Spor Okulu", href: "/silivri-spor-okulu" },
      { label: "Veli Takip Sistemi", href: "/veli-takip-sistemi" },
      { label: "Iletisim", href: "/iletisim" },
    ],
    published: true,
  },
  {
    slug: "silivri-cocuk-spor-kursu",
    pageType: "service",
    title: "Silivri Cocuk Spor Kursu",
    seoTitle: "Silivri Cocuk Spor Kursu | Elit Sanat ve Spor Kulubu",
    metaDescription:
      "Silivri'de cocuk spor kursu arayan aileler icin yuzme, cimnastik ve tenis odakli planli program yapisi.",
    canonicalPath: "/silivri-cocuk-spor-kursu",
    heroEyebrow: "Cocuk spor kursu",
    heroTitle: "Silivri'de cocuk spor kursu arayan aileler icin guvenli ve planli bir merkez.",
    heroDescription:
      "Tek branşa sikismayan, yas grubu ve hedefe gore dogru programi onerilen bir spor okulu modeli kuruyoruz.",
    introTitle: "Cocuk sporunda karar verirken en onemli konu",
    introBody:
      "Ailelerin aradigi sey genellikle bir branstan once duzen, guven ve devam edilebilirliktir. Biz bu temeli Silivri'de net bir operasyon akisi ile kuruyoruz.",
    sectionOneTitle: "Brans eslestirmesi",
    sectionOneBody:
      "Cocugun yasina, enerjisine ve hedeflerine gore yuzme, cimnastik veya tenis akisi birlikte belirlenir.",
    sectionTwoTitle: "Veli icin karar kolayligi",
    sectionTwoBody:
      "Saat, grup, odeme ve ilk ders sureci bastan netlesir; boylece kayit sonrasi belirsizlik azalir.",
    sectionThreeTitle: "Silivri lokal guveni",
    sectionThreeBody:
      "Tek merkezli ve ulasilabilir bir yapi ile ailelerin karar verme surecini hizlandiriyoruz.",
    bulletItems: [
      "Yuzme, cimnastik ve tenis secenekleri",
      "Yas grubu ve hedefe gore yonlendirme",
      "Veli paneli ile gorunur takip",
      "Silivri merkezli hizli geri donus",
    ],
    faqTitle: "Silivri cocuk spor kursu FAQ",
    faqDescription: "Ailelerin karar verirken sordugu temel sorular.",
    faqItems: [
      {
        question: "Cocugum icin en uygun bransi nasil belirleriz?",
        answer:
          "Yas, deneyim ve beklentiye gore ekip sizi yuzme, cimnastik veya tenis programlarina yonlendirir.",
      },
      {
        question: "Kayit oncesi bilgi alabilir miyim?",
        answer:
          "Evet. Kisa form, telefon veya WhatsApp ile once bilgi alip sonra kayda gecebilirsiniz.",
      },
      {
        question: "Veliler sureci gorebilir mi?",
        answer:
          "Takvim, odeme ve duyurular veli paneli uzerinden izlenebilir.",
      },
    ],
    ctaTitle: "Silivri'de cocugunuz icin dogru spor programini birlikte belirleyelim.",
    ctaDescription:
      "Ekip size donsun; uygun brans, grup ve ilk ders surecini netlestirelim.",
    ctaPrimaryLabel: "Program onerisi al",
    ctaPrimaryHref: "/#contact",
    ctaSecondaryLabel: "WhatsApp ile sor",
    ctaSecondaryHref: "/#contact",
    locationTitle: "Silivri'de cocuk spor merkezi",
    locationBody:
      "Silivri'de ailelerin kolay ulasabildigi ve kayit surecini net okuyabildigi bir spor operasyon merkezi olarak calisiyoruz.",
    targetLocation: "Silivri",
    targetBranch: "Cocuk spor kursu",
    targetAgeGroup: "4-14 yas",
    testimonialQuote:
      "Brans seciminden once bize surecin sade ve duzenli anlatilmasi karar vermemizi cok kolaylastirdi.",
    testimonialAuthor: "Nihan C.",
    testimonialRole: "Genel spor programi velisi",
    internalLinks: [
      { label: "Silivri Spor Okulu", href: "/silivri-spor-okulu" },
      { label: "Silivri Yuzme Kursu", href: "/silivri-yuzme-kursu" },
      { label: "Silivri Cimnastik Kursu", href: "/silivri-cimnastik-kursu" },
    ],
    published: true,
  },
  {
    slug: "silivri-cocuk-yuzme-kursu",
    pageType: "service",
    title: "Silivri Cocuk Yuzme Kursu",
    seoTitle: "Silivri Cocuk Yuzme Kursu | Elit Sanat ve Spor Kulubu",
    metaDescription:
      "Silivri cocuk yuzme kursu arayan aileler icin yas grubuna uygun, guvenli ve planli yuzme programi.",
    canonicalPath: "/silivri-cocuk-yuzme-kursu",
    heroEyebrow: "Cocuk yuzme kursu",
    heroTitle: "Silivri'de cocuk yuzme kursu icin guvenli baslangic ve net seviye ilerlemesi.",
    heroDescription:
      "Suya alisma, temel teknik ve duzenli devam mantigi bir arada yurur. Aileler de sureci yakindan izleyebilir.",
    introTitle: "Cocuk yuzme kursunda neye bakilmali",
    introBody:
      "Yalnizca havuz degil; grup plani, egitmen dili, ilk ders sureci ve veli iletisimi de karar asamasinda kritik rol oynar.",
    sectionOneTitle: "Ilk hedef su guveni",
    sectionOneBody:
      "Ozellikle baslangic seviyesinde suya guvenli adaptasyon ve temel nefes ritmi, teknikten once gelir.",
    sectionTwoTitle: "Duzene dayali ilerleme",
    sectionTwoBody:
      "Seans takvimi ve grup ritmi net oldugu icin aileler cocugun duzenli ilerlemesini daha rahat takip eder.",
    sectionThreeTitle: "Silivri icin uygun erisim",
    sectionThreeBody:
      "Lokal aileler icin hizli geri donus ve kolay ulasim da karar vermeyi destekler.",
    bulletItems: [
      "Suya alisma ve temel teknik",
      "Yas grubuna gore planlama",
      "Veli paneli ile gorunurluk",
      "Silivri merkezli yuzme operasyonu",
    ],
    faqTitle: "Silivri cocuk yuzme kursu FAQ",
    faqDescription: "Cocuk yuzme kursu icin en cok sorulan konular.",
    faqItems: [
      {
        question: "Cocugum yuzmeye korkarak basliyorsa yine uygun mu?",
        answer:
          "Evet. Baslangic akisi su guveni ve dogru adaptasyon uzerine kurulur.",
      },
      {
        question: "Yuzme derslerinin devamini nasil takip ederiz?",
        answer:
          "Seans, devam ve ilgili duyurular veli panelinde gorulebilir.",
      },
      {
        question: "Yas grubuna gore ayri gruplar var mi?",
        answer:
          "Evet. Yas ve seviye birlikte degerlendirilerek uygun grup planlanir.",
      },
    ],
    ctaTitle: "Silivri'de cocugunuz icin uygun yuzme grubunu ogrenin.",
    ctaDescription:
      "Yas grubu, saat ve ilk ders surecini netlestirmek icin bize ulasin.",
    ctaPrimaryLabel: "Bilgi al",
    ctaPrimaryHref: "/#contact",
    ctaSecondaryLabel: "Telefon ile gorus",
    ctaSecondaryHref: "/#contact",
    locationTitle: "Silivri yuzme lokasyonu",
    locationBody:
      "Silivri'de ailelerin kolay ulasabildigi planli bir yuzme programi akisi sunuyoruz.",
    targetLocation: "Silivri",
    targetBranch: "Cocuk yuzme kursu",
    targetAgeGroup: "4-14 yas",
    testimonialQuote:
      "Ilk gorusmede hem su guveni hem grup duzeni hem de veli paneli konusu birlikte anlatildi. Bu cok degerliydi.",
    testimonialAuthor: "Asli D.",
    testimonialRole: "Cocuk yuzme kursu velisi",
    internalLinks: [
      { label: "Silivri Yuzme Kursu", href: "/silivri-yuzme-kursu" },
      { label: "4-6 Yas Yuzme", href: "/silivri-4-6-yas-yuzme-kursu" },
      { label: "7-10 Yas Yuzme", href: "/silivri-7-10-yas-yuzme-kursu" },
    ],
    published: true,
  },
  {
    slug: "silivri-4-6-yas-yuzme-kursu",
    pageType: "service",
    title: "Silivri 4-6 Yas Yuzme Kursu",
    seoTitle: "Silivri 4-6 Yas Yuzme Kursu | Elit Sanat ve Spor Kulubu",
    metaDescription:
      "Silivri'de 4-6 yas yuzme kursu arayan aileler icin su guveni ve erken yas adaptasyonuna odakli program.",
    canonicalPath: "/silivri-4-6-yas-yuzme-kursu",
    heroEyebrow: "Erken yas yuzme",
    heroTitle: "Silivri'de 4-6 yas yuzme kursu icin guven ve alisma ritmi once gelir.",
    heroDescription:
      "Bu yas grubunda amac yalnizca teknik degil; suyla dogru tanisma, oyunla adaptasyon ve guvenli ilerlemedir.",
    introTitle: "4-6 yas icin beklenti nedir",
    introBody:
      "Erken yas yuzme programi, cocugun suya duygusal adaptasyonunu ve temel hareket uyumunu desteklemelidir.",
    sectionOneTitle: "Yumusak baslangic",
    sectionOneBody:
      "Ders ritmi yas grubunun dikkat ve guven ihtiyacina gore planlanir.",
    sectionTwoTitle: "Aile icin net gorunurluk",
    sectionTwoBody:
      "Veliler hem sureci hem de ilk ders sonrasi adimlari daha rahat takip eder.",
    sectionThreeTitle: "Silivri'de lokal kolaylik",
    sectionThreeBody:
      "Kisa ulasim ve net seans saatleri bu yas grubunda duzeni korumayi kolaylastirir.",
    bulletItems: [
      "Suya alisma odakli baslangic",
      "Oyun ve ritim destekli anlatim",
      "Yas grubuna uygun seans yapisi",
      "Veli ile net iletisim akisi",
    ],
    faqTitle: "4-6 yas yuzme FAQ",
    faqDescription: "Erken yas yuzme programi icin temel cevaplar.",
    faqItems: [
      {
        question: "Bu yas grubunda teknik egitim agir mi ilerler?",
        answer:
          "Hayir. Ilk hedef guven, alisma ve suyla pozitif bir iliski kurmaktir.",
      },
      {
        question: "Ilk derste ne beklemeliyiz?",
        answer:
          "Cocugun rahatlamasi, egitmenle bag kurmasi ve havuzla guvenli tanismasi hedeflenir.",
      },
      {
        question: "Ders saatleri duzenli midir?",
        answer:
          "Evet. Programlar net grup ve saat ritmiyle olusturulur.",
      },
    ],
    ctaTitle: "4-6 yas icin uygun yuzme grubunu birlikte belirleyelim.",
    ctaDescription:
      "Yas grubuna uygun saat ve ilk ders surecini netlestirmek icin bilgi alin.",
    ctaPrimaryLabel: "Bilgi al",
    ctaPrimaryHref: "/#contact",
    ctaSecondaryLabel: "WhatsApp ile sor",
    ctaSecondaryHref: "/#contact",
    locationTitle: "Silivri erken yas yuzme",
    locationBody:
      "Silivri'de erken yas cocuklar icin su guvenini merkeze alan yuzme akisi sunuyoruz.",
    targetLocation: "Silivri",
    targetBranch: "4-6 yas yuzme",
    targetAgeGroup: "4-6 yas",
    testimonialQuote:
      "Bu yas grubunda guvenli ve sakin ilerlemek istiyorduk. Surecin bu kadar net anlatilmasi icimizi rahatlatti.",
    testimonialAuthor: "Burcu N.",
    testimonialRole: "4-6 yas velisi",
    internalLinks: [
      { label: "Silivri Cocuk Yuzme Kursu", href: "/silivri-cocuk-yuzme-kursu" },
      { label: "7-10 Yas Yuzme", href: "/silivri-7-10-yas-yuzme-kursu" },
      { label: "Kayit ve Ilk Ders Sureci", href: "/kayit-ve-ilk-ders-sureci" },
    ],
    published: true,
  },
  {
    slug: "silivri-7-10-yas-yuzme-kursu",
    pageType: "service",
    title: "Silivri 7-10 Yas Yuzme Kursu",
    seoTitle: "Silivri 7-10 Yas Yuzme Kursu | Elit Sanat ve Spor Kulubu",
    metaDescription:
      "Silivri'de 7-10 yas yuzme kursu icin teknik gelisim, duzenli devam ve seviye temelli grup planlamasi.",
    canonicalPath: "/silivri-7-10-yas-yuzme-kursu",
    heroEyebrow: "7-10 yas yuzme",
    heroTitle: "Silivri'de 7-10 yas yuzme kursu icin teknik ve disiplin ayni ritimde ilerler.",
    heroDescription:
      "Bu yas grubunda teknik temel, devam duzeni ve ozguvenli su deneyimi birlikte gelisir.",
    introTitle: "7-10 yas grubunda odak",
    introBody:
      "Bu donemde cocuklar daha net teknik yonlendirme alabilir; bu nedenle grup ritmi ve progresyon plani kritik hale gelir.",
    sectionOneTitle: "Seviye temelli ilerleme",
    sectionOneBody:
      "Baslangic ve gelismekte olan yuzuculer ayni tempoda degil, uygun seviyede gruplarla ilerler.",
    sectionTwoTitle: "Devam ve gorunurluk",
    sectionTwoBody:
      "Aileler ders duzenini ve odeme akislarini panelden takip ederek sureci daha rahat yonetir.",
    sectionThreeTitle: "Silivri lokasyon avantaji",
    sectionThreeBody:
      "Duzenli devam acisindan kolay ulasim ve net seans saatleri karar surecini destekler.",
    bulletItems: [
      "Teknik temel ve seviye ilerlemesi",
      "Yas grubuna uygun grup ritmi",
      "Veli paneli ile takip",
      "Silivri merkezli duzenli yuzme egitimi",
    ],
    faqTitle: "7-10 yas yuzme FAQ",
    faqDescription: "Bu yas grubu icin en cok sorulan sorular.",
    faqItems: [
      {
        question: "Bu yas grubunda teknik ilerleme beklenir mi?",
        answer:
          "Evet. Uygun seviyedeki cocuklar icin teknik detaylar daha belirgin sekilde calisilabilir.",
      },
      {
        question: "Devam duzeni veli tarafinda gorunur mu?",
        answer:
          "Takvim ve odeme akisiyla birlikte veli paneli uzerinden izlenebilir.",
      },
      {
        question: "Seans saatleri sabit mi?",
        answer:
          "Program ve gruba gore saatler net planlanir; kayit aninda aileyle paylasilir.",
      },
    ],
    ctaTitle: "7-10 yas icin uygun yuzme grubu ve saat bilgisini alin.",
    ctaDescription:
      "Ekip size uygun grup planini ve ilk ders surecini netlestirsin.",
    ctaPrimaryLabel: "Bilgi al",
    ctaPrimaryHref: "/#contact",
    ctaSecondaryLabel: "Telefon ile gorus",
    ctaSecondaryHref: "/#contact",
    locationTitle: "Silivri 7-10 yas yuzme",
    locationBody:
      "Silivri'de teknik gelisim ve duzenli devam mantigini ayni programda topluyoruz.",
    targetLocation: "Silivri",
    targetBranch: "7-10 yas yuzme",
    targetAgeGroup: "7-10 yas",
    testimonialQuote:
      "Cocugumuzun seviyesine uygun grup planlanmasi ve devam ritminin net olmasi bizim icin cok onemliydi.",
    testimonialAuthor: "Cemre U.",
    testimonialRole: "7-10 yas velisi",
    internalLinks: [
      { label: "Silivri Yuzme Kursu", href: "/silivri-yuzme-kursu" },
      { label: "Silivri Cocuk Yuzme Kursu", href: "/silivri-cocuk-yuzme-kursu" },
      { label: "Veli Takip Sistemi", href: "/veli-takip-sistemi" },
    ],
    published: true,
  },
  {
    slug: "veli-takip-sistemi",
    pageType: "brand",
    title: "Veli Takip Sistemi",
    seoTitle: "Veli Takip Sistemi | Elit Sanat ve Spor Kulubu",
    metaDescription:
      "Veli takip sistemi ile takvim, odeme, duyuru ve gelisim akisini tek panelde izleyin.",
    canonicalPath: "/veli-takip-sistemi",
    heroEyebrow: "Veli gorunurlugu",
    heroTitle: "Veli takip sistemi ile ders, odeme ve duyurular tek yerde gorunur.",
    heroDescription:
      "Karar verirken ailelerin en cok sordugu konulardan biri de kayit sonrasi gorunurluktur. Biz bunu sistematik hale getiriyoruz.",
    introTitle: "Neden veli paneli onemli",
    introBody:
      "Spor deneyimi yalnizca tesiste yasanmaz. Veli tarafinda da net ve takip edilebilir oldugunda devam duzeni guclenir.",
    sectionOneTitle: "Takvim ve ders gorunurlugu",
    sectionOneBody:
      "Aileler yaklasan dersleri ve seans ritmini panelden gorebilir.",
    sectionTwoTitle: "Odeme ve tahakkuk takibi",
    sectionTwoBody:
      "Tahakkuklar, kismi odemeler ve kalan bakiye daha okunur hale gelir.",
    sectionThreeTitle: "Duyuru ve gelisim sinyalleri",
    sectionThreeBody:
      "Kurum duyurulari ve ilgili operasyon notlari panel uzerinden acik sekilde iletilir.",
    bulletItems: [
      "Takvim gorunurlugu",
      "Tahakkuk ve odeme takibi",
      "Duyuru ve mesaj merkezi",
      "Kayit sonrasi daha net aile deneyimi",
    ],
    faqTitle: "Veli takip sistemi FAQ",
    faqDescription: "Panel deneyimi ile ilgili temel sorular.",
    faqItems: [
      {
        question: "Veli panelinde hangi bilgiler bulunur?",
        answer:
          "Takvim, odeme, duyuru ve ilgili operasyon gorunurlugu tek panelde toplanir.",
      },
      {
        question: "Ilk giris bilgileri nasil iletilir?",
        answer:
          "Kayit veya aktivasyon sonrasi panel giris linki ve gecici sifre WhatsApp uzerinden paylasilabilir.",
      },
      {
        question: "Panel yalnizca mevcut velilere mi acik?",
        answer:
          "Evet. Veli hesabi ogrenci kaydina bagli olarak olusturulur.",
      },
    ],
    ctaTitle: "Kayit sonrasi veli paneli deneyimini size adim adim anlatalim.",
    ctaDescription:
      "Program secimiyle birlikte veli panelinin nasil calistigini da anlatan bir geri donus alabilirsiniz.",
    ctaPrimaryLabel: "Bilgi al",
    ctaPrimaryHref: "/#contact",
    ctaSecondaryLabel: "Hemen kayit ol",
    ctaSecondaryHref: "/#contact",
    locationTitle: "Silivri veli deneyimi",
    locationBody:
      "Silivri'deki aileler icin yalnizca saha degil, saha sonrasi gorunurluk de kuruyoruz.",
    targetLocation: "Silivri",
    targetBranch: "Veli takip sistemi",
    targetAgeGroup: "Tum veliler",
    testimonialQuote:
      "Takvim, odeme ve duyurularin gorunur olmasi bizim icin bu kurumu ayristiran en onemli noktalardan biri oldu.",
    testimonialAuthor: "Esra M.",
    testimonialRole: "Veli paneli kullanicisi",
    internalLinks: [
      { label: "Silivri Spor Okulu", href: "/silivri-spor-okulu" },
      { label: "Kayit ve Ilk Ders Sureci", href: "/kayit-ve-ilk-ders-sureci" },
      { label: "Iletisim", href: "/iletisim" },
    ],
    published: true,
  },
  {
    slug: "kayit-ve-ilk-ders-sureci",
    pageType: "brand",
    title: "Kayit ve Ilk Ders Sureci",
    seoTitle: "Kayit ve Ilk Ders Sureci | Elit Sanat ve Spor Kulubu",
    metaDescription:
      "Kayit, grup secimi, ilk ders bilgisi ve veli paneli erisimi nasil ilerler? Tum sureci burada anlatiyoruz.",
    canonicalPath: "/kayit-ve-ilk-ders-sureci",
    heroEyebrow: "Kayit sureci",
    heroTitle: "Ilk bilgi almadan ilk derse kadar tum kayit surecini acik sekilde yonetiyoruz.",
    heroDescription:
      "Ailelerin en cok zorlandigi kisim belirsizliktir. Biz kayit, grup secimi, ilk ders ve panel erisimini tek akista netlestiriyoruz.",
    introTitle: "Kayit sureci neden acik olmali",
    introBody:
      "Karar verme asamasinda saat, grup, odeme ve ilk ders bilgileri netlestiginde aileler kendini daha guvende hisseder.",
    sectionOneTitle: "Bilgi alma ve yonlendirme",
    sectionOneBody:
      "Form, telefon veya WhatsApp ile ulasilir; uygun yas grubu ve branş bilgisi ekip tarafindan netlestirilir.",
    sectionTwoTitle: "Kayit ve grup eslestirmesi",
    sectionTwoBody:
      "Ogrenci, programa degil ilgili grup/seans serisine baglanir; ilk haklari bu plan uzerinden atanir.",
    sectionThreeTitle: "Ilk ders ve panel erisimi",
    sectionThreeBody:
      "Ilk ders gunu/saat bilgisi ve veli paneli giris akisi kayit tamamlandiginda aileye iletilir.",
    bulletItems: [
      "Bilgi alma ve uygun grup secimi",
      "Program ust, grup alt kayit modeli",
      "Ilk ders gunu ve saat bilgisi",
      "Veli paneli giris akisi",
    ],
    faqTitle: "Kayit ve ilk ders FAQ",
    faqDescription: "Kayit oncesi ve sonrasi surece dair sorular.",
    faqItems: [
      {
        question: "Kayit olduktan sonra ilk ders bilgisi nasil verilir?",
        answer:
          "Ilk atanmis seans bulunduğunda gun ve saat bilgisi WhatsApp veya kurum iletisimi ile veliye iletilir.",
      },
      {
        question: "Veli paneli erisimi ne zaman acilir?",
        answer:
          "Kayit veya on kayit aktivasyonu sonrasi ilgili veli hesabina giris linki ve gecici sifre uretilebilir.",
      },
      {
        question: "Odeme bilgisi ne zaman olusur?",
        answer:
          "Enrollment baslangicina gore aylik tahakkuk olusur ve odeme durumu panelde izlenebilir.",
      },
    ],
    ctaTitle: "Kayit surecini sizin aile yapiniza gore birlikte netlestirelim.",
    ctaDescription:
      "Saat, grup ve ilk ders detaylarini ogrenmek icin ekipten hizli geri donus alin.",
    ctaPrimaryLabel: "Bilgi al",
    ctaPrimaryHref: "/#contact",
    ctaSecondaryLabel: "WhatsApp ile sor",
    ctaSecondaryHref: "/#contact",
    locationTitle: "Silivri kayit akisi",
    locationBody:
      "Silivri'deki aileler icin ilk temastan ilk derse kadar sureci olabildigince sade kuruyoruz.",
    targetLocation: "Silivri",
    targetBranch: "Kayit ve ilk ders sureci",
    targetAgeGroup: "Tum yeni kayitlar",
    testimonialQuote:
      "Saat, grup, ilk ders ve panel erisimi ayni anda aciklandigi icin hic karisiklik yasamadik.",
    testimonialAuthor: "Arda G.",
    testimonialRole: "Yeni kayit velisi",
    internalLinks: [
      { label: "Veli Takip Sistemi", href: "/veli-takip-sistemi" },
      { label: "Silivri Spor Okulu", href: "/silivri-spor-okulu" },
      { label: "Iletisim", href: "/iletisim" },
    ],
    published: true,
  },
  {
    slug: "elit-sanat-ve-spor-kulubu",
    pageType: "brand",
    title: "Elit Sanat ve Spor Kulubu",
    seoTitle: "Elit Sanat ve Spor Kulubu | Silivri'de premium spor egitimi",
    metaDescription:
      "Elit Sanat ve Spor Kulubu; Silivri'de yuzme, cimnastik ve tenis odakli premium cocuk spor sistemidir.",
    canonicalPath: "/elit-sanat-ve-spor-kulubu",
    heroEyebrow: "Marka ve guven sinyali",
    heroTitle: "Elit Sanat ve Spor Kulubu, Silivri'de premium spor egitiminin operasyonlu hali.",
    heroDescription:
      "Marka guveni, veli gorunurlugu, planli seans takibi ve cocuk gelisim odakli spor anlayisini ayni sistemde bulusturuyoruz.",
    introTitle: "Neden Elit Sanat ve Spor Kulubu",
    introBody:
      "Bizim farkimiz yalnizca ders acmak degil; kayit, takvim, veli iletisim, yoklama ve gelisim takibini ayni operasyon omurgasinda yonetmek.",
    sectionOneTitle: "Kurumsal duzen",
    sectionOneBody:
      "Aileler sadece spor dersi degil, duzenli bir kurum deneyimi alir. Bu da guvenin kalici hale gelmesini saglar.",
    sectionTwoTitle: "Brans bazli uzmanlik",
    sectionTwoBody:
      "Yuzme, cimnastik ve tenis programlari ayni marka altinda ama kendi metodolojileriyle ilerler.",
    sectionThreeTitle: "Silivri icin lokal avantaj",
    sectionThreeBody:
      "Ayni lokasyonda duzenli ve ulasilabilir spor deneyimi; ailelerin karar verme surecini kolaylastirir.",
    bulletItems: [
      "Silivri merkezli premium spor kulubu deneyimi",
      "Planli kayit ve veli bilgilendirme akisi",
      "Yuzme, cimnastik ve tenis programlari",
      "Guven, gorunurluk ve operasyon disiplini",
    ],
    faqTitle: "Kurum hakkinda sik sorulanlar",
    faqDescription: "Marka, branslar ve iletisim yapisi ile ilgili temel basliklar.",
    faqItems: [
      {
        question: "Elit Sanat ve Spor Kulubu hangi branslarda hizmet verir?",
        answer:
          "Yuzme, cimnastik ve tenis odakli cocuk spor programlari sunar.",
      },
      {
        question: "Kulupte veli takibi var mi?",
        answer:
          "Evet. Takvim, odeme ve gelisim sinyalleri sistemli sekilde veliye aciktir.",
      },
      {
        question: "Silivri icinde bilgi alma sureci nasil ilerler?",
        answer:
          "Anasayfadaki bilgi alma formu veya telefon/WhatsApp hattindan bize ulasabilir, ekipten hizli geri donus alabilirsiniz.",
      },
    ],
    ctaTitle: "Elit Sanat ve Spor Kulubu ile tanismak icin ilk adimi bugun atin.",
    ctaDescription:
      "Markayi yakindan tanimak, programlari ogrenmek ve size uygun kayit akisini duymak icin bize ulasin.",
    ctaPrimaryLabel: "Programlari incele",
    ctaPrimaryHref: "/silivri-spor-okulu",
    ctaSecondaryLabel: "Bilgi alma formu",
    ctaSecondaryHref: "/#contact",
    locationTitle: "Silivri lokasyonu ve iletisim",
    locationBody:
      "Silivri'de ailelerin kolay ulasabilecegi bir spor operasyon merkezi olarak hizmet veriyoruz.",
    targetLocation: "Silivri",
    targetBranch: "Yuzme, cimnastik ve tenis",
    targetAgeGroup: "4-14 yas",
    testimonialQuote:
      "Kurumu tercih ederken yalnizca branlara degil, tum surecin ne kadar duzenli yonetildigine baktik.",
    testimonialAuthor: "Merve S.",
    testimonialRole: "Elit Sanat ve Spor Kulubu velisi",
    internalLinks: [
      { label: "Silivri Spor Okulu", href: "/silivri-spor-okulu" },
      { label: "Kayit ve Ilk Ders Sureci", href: "/kayit-ve-ilk-ders-sureci" },
      { label: "Veli Takip Sistemi", href: "/veli-takip-sistemi" },
    ],
    published: true,
  },
  {
    slug: "iletisim",
    pageType: "contact",
    title: "Iletisim",
    seoTitle: "Iletisim | Elit Sanat ve Spor Kulubu Silivri",
    metaDescription:
      "Elit Sanat ve Spor Kulubu ile iletisime gecin. Silivri lokasyonu, telefon, WhatsApp ve bilgi alma akisi burada.",
    canonicalPath: "/iletisim",
    heroEyebrow: "Iletisim ve lokasyon",
    heroTitle: "Silivri'de bize ulasin, uygun programi birlikte netlestirelim.",
    heroDescription:
      "Telefon, WhatsApp ve bilgi alma formu uzerinden ekibimize ulasabilir; yuzme, cimnastik, jimnastik ve tenis programlari icin yonlendirme alabilirsiniz.",
    introTitle: "Iletisim sureci nasil ilerler",
    introBody:
      "Aileler once bilgi alma formu doldurabilir ya da dogrudan iletisim hattimiza ulasabilir. Sonrasinda uygun yas grubu, saat ve program bilgisi paylasilir.",
    sectionOneTitle: "Telefon ve WhatsApp",
    sectionOneBody:
      "Hizli geri donus almak isteyen aileler icin telefon ve WhatsApp hatti ayni karar surecinin parcasidir.",
    sectionTwoTitle: "Silivri adres bilgisi",
    sectionTwoBody:
      "Google Business Profile, site ve iletisim sayfasindaki tum adres/telefon sinyalleri ayni cizgide tutulur. Bu hem kullanici hem Google guveni icin kritiktir.",
    sectionThreeTitle: "Kayit once bilgi alma",
    sectionThreeBody:
      "Hemen kayit olmak zorunda degilsiniz. Once bilgi alip sonra size uygun akisa gecis yapabilirsiniz.",
    bulletItems: [
      "Telefon ile hizli geri donus",
      "WhatsApp ile kolay iletisim",
      "Silivri lokasyonu icin net ulasim bilgisi",
      "Yuzme, cimnastik ve tenis icin yonlendirme",
    ],
    faqTitle: "Iletisim FAQ",
    faqDescription: "Ailelerin iletisim surecinde en cok sordugu sorular.",
    faqItems: [
      {
        question: "Telefon yerine form doldurabilir miyim?",
        answer:
          "Evet. Anasayfadaki bilgi alma formu admin paneline dusen bir landing basvurusu olusturur.",
      },
      {
        question: "WhatsApp uzerinden bilgi alabilir miyim?",
        answer:
          "Evet. WhatsApp hatti daha hizli geri donus almak isteyen aileler icin aciktir.",
      },
      {
        question: "Adres ve telefon ayni mi kalmali?",
        answer:
          "Evet. Site, Google Business Profile ve tum yerel profillerde ayni NAP bilgisi kullanilmalidir.",
      },
    ],
    ctaTitle: "Hemen bilgi alin ya da ekibin sizi aramasini saglayin.",
    ctaDescription:
      "Iletisim kanallarimizdan size en uygun olanini secin; ekip en kisa surede geri donsun.",
    ctaPrimaryLabel: "Bilgi alma formu",
    ctaPrimaryHref: "/#contact",
    ctaSecondaryLabel: "Anasayfaya don",
    ctaSecondaryHref: "/",
    locationTitle: "Silivri merkezli iletisim",
    locationBody:
      "Elit Sanat ve Spor Kulubu ile ilgili tum lokasyon ve iletisim bilgileri burada tek kaynak olarak tutulur.",
    published: true,
  },
  {
    slug: "cocuga-hangi-sporla-baslanmali",
    pageType: "brand",
    title: "Cocuga Hangi Sporla Baslanmali",
    seoTitle: "Cocuga Hangi Sporla Baslanmali? | Elit Sanat ve Spor Kulubu",
    metaDescription:
      "Cocugunuz icin yuzme, cimnastik veya tenis arasinda nasil karar vereceginizi Silivri odakli net bir yaklasimla anlatiyoruz.",
    canonicalPath: "/cocuga-hangi-sporla-baslanmali",
    heroEyebrow: "Karar rehberi",
    heroTitle: "Cocuga hangi sporla baslanmali sorusuna dogru cevap, cocugun yapisina gore verilir.",
    heroDescription:
      "Her cocuga ayni brans uygun olmaz. Biz yas, enerji, koordinasyon ihtiyaci ve devam duzenine gore dogru baslangici kuruyoruz.",
    introTitle: "Spor secimi rastgele yapilmamali",
    introBody:
      "Aileler genellikle yuzme, cimnastik ve tenis arasinda kararsiz kaliyor. Dogru karar, cocugun yasina ve sporla kurdugu iliskiye gore verilmelidir.",
    sectionOneTitle: "Yuzme ne zaman guclu bir secenektir",
    sectionOneBody:
      "Su guveni, kondisyon, nefes ritmi ve genel vucut koordinasyonunu birlikte desteklemek isteyen aileler icin yuzme guclu bir baslangic olabilir.",
    sectionTwoTitle: "Cimnastik ne zaman one cikar",
    sectionTwoBody:
      "Esneklik, denge, postur ve temel beden hakimiyeti tarafinda daha kuvvetli bir altyapi isteniyorsa cimnastik cok dogru bir baslangic olur.",
    sectionThreeTitle: "Tenis ne zaman anlamli hale gelir",
    sectionThreeBody:
      "Dikkat, reaksiyon, saha disiplini ve raket sporlarina yatkinlik tarafinda tenis belirgin avantaj saglar.",
    bulletItems: [
      "Yasa ve hazirbulunusluga gore dogru brans secimi",
      "Yuzme, cimnastik ve tenis icin farkli baslangic profilleri",
      "Veliye acik yonlendirme sureci",
      "Silivri'de karar vermeyi kolaylastiran lokal operasyon",
    ],
    faqTitle: "Spor secimi FAQ",
    faqDescription: "Ailelerin en cok sordugu karar verme sorulari.",
    faqItems: [
      {
        question: "Her cocuk once yuzmeye mi baslamali?",
        answer:
          "Hayir. Yuzme cok guclu bir temel olabilir ama her cocuk icin ilk dogru brans ayni degildir.",
      },
      {
        question: "Cimnastik ve tenis secimi neye gore degisir?",
        answer:
          "Koordinasyon ihtiyaci, dikkat yapisi, enerji duzeyi ve devam motivasyonu birlikte degerlendirilir.",
      },
      {
        question: "Bizi kim yonlendiriyor?",
        answer:
          "Bilgi alma sonrasi ekip yas grubu ve ihtiyaca gore uygun bransi onerir.",
      },
    ],
    ctaTitle: "Cocugunuz icin en dogru spor baslangicini birlikte belirleyelim.",
    ctaDescription:
      "Yas, brans ve hedefe gore size en uygun programi anlatalim.",
    ctaPrimaryLabel: "Program onerisi iste",
    ctaPrimaryHref: "/#contact",
    ctaSecondaryLabel: "WhatsApp ile sor",
    ctaSecondaryHref: "/#contact",
    locationTitle: "Silivri'de dogru yonlendirme",
    locationBody:
      "Silivri'deki aileler icin karar vermeyi kolaylastiran sade ve planli bir yonlendirme akisi sunuyoruz.",
    targetLocation: "Silivri",
    targetBranch: "Yuzme, cimnastik ve tenis secimi",
    targetAgeGroup: "4-14 yas",
    testimonialQuote:
      "Bize direkt kayit satmaya calismadan once hangi bransin daha uygun oldugunu anlatmalari cok guven verdi.",
    testimonialAuthor: "Selin O.",
    testimonialRole: "Karar asamasindaki veli",
    internalLinks: [
      { label: "Silivri Spor Okulu", href: "/silivri-spor-okulu" },
      { label: "Silivri Yuzme Kursu", href: "/silivri-yuzme-kursu" },
      { label: "Silivri Cimnastik Kursu", href: "/silivri-cimnastik-kursu" },
    ],
    published: true,
  },
  {
    slug: "silivride-cocuklar-icin-yuzme-mi-cimnastik-mi",
    pageType: "brand",
    title: "Silivri'de Cocuklar Icin Yuzme mi Cimnastik mi",
    seoTitle: "Silivri'de Cocuklar Icin Yuzme mi Cimnastik mi? | Elit Sanat ve Spor Kulubu",
    metaDescription:
      "Silivri'de cocuklar icin yuzme mi cimnastik mi sorusunu yas, hedef ve gelisim ihtiyacina gore anlatiyoruz.",
    canonicalPath: "/silivride-cocuklar-icin-yuzme-mi-cimnastik-mi",
    heroEyebrow: "Brans karsilastirma",
    heroTitle: "Silivri'de cocuklar icin yuzme mi cimnastik mi sorusu, dogru baglamla cevaplanmali.",
    heroDescription:
      "Iki brans da cok guclu ama ayni ihtiyaca cevap vermez. Aileler icin farki sade sekilde anlatiyoruz.",
    introTitle: "Iki bransin guclu yonleri farklidir",
    introBody:
      "Yuzme daha fazla su guveni, kondisyon ve tum vucut koordinasyonu saglarken; cimnastik denge, esneklik ve temel beden kontrolunu onde tasir.",
    sectionOneTitle: "Yuzmenin one ciktigi durumlar",
    sectionOneBody:
      "Kondisyon, suyla barisiklik ve ritimli teknik gelisim isteniyorsa yuzme guclu bir tercih olur.",
    sectionTwoTitle: "Cimnastigin one ciktigi durumlar",
    sectionTwoBody:
      "Temel hareket kalitesi, esneklik ve beden farkindaligi acisindan cimnastik erken yaslarda cok degerli olabilir.",
    sectionThreeTitle: "Karar verirken tek kriter brans olmamali",
    sectionThreeBody:
      "Saat, ulasim, devam duzeni ve cocugun psikolojik rahatligi da secimi etkiler. Silivri icinde bu sureci daha okunur hale getiriyoruz.",
    bulletItems: [
      "Yuzme ve cimnastigin farkli gelisim avantajlari",
      "Yasa ve hedefe gore karar verme mantigi",
      "Devam duzeni ve veli gorunurlugu",
      "Silivri icin ulasilabilir program yapisi",
    ],
    faqTitle: "Yuzme mi cimnastik mi FAQ",
    faqDescription: "Ailelerin karsilastirma yaparken sordugu sorular.",
    faqItems: [
      {
        question: "Iki branstan hangisi daha iyi?",
        answer:
          "Tek bir dogru yoktur. Cocugun ihtiyacina gore yuzme de cimnastik de en iyi secim olabilir.",
      },
      {
        question: "Erken yasta hangisi daha avantajlidir?",
        answer:
          "Cimnastik erken yaslarda beden hakimiyeti acisindan, yuzme ise su guveni ve genel koordinasyon acisindan guclu olabilir.",
      },
      {
        question: "Karari nasil netlestirebiliriz?",
        answer:
          "Ekip, yas ve hedef bilgisine gore size net yonlendirme yapabilir.",
      },
    ],
    ctaTitle: "Yuzme mi cimnastik mi sorusunu birlikte netlestirelim.",
    ctaDescription:
      "Kisa bir bilgi alma sureciyle size en uygun bransi onerelim.",
    ctaPrimaryLabel: "Bilgi al",
    ctaPrimaryHref: "/#contact",
    ctaSecondaryLabel: "Telefon ile gorus",
    ctaSecondaryHref: "/#contact",
    locationTitle: "Silivri'de brans secimi",
    locationBody:
      "Silivri'deki aileler icin karari sade, hizli ve veri temelli hale getiren bir spor okulu mantigi kuruyoruz.",
    targetLocation: "Silivri",
    targetBranch: "Yuzme ve cimnastik karsilastirmasi",
    targetAgeGroup: "4-12 yas",
    testimonialQuote:
      "Bize iki bransi de artisi ve eksisiyle anlatmalari karar vermemizi cok kolaylastirdi.",
    testimonialAuthor: "Bahar E.",
    testimonialRole: "Brans arastiran veli",
    internalLinks: [
      { label: "Silivri Yuzme Kursu", href: "/silivri-yuzme-kursu" },
      { label: "Silivri Cimnastik Kursu", href: "/silivri-cimnastik-kursu" },
      { label: "Cocuga Hangi Sporla Baslanmali", href: "/cocuga-hangi-sporla-baslanmali" },
    ],
    published: true,
  },
  {
    slug: "tesis-ve-guvenlik-yaklasimi",
    pageType: "brand",
    title: "Tesis ve Guvenlik Yaklasimi",
    seoTitle: "Tesis ve Guvenlik Yaklasimi | Elit Sanat ve Spor Kulubu",
    metaDescription:
      "Tesis duzeni, ilk ders guveni, veli bilgilendirmesi ve operasyon yaklasimimizi acikca gorun.",
    canonicalPath: "/tesis-ve-guvenlik-yaklasimi",
    heroEyebrow: "Guven sayfasi",
    heroTitle: "Tesis ve guvenlik yaklasimi, ailelerin karar verirken en cok baktigi alanlardan biridir.",
    heroDescription:
      "Program kadar operasyonun nasil yonetildigi de onemlidir. Ilk dersten itibaren daha kontrollu ve okunur bir deneyim kuruyoruz.",
    introTitle: "Guven neden yalnizca fiziksel alan degildir",
    introBody:
      "Aileler icin guven; ulasilabilir ekip, net ders akisi, bilgilendirme duzeni ve tesisin anlasilir yapisiyla birlikte olusur.",
    sectionOneTitle: "Ilk ders ve karsilama duzeni",
    sectionOneBody:
      "Yeni kayitlarda ilk ders bilgisi ve grup akisi bastan netlestirilir. Boylesi ailelerin adaptasyonunu kolaylastirir.",
    sectionTwoTitle: "Tesis icinde duzen ve takip",
    sectionTwoBody:
      "Program, grup ve seans bilgileri daginik degil; tek bir operasyon mantigi icinde yonetilir.",
    sectionThreeTitle: "Veliye acik bilgilendirme",
    sectionThreeBody:
      "Duyuru, odeme, takvim ve iletisim akislari gorunur tutuldugunda guven duygusu kalici hale gelir.",
    bulletItems: [
      "Ilk ders bilgisi ve seans netligi",
      "Program ve grup bazli duzenli operasyon",
      "Veliye acik bilgilendirme mantigi",
      "Silivri icinde okunur ve guvenli kurum deneyimi",
    ],
    faqTitle: "Tesis ve guvenlik FAQ",
    faqDescription: "Ailelerin guvenlik ve operasyon tarafinda merak ettigi basliklar.",
    faqItems: [
      {
        question: "Kayit olduktan sonra ilk ders bilgisi net veriliyor mu?",
        answer:
          "Evet. Grup, saat ve ilk ders akisi kayit surecinde acik sekilde paylasilir.",
      },
      {
        question: "Veliler sureci nasil takip ediyor?",
        answer:
          "Veli paneli ve dogrudan iletisim akislariyla takvim, odeme ve duyurular gorulebilir.",
      },
      {
        question: "Tesis bilgisi karar oncesi ogrenilebilir mi?",
        answer:
          "Evet. Bilgi alma surecinde ekip lokasyon ve isleyis hakkinda net bilgilendirme yapar.",
      },
    ],
    ctaTitle: "Tesis, surec ve ilk ders isleyisini birlikte anlatalim.",
    ctaDescription:
      "Kurum deneyimini daha yakindan gormek icin bize ulasin.",
    ctaPrimaryLabel: "Bilgi al",
    ctaPrimaryHref: "/#contact",
    ctaSecondaryLabel: "WhatsApp ile sor",
    ctaSecondaryHref: "/#contact",
    locationTitle: "Silivri'de guvenli kurum yapisi",
    locationBody:
      "Silivri'de ailelerin kararini kolaylastiran sey yalnizca brans degil, duzenli ve okunur kurum deneyimidir.",
    targetLocation: "Silivri",
    targetBranch: "Tesis ve guvenlik",
    targetAgeGroup: "Tum yeni aileler",
    testimonialQuote:
      "Bize sadece ders saatini degil, surecin nasil isledigini de anlatmalari kuruma duydugumuz guveni artirdi.",
    testimonialAuthor: "Yasemin H.",
    testimonialRole: "Yeni veli",
    internalLinks: [
      { label: "Kayit ve Ilk Ders Sureci", href: "/kayit-ve-ilk-ders-sureci" },
      { label: "Veli Takip Sistemi", href: "/veli-takip-sistemi" },
      { label: "Iletisim", href: "/iletisim" },
    ],
    published: true,
  },
];

export const publicSeoPageLinks = defaultSeoPages
  .filter((page) => page.published)
  .map((page) => ({
    href: page.canonicalPath,
    label: page.title,
  }));

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

export function mergeSeoPageContent(
  base: SeoPageContent,
  override?: Partial<SeoPageContent> | null,
): SeoPageContent {
  if (!override) {
    return {
      ...base,
      status: base.published ? "published" : "draft",
      indexable: typeof base.indexable === "boolean" ? base.indexable : true,
      includeInSitemap:
        typeof base.includeInSitemap === "boolean" ? base.includeInSitemap : base.published,
    };
  }

  const merged = mergeUnknown(base, override) as SeoPageContent;

  return {
    ...merged,
    status:
      merged.status ??
      (merged.published ? "published" : "draft"),
    indexable: typeof merged.indexable === "boolean" ? merged.indexable : true,
    includeInSitemap:
      typeof merged.includeInSitemap === "boolean" ? merged.includeInSitemap : merged.published,
  };
}

export function getDefaultSeoPageBySlug(slug: string) {
  return defaultSeoPages.find((page) => page.slug === slug) ?? null;
}

export function getSeoPageStorageSlug(slug: string) {
  return `${seoPageStoragePrefix}${slug}`;
}

export function getSlugFromStorageSlug(storageSlug: string) {
  return storageSlug.replace(seoPageStoragePrefix, "");
}
