import { navigationByRole } from "@/lib/navigation";
import type { PageDocumentation, PageDocumentationItem, RoleNavItem } from "@/lib/types";

function compactLabel(label: string) {
  return label.includes(" / ") ? label.split(" / ").at(-1) ?? label : label;
}

function docs(
  purpose: string,
  actions: PageDocumentationItem[],
  areas: PageDocumentationItem[],
  workflow: PageDocumentationItem[],
  notes: string[] = [],
) {
  return { purpose, actions, areas, workflow, notes };
}

const ADMIN_DOCS: Record<string, Omit<PageDocumentation, "pageKey" | "title">> = {
  "/admin": docs(
    "Admin genel gorunumu; sistem sagligini, son donemde eklenen ana operasyon degisikliklerini ve hizli gecis alanlarini tek ekranda toplar.",
    [
      {
        title: "Kritik modullere gecis",
        body: "WhatsApp mesaj merkezi, on kayit form yonetimi, landing icerikleri, SEO sayfalari ve guvenlik denetimi gibi cekirdek admin alanlarina hizli gecis icin kullanilir.",
      },
      {
        title: "Yuksek etkili sinyalleri okuma",
        body: "Yeni odeme kuralina gore geciken tahakkuklar, bekleyen form/landing akisleri ve son sistem degisiklikleri bu ekrandan taranir.",
      },
    ],
    [
      {
        title: "Hero KPI alani",
        body: "Sistem genelindeki canli sayilar, aktif moduller ve bugun dikkat isteyen ana sinyaller bu alanda toplanir.",
      },
      {
        title: "Hizli yonlendirme bloklari",
        body: "Landing, ayarlar, on kayit ayarlari, kaynak sozlugu ve guvenlik gibi modullere tek tikla gecis verir.",
      },
      {
        title: "Sistem notlari",
        body: "Son haftalarda eklenen davranislarin ozetini ve hangi modulu etkiledigini burada gorursunuz.",
      },
    ],
    [
      { title: "1. KPI kartlarini tara", body: "Sistem sagligi ve bekleyen sinyalleri once ozet kartlardan okuyun." },
      { title: "2. Etkilenen modulu ac", body: "Degisiklik yapmak istediginiz alani dogru admin modulu uzerinden acin." },
      { title: "3. Sonucu dokumantasyonla dogrula", body: "Her moduldeki yeni davranis notlarini dokumantasyon merkezinden kontrol edin." },
    ],
    [
      "8 hak allocation modeli ve 7 gunluk odeme durumu gibi yeni is kurallari artik sistem genelinde merkezi yardimci katmanlardan beslenir.",
      "Bu ekran operasyon yapmak icin degil, dogru admin moduline hizli gecis yapmak icin tasarlanmistir.",
    ],
  ),
  "/admin/users": docs(
    "Kullanici, rol ve erisim kapsamlarini yonettiginiz ana admin alanidir.",
    [
      {
        title: "Kullanici daveti ve rol dagitimi",
        body: "Admin, manager, coach ve parent disindaki operasyonel personel veya yonetim rollerini bu sayfadan duzenlersiniz.",
      },
      {
        title: "Yetki gozden gecirme",
        body: "Mesaj merkezine erisim, teknik ayar yetkisi ve operasyonel panel kullanimi gibi alanlar icin rol kapsamini buradan kontrol edersiniz.",
      },
    ],
    [
      { title: "Kullanici listesi", body: "Mevcut profiller, roller ve hesap durumlari listelenir." },
      { title: "Rol duzenleme", body: "Her kullanicinin hangi paneli gorecegi ve hangi aksiyonlari alabilecegi bu alandan degisir." },
    ],
    [
      { title: "1. Kullanici kaydini sec", body: "Guncellemek istediginiz profili listeden bulun." },
      { title: "2. Rol veya kapsam degistir", body: "Gerekirse admin/manager ayrimini veya erisim kapsamini duzenleyin." },
      { title: "3. Panel akislarini test et", body: "Ozellikle mesaj merkezi ve finans gibi kritik alanlarda erisim dogrulamasini tamamlayin." },
    ],
  ),
  "/admin/settings": docs(
    "Kurum ayarlari ile birlikte WhatsApp teknik baglantisini, konu bazli mesaj sablonlarini ve panel bildirimi metinlerini yonettiginiz merkezdir.",
    [
      {
        title: "WhatsApp mesaj merkezi yonetimi",
        body: "Meta baglanti durumu, template eslesmeleri, mesaj konusu bazli sablonlar ve panel bildirimi metinleri bu sayfadan duzenlenir.",
      },
      {
        title: "Sistem tercihlerini kontrol etme",
        body: "Kurum bilgileri, sube ve sezon tanimlari ile entegrasyon davranislari burada merkezi olarak tutulur.",
      },
      {
        title: "Mesaj metni standardizasyonu",
        body: "Kayit basarisi, on kayit aktivasyonu, odeme hatirlatmasi ve hak bitis uyarilarinda kullanilan metinler artik bu merkezden yonetilir.",
      },
      {
        title: "Odeme kurallarini referans alma",
        body: "Odeme hatirlatma ve panel bildirimi sablonlari, artik aylik tahakkuk ve 7 gunluk odeme yasam dongusu mantigina gore yorumlanir.",
      },
    ],
    [
      {
        title: "WhatsApp sekmesi",
        body: "Teknik secret durumu, Meta template mapping, kuyruk ozetleri ve message topic editoru ayni panelde gorunur.",
      },
      {
        title: "Mesaj konu listesi",
        body: "Her konu icin baslik, aciklama, kanal, govde metni ve manager tarafindan duzenlenebilirlik durumu tutulur.",
      },
      {
        title: "Sube ve sezon bloklari",
        body: "Program / grup / seans serisi yapisini besleyen temel organizasyon sozlugu burada kalir.",
      },
    ],
    [
      { title: "1. Teknik durumu kontrol et", body: "Meta baglantisi ve eksik secret uyarisini once bu ekrandan okuyun." },
      { title: "2. Konu sablonunu guncelle", body: "Kayit, odeme veya panel bildirimi metnini ilgili topic uzerinden duzenleyin." },
      { title: "3. Operasyon ekraninda dogrula", body: "Student create, pre-registration activation veya finance ekranlarinda yeni metnin kullanildigini kontrol edin." },
    ],
    [
      "Manager teknik secret veya template mapping degistiremez; ama editable olarak isaretlenen mesaj konularini manager ekranindan guncelleyebilir.",
      "panel_notice_payment_risk anahtari teknik olarak korunur; ancak icerik artik 7 gunu gecen odeme diliyle render edilir.",
      "Kismi odeme senaryolarinda tek tahakkuk altina birden fazla odeme satiri yazilir; sablonlar toplam borc ve kalan tutar degiskenleriyle buna uyumlu calisir.",
    ],
  ),
  "/admin/landing": docs(
    "Bu route artik Public Site CMS merkezine yonlenir. Landing ve galeri icerigi ayri editor yerine tek public sayfa envanteri icinden yonetilir.",
    [
      {
        title: "Yeni merkez",
        body: "Landing route'u geriye donuk uyumluluk icin korunur ancak artik admin/public-site ekranina yonlenir.",
      },
    ],
    [
      { title: "Redirect", body: "Landing editoru ayri ana giris olmaktan cikmistir." },
    ],
    [
      { title: "1. Public Site CMS'i ac", body: "Anasayfa veya galeri kaydini sayfa envanterinden secin." },
    ],
    [
      "Landing ve galeri ayni vitrin dokumaninda tutulmaya devam eder; ancak operasyon ekranı artik birlesik CMS'tir.",
    ],
  ),
  "/admin/public-site": docs(
    "Anasayfa, galeri, SEO sayfalari ve ozel public route'lari tek merkezden yonettiginiz admin-only Public Site CMS ekranidir.",
    [
      {
        title: "Sayfa envanteri",
        body: "Tum public route'lari route, durum, index ve sitemap bilgisiyle ayni listede gorursunuz.",
      },
      {
        title: "Sayfa bazli editor",
        body: "SEO ve custom sayfalar bu ekranda dogrudan duzenlenir; anasayfa ve galeri ise landing dokumani odakli acilir.",
      },
      {
        title: "Yayin kontrolu",
        body: "Publish, draft, archive, duplicate ve delete aksiyonlari ayni merkezden yonetilir.",
      },
    ],
    [
      { title: "Sayfa olusturma", body: "Yeni route, baslik ve template secilerek custom public sayfalar taslak olarak olusturulur." },
      { title: "Checklist", body: "SEO title, meta description, CTA, FAQ ve ic link sagligi sag sutunda izlenir." },
      { title: "Route korumasi", body: "Admin, panel ve sistem route'lari slug seviyesinde rezerve tutulur." },
    ],
    [
      { title: "1. Envanterden sec", body: "Duzenlemek istediginiz sayfayi soldaki listeden secin." },
      { title: "2. Icerigi ve SEO'yu duzenle", body: "Sag panelde secili sayfanin metin, CTA ve metadata alanlarini guncelleyin." },
      { title: "3. Yayin durumunu kontrol et", body: "Publish, sitemap ve noindex davranisini kaydettikten sonra public route'ta test edin." },
    ],
    [
      "Anasayfa ve galeri sistem sayfasidir; duzenlenir ama silinmez.",
      "Varsayilan SEO sayfalari silindiginde tombstone/arsiv mantigi ile public'ten dusurulur; custom sayfalar ise fiziksel olarak silinebilir.",
    ],
  ),
  "/admin/seo-pages": docs(
    "Bu route artik Public Site CMS merkezine yonlenir. Lokal SEO sayfalari ayri editor yerine tek envanterden yonetilir.",
    [
      {
        title: "Yeni merkez",
        body: "SEO Pages route'u geriye donuk uyumluluk icin korunur ancak artik admin/public-site ekranina yonlenir.",
      },
    ],
    [
      { title: "Redirect", body: "SEO editörü ayri ana giris olmaktan cikmistir." },
    ],
    [
      { title: "1. Public Site CMS'i ac", body: "Scope=seo ile acilan envanterden ilgili sayfayi secin." },
    ],
    [
      "SEO ve custom public sayfalar artik ayni editor mantigiyle yonetilir.",
    ],
  ),
  "/admin/landing-legacy": docs(
    "Public vitrin icerigi ile CTA akisini yonettiginiz editor. Hemen Kayit butonu, Silivri odakli marka dili, lokal guven bloklari ve landing copy buradan kontrol edilir.",
    [
      {
        title: "Landing bloklarini guncelleme",
        body: "Hero, lokal proof, kayit sureci, yorumlar, CTA ve destekleyici bolumlerde gorunen metinleri bu moduldan degistirirsiniz.",
      },
      {
        title: "Public CTA uyumunu koruma",
        body: "Hemen Kayit modalina acilan yonlendirme, WhatsApp / telefon aksiyonlari ve program onerisi butonu ile birlikte burada planlanir.",
      },
      {
        title: "Organik ana sayfa lead mantigi",
        body: "Anasayfadaki form artik organic_home kaynagi ile lead toplar; CTA dili ve kaynak kalitesi birlikte dusunulmelidir.",
      },
    ],
    [
      { title: "Bolum secici", body: "Landing alanlarini kategori kategori acmanizi saglar." },
      { title: "Editor formlari", body: "Secili bolumun baslik, aciklama, buton ve gorsel alanlarini duzenlersiniz." },
      { title: "SEO destek bloklari", body: "Lokal kanit, kayit sureci ve veli yorumu alanlari SEO ve donusum performansi icin bu editorde yonetilir." },
      { title: "Kaydetme durumu", body: "Public vitrinde degisikliklerin kayda alinma ve yayin etkisi burada izlenir." },
    ],
    [
      { title: "1. Bolumu sec", body: "Degistirmek istediginiz landing kismini acin." },
      { title: "2. CTA ve copy guncelle", body: "Public sozel dil ile on kayit, WhatsApp ve bilgi alma akisinin tutarli oldugundan emin olun." },
      { title: "3. Public vitrinde test et", body: "Kaydettikten sonra canli anasayfada Hemen Kayit modalini, WhatsApp/telefon CTA'larini ve lead formunu dogrulayin." },
    ],
    [
      "Hemen Kayit modalinin alan yapisi bu sayfadan degil, Admin / Pre-Registration Settings altindaki builder uzerinden yonetilir.",
      "Lokal proof, kayit sureci ve yorum bloklari; Silivri odakli SEO ve donusum stratejisinin public vitrindeki ana destek alanlaridir.",
    ],
  ),
  "/admin/seo-pages-legacy": docs(
    "Lokal SEO sayfalarinin metadata, icerik bloklari, hedef branş/yas grubu sinyalleri ve related link yapisini yonettiginiz moduldur.",
    [
      {
        title: "SEO metadata guncelleme",
        body: "Baslik, aciklama, canonical ve diger teknik alanlar her landing varyasyonu icin buradan duzenlenir.",
      },
      {
        title: "Sayfa bazli icerik yonetimi",
        body: "Hero, icerik bloklari, CTA, FAQ, testimonial ve internal link alanlari her SEO sayfasi icin bagimsiz yonetilir.",
      },
      {
        title: "SEO page lead kaynagi",
        body: "SEO sayfalarindaki kisa form organic_seo_page kaynagi ile lead toplar; baslik ve CTA buna gore net tutulmalidir.",
      },
    ],
    [
      { title: "Sayfa secici", body: "Hangi lokal SEO sayfasini duzenlediginizi ustten secersiniz." },
      { title: "Metadata alanlari", body: "Search sonucunu ve indeks davranisini etkileyen alanlar burada bulunur." },
      { title: "Hedef sinyal alanlari", body: "Lokasyon, branş ve yas grubu sinyalleri search niyeti ile icerik hiyerarsisini hizalar." },
      { title: "Icerik bolumleri", body: "Sayfanin vitrine cikacak ana icerigi bu alanda yer alir." },
    ],
    [
      { title: "1. Lokal sayfayi sec", body: "Guncellenecek sayfayi once secin." },
      { title: "2. Teknik ve icerik alanlarini duzenle", body: "Metadata, related link, testimonial ve CTA alanlarini ayni oturumda yenileyin." },
      { title: "3. URL ve indeks sonucunu kontrol et", body: "Degisikligin public sayfada, JSON-LD katmaninda ve lead formunda dogru yansidigini test edin." },
    ],
    [
      "Yeni cluster sayfalari Silivri spor okulu, branş bazli niyet sayfalari, yas grubu varyasyonlari ve guven/karar sayfalarini kapsar.",
      "SEO sayfalarinda yer alan kisa form ana landing formundan ayridir; kaynak etiketi organic_seo_page olarak kaydedilir.",
    ],
  ),
  "/admin/pre-registration-settings": docs(
    "Public Hemen Kayit modalinin alanlarini, form sunumunu, logoyu ve yasal metin modallarini yonettiginiz builder merkezidir.",
    [
      {
        title: "Form builder yonetimi",
        body: "Public form alanlarini ekleme, duzenleme, gizleme, surukle-birak ile siralama ve ozel alan CRUD islemleri bu moduldedir.",
      },
      {
        title: "Sunum katmani yonetimi",
        body: "Form etiketi, baslik, aciklama, helper note, basari mesaji ve form ust logosu buradan duzenlenir.",
      },
      {
        title: "Yasal modal icerikleri",
        body: "KVKK ve veli izin metinleri acilir kapanir modal editorden yonetilir; public form bunlari dogrudan buradan okur.",
      },
      {
        title: "Aktivasyon sonrasi operasyon uyumu",
        body: "On kayit aktivasyonu tamamlandiginda olusan ilk tahakkuk, gecici sifre ve WhatsApp bilgilendirme akisi bu builder ile birlikte dusunulur.",
      },
    ],
    [
      {
        title: "Hemen Kayit Formu modali",
        body: "Formun ust gorunumu, logo ve metinleri icin ayrilmis ayar modalidir.",
      },
      {
        title: "Alan builder alani",
        body: "Ogrenci, veli ve basvuru alanlari surukle-birak yerlesim mantigi ile burada yonetilir.",
      },
      {
        title: "Yasal Form modal editoru",
        body: "Checkbox metinleri ve uzun yasal govde icerikleri ayrik modalda tutulur.",
      },
    ],
    [
      { title: "1. Public davranisi sec", body: "Form acik/kapali durumu ve basari mesajini belirleyin." },
      { title: "2. Alanlari duzenle", body: "Gerekirse alan ekleyin, gizleyin veya surukle-birak ile yeniden siralayin." },
      { title: "3. Public modalda test et", body: "Anasayfada Hemen Kayit butonuna basip guncel alanlarin dogru render edildigini kontrol edin." },
    ],
    [
      "Public formda Basvuru Bilgileri bolumu gizli tutulur; builder tarafinda veri modeli korunur ama public rendera cikmaz.",
      "Ogrenci cinsiyet alani hem public on kayit formunda hem manager tarafindaki yeni ogrenci kaydinda kullanilir.",
      "On kayit aktivasyonundan sonra ilk aylik tahakkuk enrollment baslangic gunune gore olusur; odeme ekranlari bu kaydi otomatik tahsilat listesine tasir.",
    ],
  ),
  "/admin/detail-templates": docs(
    "Ogrenci detay profili ve karne/gelisim alanlarinda kullanilan soru setlerini yonettiginiz moduldur.",
    [
      {
        title: "Soru seti olusturma",
        body: "Koc tarafinda detay girisi ve karne olustururken kullanilan alan yapilarini bu sayfadan belirleyin.",
      },
      {
        title: "Alan tipi ve zorunluluk yonetimi",
        body: "Text, textarea, select gibi tipler ile siralama ve zorunlu alan mantigi burada tutulur.",
      },
    ],
    [
      {
        title: "Soru listesi",
        body: "Aktif sorular, alan anahtari, tip ve sira bilgisi ile birlikte listelenir.",
      },
      {
        title: "Editor formu",
        body: "Secilen sorunun label, helper text, placeholder ve secenekleri duzenlenir.",
      },
    ],
    [
      { title: "1. Soruyu sec veya yenisini ekle", body: "Detay profilinde kullanmak istediginiz alani belirleyin." },
      { title: "2. Alan ayarlarini kaydet", body: "Label, secenek ve siralamayi urun diline gore tamamlayin." },
      { title: "3. Ogrenci detayinda test et", body: "Manager veya coach panelinde alanin beklenen yerde ciktigini kontrol edin." },
    ],
    [
      "Detail template alanlari, public on kayit builder ile ayni sey degildir; biri operasyon sonrasi detay, digeri landing basvurusu icindir.",
    ],
  ),
  "/admin/program-resources": docs(
    "Program, grup ve seans serisi yapisini besleyen sabit kaynak sozlugudur.",
    [
      {
        title: "Kaynak sozlugunu guncelleme",
        body: "Program tipi, kategori, spor bransi ve alan listeleri burada yonetilir.",
      },
      {
        title: "Form besleme",
        body: "Manager tarafindaki program, session series, ogrenci ve on kayit aktivasyon formlari seceneklerini bu kaynaktan alir.",
      },
      {
        title: "Aylik tahakkuk etkisi",
        body: "Program ucreti ve grup secimi, enrollment olustuktan sonra hangi aylik tahakkukun ve hangi odeme akisinin dogacagini belirler.",
      },
    ],
    [
      {
        title: "Program ust, grup alt mantigi",
        body: "Program katalog urunudur; grup/slot karsiligi session series tarafinda yasar. Bu ayrim tum operasyon akislarinin temelidir.",
      },
      {
        title: "Alan ve brans iliskileri",
        body: "Seans olusturma ve takvim gorunumunde kullanilan alan/tesis isimleri burada korunur.",
      },
    ],
    [
      { title: "1. Kaynak tipini sec", body: "Brans, kategori veya alan gibi ilgili kaynak sozlugunu acin." },
      { title: "2. Yeni kayit ekle veya guncelle", body: "Manager formlarinda kullanilacak secenegi urun diline uygun kaydedin." },
      { title: "3. Program ve grup akislarinda test et", body: "Program olusturma, session series secimi ve ogrenci baglama ekranlarinda yeni kaynagi dogrulayin." },
    ],
    [
      "8 hak allocation modelinde ogrenci programa degil, programin altindaki session series grubuna baglanir. Bu nedenle kaynak sozlugu dogru kurulmalidir.",
      "Aylik tahakkuklar enrollment.starts_on gununu anchor alir; kisa aylarda ayin son gunu kullanilir ve her ay icin tek tahakkuk uretilir.",
    ],
  ),
  "/admin/security": docs(
    "Audit loglari, landing basvurulari ve panel sinyallerini denetlediginiz merkezdir.",
    [
      {
        title: "Audit kayitlarini inceleme",
        body: "Manuel odeme girisi, toplu hatirlatma, kayit aktivasyonu ve benzeri kritik olaylar burada gorulur.",
      },
      {
        title: "Bildirim akislarini takip etme",
        body: "Message topic tabanli panel bildirimleri, yeni on kayit ve sistemsel uyarilar bu modulle birlikte okunur.",
      },
    ],
    [
      {
        title: "Audit tablosu",
        body: "Kim, ne zaman, hangi entity uzerinde islem yapti sorusunun cevabi bu tabloda tutulur.",
      },
      {
        title: "Landing / lead sinyalleri",
        body: "Public landing akisi ile panel operasyonlari arasindaki gecis kayitlari burada izlenebilir.",
      },
      {
        title: "Bildirim izleri",
        body: "Odeme, kayit ve hak bitis gibi panel notice konularinin operasyon etkisi burada okunur.",
      },
    ],
    [
      { title: "1. Olay turunu sec", body: "Audit veya lead akisindan hangisini inceleyeceginizi belirleyin." },
      { title: "2. Kaydin baglamini kontrol et", body: "Entity tipi, actor ve payload alanlari ile sebebi netlestirin." },
      { title: "3. Ilgili modula don", body: "Gerekiyorsa settings, finance veya pre-registration modullerine donerek duzeltmeyi uygulayin." },
    ],
    [
      "Odeme panel bildirimleri artik 7 gunu gecen kayitlar icin 'Odeme Yapilmadi' mantigi ile uretilir; eski risk/takip dili operasyon referansi olmaktan cikmistir.",
    ],
  ),
};

function buildFallbackDocumentation(item: RoleNavItem): PageDocumentation {
  return {
    pageKey: item.href,
    title: compactLabel(item.label),
    purpose: item.description,
    actions: [
      {
        title: "Sayfa okuma",
        body: `${compactLabel(item.label)} sayfasindaki kayitlari ve durum sinyallerini buradan izleyebilirsiniz.`,
      },
      {
        title: "Ilgili aksiyonlara gecis",
        body: "Bu sayfada listelenen veri ve kartlar uzerinden ilgili isleme veya kayda gecis yapabilirsiniz.",
      },
    ],
    areas: [
      { title: "Ana liste veya tablo", body: "Sayfanin temel veri cikisi burada listelenir." },
      { title: "Ozet kartlari", body: "Durum okumasi ve hizli aksiyonlar icin ustte kullanilir." },
    ],
    workflow: [
      { title: "1. Sayfayi incele", body: "Liste veya ozet kartlar uzerinden mevcut durumu okuyun." },
      { title: "2. Ilgili islemi yap", body: "Bu moduldeki aksiyonlar ile gerekli kayda veya forma gecin." },
      { title: "3. Sonucu dogrula", body: "Degisikligin ilgili tablo, panel veya public akis uzerinde yansidigini kontrol edin." },
    ],
    notes: [],
  };
}

const adminNavigationItems = navigationByRole.admin;

export const adminPageDocumentation = adminNavigationItems.map((item) => {
  const doc = ADMIN_DOCS[item.href];

  if (!doc) {
    return buildFallbackDocumentation(item);
  }

  return {
    pageKey: item.href,
    title: compactLabel(item.label),
    ...doc,
  } satisfies PageDocumentation;
});

export function getAdminDocumentation(pageKey: string) {
  return adminPageDocumentation.find((item) => item.pageKey === pageKey) ?? adminPageDocumentation[0];
}
