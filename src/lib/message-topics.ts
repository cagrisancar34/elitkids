import type { MessageChannel, MessageTopic, MessageTopicKey } from "@/lib/types";

export const MESSAGE_TOPIC_KEYS = [
  "registration_completed",
  "pre_registration_activated",
  "student_created_manual",
  "attendance_absent_manual",
  "payment_reminder_manual",
  "report_card_updated",
  "bulk_broadcast",
  "panel_notice_registration_completed",
  "panel_notice_payment_risk",
  "panel_notice_lesson_rights_expiring",
] as const satisfies MessageTopicKey[];

export const DEFAULT_MESSAGE_TOPICS = [
  {
    topicKey: "registration_completed",
    title: "Kayit basariyla olusturuldu",
    description: "Yeni parent kullanici veya kayit tamamlama akisinda WhatsApp preview metni.",
    channel: "whatsapp",
    bodyTemplate:
      "Kaydiniz basari ile gerceklestirilmistir.\nIlk ders gununuz ve saatiniz: {{first_lesson}}\nVeli paneli giris linki: {{login_url}}\nE-posta: {{email}}\n{{access_note}}\nSevgiler,\nElit Sanat ve Spor Kulubu",
    availableVariables: ["first_lesson", "login_url", "email", "access_note"],
    active: true,
    editableByManager: true,
  },
  {
    topicKey: "pre_registration_activated",
    title: "On kayit aktif ogrenciye donusturuldu",
    description: "On kayit aktivasyonu sonrasi veliye gosterilen ve gonderilen hazir mesaj.",
    channel: "both",
    bodyTemplate:
      "Kaydiniz basari ile gerceklestirilmistir.\nIlk ders gununuz ve saatiniz: {{first_lesson}}\nVeli paneli giris linki: {{login_url}}\nE-posta: {{email}}\n{{access_note}}\nSevgiler,\nElit Sanat ve Spor Kulubu",
    availableVariables: ["student_name", "program_name", "first_lesson", "login_url", "email", "access_note"],
    active: true,
    editableByManager: true,
  },
  {
    topicKey: "student_created_manual",
    title: "Manuel ogrenci kaydi acildi",
    description: "Yonetici panelinden yeni ogrenci olusturuldugunda veliye gosterilen ve gonderilen hazir mesaj.",
    channel: "both",
    bodyTemplate:
      "Kaydiniz basari ile gerceklestirilmistir.\nIlk ders gununuz ve saatiniz: {{first_lesson}}\nVeli paneli giris linki: {{login_url}}\nE-posta: {{email}}\n{{access_note}}\nSevgiler,\nElit Sanat ve Spor Kulubu",
    availableVariables: ["student_name", "program_name", "first_lesson", "login_url", "email", "access_note"],
    active: true,
    editableByManager: true,
  },
  {
    topicKey: "attendance_absent_manual",
    title: "Devamsizlik bilgilendirmesi",
    description: "Yoklamada gelmeyen ogrenci icin veliye giden manuel WhatsApp metni.",
    channel: "whatsapp",
    bodyTemplate:
      "{{student_name}} bugunku {{session_title}} seansina katilim gostermedi.\nSeans tarihi: {{session_date}}\nDetay icin ekibimizle iletisime gecebilirsiniz.",
    availableVariables: ["student_name", "session_title", "session_date"],
    active: true,
    editableByManager: true,
  },
  {
    topicKey: "payment_reminder_manual",
    title: "Odeme hatirlatmasi",
    description: "Bekleyen tahakkuklar icin veliye giden WhatsApp metni.",
    channel: "both",
    bodyTemplate:
      "{{student_name}} icin bekleyen odeme bulunuyor.\nProgram: {{program_name}}\nGrup: {{session_series}}\nDonem: {{billing_period}}\nToplam borc: {{amount}}\nKalan odeme: {{remaining_amount}}\nSon tarih: {{due_date}}\nPanel girisi: {{login_url}}",
    availableVariables: [
      "student_name",
      "program_name",
      "session_series",
      "billing_period",
      "amount",
      "remaining_amount",
      "due_date",
      "login_url",
    ],
    active: true,
    editableByManager: true,
  },
  {
    topicKey: "report_card_updated",
    title: "Gelisim kaydi guncellendi",
    description: "Karne veya gelisim kaydi islendikten sonra veliye giden metin.",
    channel: "whatsapp",
    bodyTemplate:
      "{{student_name}} icin gelisim kaydi guncellendi.\nDetaylari panel uzerinden gorebilirsiniz: {{login_url}}",
    availableVariables: ["student_name", "login_url"],
    active: true,
    editableByManager: true,
  },
  {
    topicKey: "bulk_broadcast",
    title: "Genel duyuru",
    description: "Toplu uye / veli gonderimlerinde kullanilan serbest mesaj sablonu.",
    channel: "whatsapp",
    bodyTemplate: "{{message}}\n{{manager_note}}",
    availableVariables: ["message", "manager_note"],
    active: true,
    editableByManager: true,
  },
  {
    topicKey: "panel_notice_registration_completed",
    title: "{{student_name}} kaydi aktif hale geldi",
    description: "Admin ve manager panel bildirimlerinde yeni kayit/aktivasyon ozeti.",
    channel: "panel",
    bodyTemplate:
      "{{student_name}} {{program_name}} programina baglandi. Ilk atanmis seans: {{first_lesson}}.",
    availableVariables: ["student_name", "program_name", "first_lesson"],
    active: true,
    editableByManager: true,
  },
  {
    topicKey: "panel_notice_payment_risk",
    title: "{{student_name}} icin odeme yapilmadi",
    description: "7 gunu gecen tahakkuklar ve gonderilen odeme hatirlatmalari icin panel bildirimi.",
    channel: "panel",
    bodyTemplate:
      "{{student_name}} icin {{amount}} tutarli odeme 7 gun icinde tamamlanmadi. Son tarih: {{due_date}}. Veliye odeme hatirlatmasi gonderildi.",
    availableVariables: ["student_name", "amount", "due_date"],
    active: true,
    editableByManager: true,
  },
  {
    topicKey: "panel_notice_lesson_rights_expiring",
    title: "{{student_name}} icin hak uyarisi",
    description: "Kalan seans hakki 1 oldugunda veya bittiginde olusan panel bildirimi.",
    channel: "panel",
    bodyTemplate:
      "{{student_name}} icin kalan hak: {{remaining_lessons}}. Yeni paket acilmadan sonraki seanslar gorunmeyecek.",
    availableVariables: ["student_name", "remaining_lessons"],
    active: true,
    editableByManager: true,
  },
] as const satisfies ReadonlyArray<{
  topicKey: MessageTopicKey;
  title: string;
  description: string;
  channel: MessageChannel;
  bodyTemplate: string;
  availableVariables: string[];
  active: boolean;
  editableByManager: boolean;
}>;

export function getMessageTopicLabel(topicKey: MessageTopicKey) {
  return DEFAULT_MESSAGE_TOPICS.find((topic) => topic.topicKey === topicKey)?.title ?? topicKey;
}

export function toMessageTopicRecord(
  topic: (typeof DEFAULT_MESSAGE_TOPICS)[number] & { id?: string },
): MessageTopic {
  return {
    id: topic.id ?? topic.topicKey,
    topicKey: topic.topicKey,
    title: topic.title,
    description: topic.description,
    channel: topic.channel,
    bodyTemplate: topic.bodyTemplate,
    availableVariables: [...topic.availableVariables],
    active: topic.active,
    editableByManager: topic.editableByManager,
  };
}

export function renderMessageTemplate(
  template: string,
  variables: Record<string, string | number | null | undefined>,
) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_full, key: string) => {
    const value = variables[key];
    return value === null || value === undefined ? "" : String(value);
  }).replace(/\n{3,}/g, "\n\n").trim();
}
