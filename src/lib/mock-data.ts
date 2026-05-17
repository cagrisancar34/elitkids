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
  name: "Elit Sanat ve Spor Kulubu",
  season: "2026 Bahar Donemi",
  promise: "Kayit, takip ve iletisimi tek merkezde toplayan spor okulu operasyon platformu.",
};

export const marketingHighlights = [
  "Kayit, yoklama ve finans tek akista",
  "Koc, yonetici ve veli icin rol bazli paneller",
  "Supabase tabanli guvenli veri modeli",
];

export const metricsByRole: Record<AppRole, Metric[]> = {
  admin: [
    { label: "Aktif kullanici", value: "0", delta: "Canli veri bekleniyor" },
    { label: "Rol politikasi", value: "0", delta: "Canli veri bekleniyor" },
    { label: "Supabase sagligi", value: "--", delta: "Canli veri bekleniyor" },
  ],
  manager: [
    { label: "Toplam ogrenci", value: "0", delta: "Canli veri bekleniyor" },
    { label: "Bugun seans", value: "0", delta: "Canli veri bekleniyor" },
    { label: "Acik borc", value: "₺0", delta: "Canli veri bekleniyor" },
  ],
  coach: [
    { label: "Bugun seans", value: "0", delta: "Canli veri bekleniyor" },
    { label: "Hazir roster", value: "0", delta: "Canli veri bekleniyor" },
    { label: "Tamamlanan yoklama", value: "%0", delta: "Canli veri bekleniyor" },
  ],
  parent: [
    { label: "Bu hafta seans", value: "0", delta: "Canli veri bekleniyor" },
    { label: "Devam orani", value: "%0", delta: "Canli veri bekleniyor" },
    { label: "Acik bakiye", value: "₺0", delta: "Canli veri bekleniyor" },
  ],
};

export const studentRecords: StudentRecord[] = [
  {
    id: "mock-student-1",
    initials: "MK",
    name: "Mina Kaya",
    club: "Elit Sanat ve Spor Kulubu",
    category: "Baslangic",
    gender: "Kadin",
    birthDate: "12.03.2018",
    program: "Cocuk Gelisim / 6-8 Yas",
    coach: "Ece Yilmaz",
    attendance: "%94",
    balance: "₺0",
    status: "Aktif",
    programId: "00000000-0000-0000-0000-000000000001",
    chargeOptions: [],
    detailSaved: true,
    reportCard: {
      id: "mock-report-1",
      summary: "Teknik gelisim ve disiplin dengeli ilerliyor.",
      generatedAt: "05 Nis 2026",
      entries: [
        { questionId: "default-category", fieldKey: "category", label: "Kategori", inputType: "text", value: "Baslangic", sortOrder: 10 },
        { questionId: "default-club-name", fieldKey: "club_name", label: "Kulup", inputType: "text", value: "Elit Sanat ve Spor Kulubu", sortOrder: 20 },
        { questionId: "default-technical-score", fieldKey: "technical_score", label: "Teknik puan", inputType: "number", value: "8", sortOrder: 30 },
        { questionId: "default-discipline-score", fieldKey: "discipline_score", label: "Disiplin puan", inputType: "number", value: "9", sortOrder: 40 },
        { questionId: "default-participation-score", fieldKey: "participation_score", label: "Katilim puan", inputType: "number", value: "8", sortOrder: 50 },
        { questionId: "default-strengths", fieldKey: "strengths", label: "Guclu yonler", inputType: "textarea", value: "Denge, dikkat ve ritim algisi.", sortOrder: 60 },
        { questionId: "default-improvement-areas", fieldKey: "improvement_areas", label: "Gelisim alanlari", inputType: "textarea", value: "Hizli donuslerde daha fazla tekrar.", sortOrder: 70 },
        { questionId: "default-coach-notes", fieldKey: "coach_notes", label: "Koc notu", inputType: "textarea", value: "Grup icinde uyumlu ve ritmi guclu.", sortOrder: 80 },
      ],
    },
    detailEntries: [
      { questionId: "default-category", fieldKey: "category", label: "Kategori", inputType: "text", value: "Baslangic", sortOrder: 10 },
      { questionId: "default-club-name", fieldKey: "club_name", label: "Kulup", inputType: "text", value: "Elit Sanat ve Spor Kulubu", sortOrder: 20 },
      { questionId: "default-technical-score", fieldKey: "technical_score", label: "Teknik puan", inputType: "number", value: "8", sortOrder: 30 },
      { questionId: "default-discipline-score", fieldKey: "discipline_score", label: "Disiplin puan", inputType: "number", value: "9", sortOrder: 40 },
      { questionId: "default-participation-score", fieldKey: "participation_score", label: "Katilim puan", inputType: "number", value: "8", sortOrder: 50 },
      { questionId: "default-strengths", fieldKey: "strengths", label: "Guclu yonler", inputType: "textarea", value: "Denge, dikkat ve ritim algisi.", sortOrder: 60 },
      { questionId: "default-improvement-areas", fieldKey: "improvement_areas", label: "Gelisim alanlari", inputType: "textarea", value: "Hizli donuslerde daha fazla tekrar.", sortOrder: 70 },
      { questionId: "default-coach-notes", fieldKey: "coach_notes", label: "Koc notu", inputType: "textarea", value: "Grup icinde uyumlu ve ritmi guclu.", sortOrder: 80 },
    ],
  },
  {
    id: "mock-student-2",
    initials: "AD",
    name: "Aras Demir",
    club: "Elit Sanat ve Spor Kulubu",
    category: "Performans",
    gender: "Erkek",
    birthDate: "18.06.2015",
    program: "Yuzme Gelisim / 9-12 Yas",
    coach: "Ugur Tan",
    attendance: "%88",
    balance: "₺1.450",
    status: "Takip",
    programId: "00000000-0000-0000-0000-000000000002",
    chargeOptions: [],
    detailSaved: false,
    reportCard: null,
    detailEntries: [],
  },
  {
    id: "mock-student-3",
    initials: "LA",
    name: "Lina Aydin",
    club: "Elit Sanat ve Spor Kulubu",
    category: "Koordinasyon",
    gender: "Kadin",
    birthDate: "05.01.2016",
    program: "Cimnastik Baslangic",
    coach: "Sena Koc",
    attendance: "%97",
    balance: "₺0",
    status: "Aktif",
    programId: "00000000-0000-0000-0000-000000000003",
    chargeOptions: [],
    detailSaved: true,
    reportCard: {
      id: "mock-report-3",
      summary: "Katilim ve teknik duzenli yukseliyor.",
      generatedAt: "02 Nis 2026",
      entries: [
        { questionId: "default-category", fieldKey: "category", label: "Kategori", inputType: "text", value: "Koordinasyon", sortOrder: 10 },
        { questionId: "default-club-name", fieldKey: "club_name", label: "Kulup", inputType: "text", value: "Elit Sanat ve Spor Kulubu", sortOrder: 20 },
        { questionId: "default-technical-score", fieldKey: "technical_score", label: "Teknik puan", inputType: "number", value: "9", sortOrder: 30 },
        { questionId: "default-discipline-score", fieldKey: "discipline_score", label: "Disiplin puan", inputType: "number", value: "8", sortOrder: 40 },
        { questionId: "default-participation-score", fieldKey: "participation_score", label: "Katilim puan", inputType: "number", value: "9", sortOrder: 50 },
        { questionId: "default-strengths", fieldKey: "strengths", label: "Guclu yonler", inputType: "textarea", value: "Esneklik ve sahne guveni.", sortOrder: 60 },
        { questionId: "default-improvement-areas", fieldKey: "improvement_areas", label: "Gelisim alanlari", inputType: "textarea", value: "Acilis pozisyonlarinda tekrar.", sortOrder: 70 },
        { questionId: "default-coach-notes", fieldKey: "coach_notes", label: "Koc notu", inputType: "textarea", value: "Sahne gecisleri cok guclu.", sortOrder: 80 },
      ],
    },
    detailEntries: [
      { questionId: "default-category", fieldKey: "category", label: "Kategori", inputType: "text", value: "Koordinasyon", sortOrder: 10 },
      { questionId: "default-club-name", fieldKey: "club_name", label: "Kulup", inputType: "text", value: "Elit Sanat ve Spor Kulubu", sortOrder: 20 },
      { questionId: "default-technical-score", fieldKey: "technical_score", label: "Teknik puan", inputType: "number", value: "9", sortOrder: 30 },
      { questionId: "default-discipline-score", fieldKey: "discipline_score", label: "Disiplin puan", inputType: "number", value: "8", sortOrder: 40 },
      { questionId: "default-participation-score", fieldKey: "participation_score", label: "Katilim puan", inputType: "number", value: "9", sortOrder: 50 },
      { questionId: "default-strengths", fieldKey: "strengths", label: "Guclu yonler", inputType: "textarea", value: "Esneklik ve sahne guveni.", sortOrder: 60 },
      { questionId: "default-improvement-areas", fieldKey: "improvement_areas", label: "Gelisim alanlari", inputType: "textarea", value: "Acilis pozisyonlarinda tekrar.", sortOrder: 70 },
      { questionId: "default-coach-notes", fieldKey: "coach_notes", label: "Koc notu", inputType: "textarea", value: "Sahne gecisleri cok guclu.", sortOrder: 80 },
    ],
  },
  {
    id: "mock-student-4",
    initials: "KC",
    name: "Kerem Cetin",
    club: "Elit Sanat ve Spor Kulubu",
    category: "Kamp",
    gender: "Erkek",
    birthDate: "21.09.2014",
    program: "Hizlandirma Kampi",
    coach: "Ece Yilmaz",
    attendance: "%81",
    balance: "₺1.800",
    status: "Risk",
    programId: "00000000-0000-0000-0000-000000000001",
    chargeOptions: [],
    detailSaved: false,
    reportCard: null,
    detailEntries: [],
  },
];

export const sessionRecords: SessionRecord[] = [
  {
    id: "mock-session-1",
    title: "Cocuk Gelisim",
    slot: "09:00 - 10:15",
    coach: "Ece Yilmaz",
    roster: "14 / 16 sporcu",
    location: "Cok Amacli Salon",
    status: "active",
  },
  {
    id: "mock-session-2",
    title: "Yuzme Teknik",
    slot: "11:00 - 12:20",
    coach: "Ugur Tan",
    roster: "18 / 20 sporcu",
    location: "Ana Havuz",
    status: "active",
  },
  {
    id: "mock-session-3",
    title: "Cimnastik Baslangic",
    slot: "15:00 - 16:10",
    coach: "Sena Koc",
    roster: "12 / 14 sporcu",
    location: "Esneklik Salonu",
    status: "active",
  },
];

export const chargeRecords: ChargeRecord[] = [
  {
    item: "Nisan donemi taksidi",
    dueDate: "12 Nisan 2026",
    amount: "₺3.250",
    status: "Odeme Bekleniyor",
    paymentStatus: "pending",
  },
  {
    item: "Ekipman katkisi",
    dueDate: "18 Nisan 2026",
    amount: "₺850",
    status: "Odeme Yapilmadi",
    paymentStatus: "overdue",
  },
  {
    item: "Mart dengeleme odemesi",
    dueDate: "Tamamlandi",
    amount: "₺1.200",
    status: "Odeme Tamamlandi",
    paymentStatus: "completed",
  },
];

export const announcementRecords: AnnouncementRecord[] = [
  {
    title: "Cumartesi ders saatleri guncellendi",
    audience: "Tum veliler",
    time: "Bugun / 10:30",
    summary: "Program yogunlugu nedeniyle iki grup icin seans baslangici 20 dakika kaydirildi.",
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
