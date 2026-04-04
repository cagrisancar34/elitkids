import type {
  AnnouncementRecord,
  AppRole,
  ChargeRecord,
  Metric,
  NotificationRecord,
  SessionRecord,
  StudentRecord,
  SupportThread,
} from "@/lib/types";

export const academyProfile = {
  name: "Elit Kids Akademi",
  season: "2026 Bahar Donemi",
  promise: "Buz ustundeki disiplini dijital tarafta da ayni netlikte yoneten spor okulu platformu.",
};

export const marketingHighlights = [
  "Kayit, yoklama ve finans tek akista",
  "Koc, yonetici ve veli icin rol bazli paneller",
  "Supabase tabanli guvenli veri modeli",
];

export const metricsByRole: Record<AppRole, Metric[]> = {
  admin: [
    { label: "Aktif kullanici", value: "84", delta: "+12 bu ay" },
    { label: "Rol politikasi", value: "16", delta: "4 kritik kural" },
    { label: "Supabase sagligi", value: "%99.9", delta: "7 gun uptime" },
  ],
  manager: [
    { label: "Toplam ogrenci", value: "312", delta: "+28 yeni kayit" },
    { label: "Bugun seans", value: "19", delta: "3 tanesi dolu" },
    { label: "Acik borc", value: "₺148.320", delta: "14 aile icin takip" },
  ],
  coach: [
    { label: "Bugun seans", value: "4", delta: "1 seans icin yer degisti" },
    { label: "Hazir roster", value: "52 sporcu", delta: "6 eksik evrak" },
    { label: "Tamamlanan yoklama", value: "%78", delta: "1 seans bekliyor" },
  ],
  parent: [
    { label: "Bu hafta seans", value: "3", delta: "Cumartesi ek buz saati" },
    { label: "Devam orani", value: "%92", delta: "Son 30 gun" },
    { label: "Acik bakiye", value: "₺3.250", delta: "12 Nisan son odeme" },
  ],
};

export const studentRecords: StudentRecord[] = [
  {
    name: "Mina Kaya",
    program: "Mini Ice / 6-8 Yas",
    coach: "Ece Yilmaz",
    attendance: "%94",
    balance: "₺0",
    status: "Aktif",
  },
  {
    name: "Aras Demir",
    program: "Power Skating / 9-12 Yas",
    coach: "Ugur Tan",
    attendance: "%88",
    balance: "₺1.450",
    status: "Takip",
  },
  {
    name: "Lina Aydin",
    program: "Artistik Baslangic",
    coach: "Sena Koc",
    attendance: "%97",
    balance: "₺0",
    status: "Aktif",
  },
  {
    name: "Kerem Cetin",
    program: "Hizlandirma Kampi",
    coach: "Ece Yilmaz",
    attendance: "%81",
    balance: "₺1.800",
    status: "Risk",
  },
];

export const sessionRecords: SessionRecord[] = [
  {
    title: "Mini Ice Teknik",
    slot: "09:00 - 10:15",
    coach: "Ece Yilmaz",
    roster: "14 / 16 sporcu",
    location: "Ana Pist",
  },
  {
    title: "Power Skating",
    slot: "11:00 - 12:20",
    coach: "Ugur Tan",
    roster: "18 / 20 sporcu",
    location: "Mavi Pist",
  },
  {
    title: "Artistik Baslangic",
    slot: "15:00 - 16:10",
    coach: "Sena Koc",
    roster: "12 / 14 sporcu",
    location: "Ana Pist",
  },
];

export const chargeRecords: ChargeRecord[] = [
  {
    item: "Nisan donemi taksidi",
    dueDate: "12 Nisan 2026",
    amount: "₺3.250",
    status: "Bekliyor",
  },
  {
    item: "Ekipman katkisi",
    dueDate: "18 Nisan 2026",
    amount: "₺850",
    status: "Planlandi",
  },
  {
    item: "Mart dengeleme odemesi",
    dueDate: "Tamamlandi",
    amount: "₺1.200",
    status: "Odendi",
  },
];

export const announcementRecords: AnnouncementRecord[] = [
  {
    title: "Cumartesi buz saatleri guncellendi",
    audience: "Tum veliler",
    time: "Bugun / 10:30",
    summary: "Program yogunlugu nedeniyle iki grup icin pist gecisi 20 dakika otelendi.",
  },
  {
    title: "Koc brifingi",
    audience: "Koclar",
    time: "Yarin / 08:15",
    summary: "Yeni yoklama ve seans notu akisinin saha oncesi uyum toplantisi.",
  },
];

export const notificationRecords: NotificationRecord[] = [
  {
    title: "14 ailenin borc hatirlatmasi hazir",
    channel: "In-app",
    status: "Yayin icin hazir",
  },
  {
    title: "Bugun 3 seans yoklama bekliyor",
    channel: "In-app",
    status: "Aksiyon gerekli",
  },
];

export const supportThreads: SupportThread[] = [
  {
    subject: "Yaz kampi yenileme talebi",
    status: "Yanit bekliyor",
    updatedAt: "2 saat once",
  },
  {
    subject: "Dekont yukleme teyidi",
    status: "Cozuldu",
    updatedAt: "Dun",
  },
];

export const roleSpotlights = {
  admin: "Supabase yetki sinirlari, rol matrisi ve kurumsal ayarlar tek noktada yonetilir.",
  manager:
    "Gunun operasyon ritmi, ogrenci durumu ve tahsilat gundemi ayni calisma yuzeyinde birlesir.",
  coach:
    "Seans akisi, roster ve yoklama gibi saha odakli kararlar gereksiz chrome olmadan one cikar.",
  parent:
    "Aile paneli mobil once tasarlanir; program, devam ve odeme bilgisi tek bakista gorulur.",
};
