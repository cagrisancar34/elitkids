import type {
  MessageDeliveryStatus,
  RecipientSegment,
  WhatsAppTemplateEventKey,
} from "@/lib/types";

export const WHATSAPP_EVENT_KEYS = [
  "registration_completed",
  "attendance_absent_manual",
  "payment_reminder_manual",
  "report_card_updated",
  "bulk_broadcast",
] as const satisfies WhatsAppTemplateEventKey[];

export const WHATSAPP_SEGMENTS = [
  { value: "all_parents", label: "Tum veliler" },
  { value: "all_users", label: "Tum kullanicilar" },
  { value: "debt_parents", label: "Borclu veliler" },
  { value: "program_parents", label: "Belirli program velileri" },
  { value: "branch_parents", label: "Belirli sube velileri" },
  { value: "all_staff", label: "Tum personel" },
  { value: "coaches", label: "Yalniz koclar" },
  { value: "managers", label: "Yalniz yoneticiler" },
] as const satisfies ReadonlyArray<{ value: RecipientSegment; label: string }>;

export const WHATSAPP_STATUS_LABELS: Record<MessageDeliveryStatus, string> = {
  blocked: "Engellendi",
  queued: "Kuyrukta",
  processing: "Hazirlaniyor",
  sent: "Gonderildi",
  delivered: "Teslim edildi",
  read: "Okundu",
  failed: "Basarisiz",
};

export const DEFAULT_WHATSAPP_TEMPLATE_DEFINITIONS = [
  {
    eventKey: "registration_completed",
    locale: "tr",
    metaTemplateName: "registration_completed",
    enabled: false,
    variableSchema: ["login_url", "email", "setup_link"],
  },
  {
    eventKey: "attendance_absent_manual",
    locale: "tr",
    metaTemplateName: "attendance_absent_manual",
    enabled: false,
    variableSchema: ["student_name", "session_title", "session_date"],
  },
  {
    eventKey: "payment_reminder_manual",
    locale: "tr",
    metaTemplateName: "payment_reminder_manual",
    enabled: false,
    variableSchema: ["student_name", "amount", "due_date", "login_url"],
  },
  {
    eventKey: "report_card_updated",
    locale: "tr",
    metaTemplateName: "report_card_updated",
    enabled: false,
    variableSchema: ["student_name", "login_url"],
  },
  {
    eventKey: "bulk_broadcast",
    locale: "tr",
    metaTemplateName: "bulk_broadcast",
    enabled: false,
    variableSchema: ["message"],
  },
] as const;
