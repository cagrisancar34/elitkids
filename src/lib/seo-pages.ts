export type SeoPageType = "service" | "brand" | "contact";

export type SeoFaqItem = {
  question: string;
  answer: string;
};

export type SeoPageContent = {
  slug: string;
  pageType: SeoPageType;
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
  published: boolean;
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
    return base;
  }

  return mergeUnknown(base, override) as SeoPageContent;
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
