import { navigationByRole } from "@/lib/navigation";
import type { PageDocumentation, PageDocumentationItem, RoleNavItem } from "@/lib/types";

function compactLabel(label: string) {
  return label.includes(" / ") ? label.split(" / ").at(-1) ?? label : label;
}

function buildGenericActions(item: RoleNavItem): PageDocumentationItem[] {
  const href = item.href.toLocaleLowerCase("tr-TR");

  if (href.includes("landing")) {
    return [
      { title: "Icerik guncelleme", body: "Anasayfa bolumlerini, CTA alanlarini ve public gorunen metinleri buradan degistirebilirsiniz." },
      { title: "Yayin kontrolu", body: "Vitrinde gorunecek icerikleri tek kaynaktan duzenleyip kaydedebilirsiniz." },
    ];
  }

  if (href.includes("seo")) {
    return [
      { title: "SEO sayfasi duzenleme", body: "Lokal landing sayfalarinin baslik, metadata ve icerik bloklarini buradan guncelleyebilirsiniz." },
      { title: "Yayin durumu takibi", body: "Hangi SEO sayfasinin yayinda oldugunu ve hangi slug ile acildigini buradan kontrol edebilirsiniz." },
    ];
  }

  if (href.includes("security")) {
    return [
      { title: "Audit takibi", body: "Kritik sistem aksiyonlarini ve landing basvurularini ayni denetim yuzeyinde izleyebilirsiniz." },
      { title: "Bildirim ve lead inceleme", body: "Yeni landing basvurularini, sistem sinyallerini ve ilgili kayitlara gecisi buradan yonetebilirsiniz." },
    ];
  }

  if (href.includes("users")) {
    return [
      { title: "Kullanici davet etme", body: "Yeni kullanici davetlerini ve rol dagilimini buradan yonetebilirsiniz." },
      { title: "Rol duzenleme", body: "Mevcut kullanicilarin rol ve erisim kapsamini bu sayfadan guncelleyebilirsiniz." },
    ];
  }

  if (href.includes("settings")) {
    return [
      { title: "Sistem tercihi guncelleme", body: "Kurum, entegrasyon ve guvenlik tercihlerinin ana kaynagi bu sayfadir." },
      { title: "Calisma ortamlarini kontrol etme", body: "Aktif ayarlarin ve genel sistem davranisinin hangi degerlerle calistigini buradan okuyabilirsiniz." },
    ];
  }

  if (href.includes("pre-registration-settings")) {
    return [
      { title: "On kayit metinlerini guncelleme", body: "KVKK, izin metni ve basvuru akisinda gorunen sabit icerikleri bu sayfadan yonetirsiniz." },
      { title: "Public akisi ayarlama", body: "Form acik/kapali durumu ve basari mesajlari gibi davranislari buradan belirleyebilirsiniz." },
    ];
  }

  if (href.includes("detail-templates")) {
    return [
      { title: "Soru seti tanimlama", body: "Koc formlarinda ve karne alanlarinda kullanilan soru yapisini bu sayfadan duzenlersiniz." },
      { title: "Alan sira ve zorunluluklari", body: "Soru alanlarinin gorunme sirasini, tipini ve zorunlu olup olmadigini buradan ayarlarsiniz." },
    ];
  }

  if (href.includes("program-resources")) {
    return [
      { title: "Kaynak sozlugu yonetme", body: "Program tipi, kategori, brans ve alan listeleri bu sayfadan guncellenir." },
      { title: "Form besleme", body: "Manager tarafindaki program ve seans formlarinda kullanilan secenekler bu kaynaktan gelir." },
    ];
  }

  return [
    { title: "Sayfa okuma", body: `${compactLabel(item.label)} sayfasindaki kayitlari ve durum sinyallerini buradan izleyebilirsiniz.` },
    { title: "Ilgili aksiyonlara gecis", body: "Bu sayfada listelenen veri ve kartlar uzerinden ilgili isleme veya kayda gecis yapabilirsiniz." },
  ];
}

function buildGenericAreas(item: RoleNavItem): PageDocumentationItem[] {
  const href = item.href.toLocaleLowerCase("tr-TR");

  if (href === "/admin") {
    return [
      { title: "KPI kartlari", body: "Ustteki kisa kartlar kullanici, rol ve bildirim gibi temel sistem sayilarini gosterir." },
      { title: "Hizli erisim paneli", body: "Landing editoru ve canli vitrin gibi en cok kullanilan admin aksiyonlari burada bulunur." },
      { title: "Yetki matrisi", body: "Hangi cekirdek alanin hangi rol tarafindan sahiplenildigini tablo halinde gosterir." },
      { title: "Sistem sinyalleri", body: "Saga alinmis kucuk panelde bekleyen veya dikkat isteyen kayitlar listelenir." },
    ];
  }

  if (href.includes("landing")) {
    return [
      { title: "Sekme cubugu", body: "Marka, hero, CTA, footer ve rehber gibi landing bolumleri buradan secilir." },
      { title: "Editor formlari", body: "Secili bolume ait baslik, metin, baglanti ve gorsel alanlari bu formlarda duzenlenir." },
      { title: "Kaydetme alani", body: "Sag ustteki aksiyonlar ve durum ozetleri landing iceriginin kayit durumunu gosterir." },
    ];
  }

  if (href.includes("seo")) {
    return [
      { title: "Sayfa secici", body: "Yatay butonlar ile duzenlemek istediginiz SEO sayfasini secersiniz." },
      { title: "Metadata alanlari", body: "SEO title, description ve canonical gibi teknik alanlar burada yer alir." },
      { title: "Icerik bloklari", body: "Hero, icerik, FAQ ve CTA bolumleri secili sayfa icin bu alanda duzenlenir." },
    ];
  }

  if (href.includes("security")) {
    return [
      { title: "Audit tablosu", body: "Sistemde kayda gecen kritik olaylar burada zaman sirasiyla listelenir." },
      { title: "Landing basvurulari", body: "Anasayfadan gelen lead kayitlari bu alanda gorulur ve incelenir." },
      { title: "Bildirim paneli", body: "Yeni lead veya sistem olayi oldugunda topbar zili ve sag bloklar uzerinden ozetlenir." },
    ];
  }

  return [
    { title: "Ana liste veya tablo", body: "Sayfanin temel veri cikisi burada listelenir." },
    { title: "KPI ve durum kartlari", body: "Ozet rakamlar ve hizli durum okumasi icin kullanilir." },
  ];
}

function buildWorkflow(item: RoleNavItem): PageDocumentationItem[] {
  const href = item.href.toLocaleLowerCase("tr-TR");

  if (href === "/admin") {
    return [
      { title: "1. Durumu tara", body: "Ust KPI kartlari ve sag sinyal paneli ile sistemin bugunku durumunu hizlica okuyun." },
      { title: "2. Hedef modula gec", body: "Landing, kullanici, guvenlik veya diger admin modullerine buradaki kisa yollarla gidin." },
      { title: "3. Kaydi dogrula", body: "Ilgili tablo veya denetim alaninda yaptiginiz isin dogru yansidigini kontrol edin." },
    ];
  }

  if (href.includes("landing")) {
    return [
      { title: "1. Bolumu sec", body: "Duzenlemek istediginiz landing bolumunu sekme uzerinden acin." },
      { title: "2. Alanlari guncelle", body: "Metin, baglanti veya gorsel alanlarini ihtiyaca gore duzenleyin." },
      { title: "3. Kaydet ve vitrinde kontrol et", body: "Kaydettikten sonra canli anasayfayi acip sonucu dogrulayin." },
    ];
  }

  if (href.includes("seo")) {
    return [
      { title: "1. Sayfayi sec", body: "Once duzenlemek istediginiz lokal SEO sayfasini secin." },
      { title: "2. Metadata ve icerigi guncelle", body: "Baslik, aciklama, FAQ ve CTA bloklarini ihtiyaca gore duzenleyin." },
      { title: "3. Yayin durumunu kontrol et", body: "Kaydettikten sonra public URL ve sitemap etkisini dogrulayin." },
    ];
  }

  return [
    { title: "1. Sayfayi incele", body: "Liste veya ozet kartlar uzerinden mevcut durumu okuyun." },
    { title: "2. Ilgili islemi yap", body: "Bu moduldeki aksiyonlar veya baglantilar ile gerekli kayda gecin." },
    { title: "3. Sonucu dogrula", body: "Guncel kaydin ilgili tabloda veya denetim alaninda yansidigini kontrol edin." },
  ];
}

const adminNavigationItems = navigationByRole.admin;

const overrides: Record<string, Partial<PageDocumentation>> = {
  "/admin": {
    title: "Admin Genel Gorunumu",
    purpose: "Admin panelinin ozet ekranidir. Sistem sagligi, kritik admin modulleri ve bekleyen denetim sinyalleri buradan takip edilir.",
    notes: [
      "Bu sayfa ayrintili is yapmak icin degil, dogru modula hizli gecis yapmak icin kullanilir.",
      "En guncel lead ve audit sinyalleri sag bloklarda kisa ozet olarak gorunur.",
    ],
  },
  "/admin/users": {
    title: "Kullanici ve Roller",
    purpose: "Kullanici davetlerini, rol dagilimini ve erisim kapsamini yonettiginiz ana admin moduldur.",
  },
  "/admin/settings": {
    title: "Sistem Ayarlari",
    purpose: "Kurum, entegrasyon ve guvenlik tercihlerini merkezi olarak kontrol ettiginiz sayfadir.",
  },
  "/admin/landing": {
    title: "Landing Page Editoru",
    purpose: "Public anasayfada gorunen landing icerigini ve CTA alanlarini yonettiginiz editordur.",
    notes: [
      "Landing tarafindaki her degisiklik public vitrini etkiler; kaydetmeden once ilgili bolumu dogru sectiginizden emin olun.",
      "Rehber ve CTA gibi public bolumlerde bos alan birakilan kayitlar gorunumden dusurulur.",
    ],
  },
  "/admin/seo-pages": {
    title: "SEO Sayfalari",
    purpose: "Silivri odakli lokal landing sayfalarinin metadata, icerik ve yayin yapisini yonettiginiz moduldur.",
    notes: [
      "Her sayfa benzersiz title, description ve icerik bloklari ile yonetilir.",
      "Bu moduldaki degisiklikler sitemap ve public SEO ciktilarina dogrudan etki eder.",
    ],
  },
  "/admin/pre-registration-settings": {
    title: "On Kayit Ayarlari",
    purpose: "Public on kayit akisinin hukuki metinlerini, davranisini ve kullaniciya gorunen sabit mesajlarini yonettiginiz sayfadir.",
  },
  "/admin/detail-templates": {
    title: "Detay Sorulari",
    purpose: "Koc ve karne formlarinda kullanilan detay soru setlerini tanimladiginiz moduldur.",
  },
  "/admin/program-resources": {
    title: "Program Kaynaklari",
    purpose: "Programlar ve seanslar icin kullanilan kategori, brans ve alan kaynaklarini yonettiginiz sozluk moduldur.",
  },
  "/admin/security": {
    title: "Guvenlik ve Audit",
    purpose: "Audit loglari, landing basvurulari ve sistem sinyallerini bir arada izlediginiz denetim merkezidir.",
    notes: [
      "Landing basvurulari zil bildirimleri ile bu modula baglidir.",
      "Bu sayfa denetim ve takip amaclidir; kritik degisiklikler ilgili modullerde yapilir.",
    ],
  },
};

function buildDocumentation(item: RoleNavItem): PageDocumentation {
  const base: PageDocumentation = {
    pageKey: item.href,
    title: compactLabel(item.label),
    purpose: item.description,
    actions: buildGenericActions(item),
    areas: buildGenericAreas(item),
    workflow: buildWorkflow(item),
    notes: [],
  };

  return {
    ...base,
    ...overrides[item.href],
    actions: overrides[item.href]?.actions ?? base.actions,
    areas: overrides[item.href]?.areas ?? base.areas,
    workflow: overrides[item.href]?.workflow ?? base.workflow,
    notes: overrides[item.href]?.notes ?? base.notes,
  };
}

export const adminPageDocumentation = adminNavigationItems.map(buildDocumentation);

export function getAdminDocumentation(pageKey: string) {
  return adminPageDocumentation.find((item) => item.pageKey === pageKey) ?? adminPageDocumentation[0];
}
