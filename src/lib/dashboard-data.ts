import { format } from "date-fns";

import { calculateOutstandingBalance, formatTry } from "@/lib/finance";
import { metricsByRole } from "@/lib/mock-data";
import {
  getPaymentLifecycleLabel,
  resolveAggregatePaymentLifecycleStatus,
  resolveChargeAnchorDate,
  resolvePaymentLifecycleStatus,
} from "@/lib/payment-status";
import { getAllocationSummaryMap } from "@/lib/session-allocations";
import {
  defaultStudentDetailQuestions,
  getFallbackEntriesFromLegacy,
  parseQuestionOptions,
} from "@/lib/student-reporting";
import { getCurrentAuthContext } from "@/lib/auth";
import { getOrCreateOrganizationContext } from "@/lib/organization-context";
import type {
  AnnouncementRecord,
  AdminUserRow,
  AdminOverviewSummary,
  Area,
  AttendanceStudent,
  AuditLogRow,
  BranchSetting,
  Category,
  ChargeRecord,
  CommunicationTimelineItem,
  ChargeOption,
  CoachOption,
  CoachClosingNoteArchiveItem,
  CoachDashboardSummary,
  CoachSessionDetail,
  CoachSessionSummary,
  CoachStudentRecord,
  CoachSessionBoard,
  DetailAnswerRecord,
  DetailQuestionRecord,
  LeadSubmissionRow,
  Metric,
  NotificationRecord,
  OrganizationSettings,
  ParentNotification,
  ParentLinkedStudentSummary,
  ParentDashboardSummary,
  ManagerStudentListRow,
  ManagerStudentSheet,
  ProgramFormOptions,
  ProgramResourceAdminData,
  ProgramRecord,
  ProgramOption,
  ProgramType,
  SeasonSetting,
  SessionSeriesOption,
  SessionRecord,
  SportsBranch,
  StudentOption,
  StudentCrmTimelineItem,
  StudentRecord,
  StudentReportCard,
  SupportThread,
  SupportThreadStatusKey,
  ManagerDashboardSummary,
} from "@/lib/types";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

const DASHBOARD_CACHE_TTL_MS = 8_000;
const dashboardCache = new Map<string, { expiresAt: number; value: unknown }>();
type DashboardAdminClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;

async function withDashboardCache<T>(key: string, loader: () => Promise<T>) {
  const now = Date.now();
  const cached = dashboardCache.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.value as T;
  }

  const value = await loader();
  dashboardCache.set(key, { value, expiresAt: now + DASHBOARD_CACHE_TTL_MS });
  return value;
}

function formatDateTimeRange(startsAt: string, endsAt: string) {
  return `${format(new Date(startsAt), "dd MMM / HH:mm")} - ${format(
    new Date(endsAt),
    "HH:mm",
  )}`;
}

function formatTimeValue(value: string) {
  return format(new Date(value), "HH:mm");
}

function formatDayKey(value: string) {
  return format(new Date(value), "yyyy-MM-dd");
}

function formatDayLabel(value: string) {
  return format(new Date(value), "dd MMM");
}

function formatDayShort(value: string) {
  return format(new Date(value), "EEE");
}

function formatDateLabel(value: string | null) {
  if (!value) {
    return "Tarih yok";
  }

  return format(new Date(value), "dd MMM yyyy");
}

function getDayDifferenceFromNow(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
}

function formatResponseAgeLabel(value: string | null | undefined) {
  const days = getDayDifferenceFromNow(value);

  if (days === null) {
    return "Sure yok";
  }

  if (days === 0) {
    return "Bugun";
  }

  if (days === 1) {
    return "1 gundur";
  }

  return `${days} gundur`;
}

function getSupportSlaMeta(
  statusKey: SupportThreadStatusKey,
  openedAt: string | null | undefined,
) {
  if (statusKey === "resolved") {
    return {
      label: "Kapatildi",
      tone: "emerald" as const,
    };
  }

  const days = getDayDifferenceFromNow(openedAt);

  if ((days ?? 0) >= 3) {
    return {
      label: "SLA asildi",
      tone: "rose" as const,
    };
  }

  if ((days ?? 0) >= 1) {
    return {
      label: "Bugun cevaplanmali",
      tone: "amber" as const,
    };
  }

  return {
    label: "Ritimde",
    tone: "emerald" as const,
  };
}

function normalizePhoneDigits(value: string | null | undefined) {
  return String(value ?? "").replace(/\D/g, "");
}

function formatMessageDeliveryLabel(status: string | null | undefined) {
  if (status === "read") {
    return "Okundu";
  }

  if (status === "delivered") {
    return "Ulasti";
  }

  if (status === "sent") {
    return "Gonderildi";
  }

  if (status === "queued") {
    return "Kuyrukta";
  }

  if (status === "failed") {
    return "Basarisiz";
  }

  if (status === "blocked") {
    return "Engelli";
  }

  return "Durum yok";
}

function formatMessageEventLabel(eventKey: string | null | undefined) {
  switch ((eventKey ?? "").toLocaleLowerCase("tr-TR")) {
    case "payment_reminder_manual":
      return "Odeme hatirlatmasi";
    case "registration_completed":
      return "Kayit tamamlama";
    case "attendance_absent_manual":
      return "Devamsizlik bildirimi";
    case "report_card_updated":
      return "Karne bilgilendirmesi";
    case "bulk_broadcast":
      return "Toplu kampanya";
    default:
      return "WhatsApp kampanyasi";
  }
}

function getSupportStatusKey(status: string | null | undefined): "open" | "waiting_parent" | "resolved" {
  const lower = String(status ?? "").toLocaleLowerCase("tr-TR");

  if (lower.includes("resolved") || lower.includes("closed") || lower.includes("cozul")) {
    return "resolved";
  }

  if (lower.includes("waiting_parent") || lower.includes("veli")) {
    return "waiting_parent";
  }

  return "open";
}

function getSupportStatusLabel(status: string | null | undefined) {
  const key = getSupportStatusKey(status);

  if (key === "resolved") {
    return "Cozuldu";
  }

  if (key === "waiting_parent") {
    return "Veli yaniti bekleniyor";
  }

  return "Yanit bekliyor";
}

const SESSION_WEEKDAY_LABELS: Record<number, string> = {
  1: "Pzt",
  2: "Sal",
  3: "Car",
  4: "Per",
  5: "Cum",
  6: "Cts",
  7: "Paz",
};

function formatSessionSeriesLabel({
  title,
  weekdays,
  startTime,
}: {
  title: string;
  weekdays: number[] | null | undefined;
  startTime: string | null | undefined;
}) {
  const dayLabel = Array.isArray(weekdays)
    ? weekdays
        .map((day) => SESSION_WEEKDAY_LABELS[day])
        .filter(Boolean)
        .join(" / ")
    : "";

  return [title, dayLabel, startTime ?? ""].filter(Boolean).join(" · ");
}

function getRelatedTitle(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0]?.title === "string" ? value[0].title : null;
  }

  if (value && typeof value === "object" && "title" in value) {
    return typeof value.title === "string" ? value.title : null;
  }

  return null;
}

function getRelatedFullName(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0]?.full_name === "string" ? value[0].full_name : null;
  }

  if (value && typeof value === "object" && "full_name" in value) {
    return typeof value.full_name === "string" ? value.full_name : null;
  }

  return null;
}

function getRelatedAgeBand(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0]?.age_band === "string" ? value[0].age_band : null;
  }

  if (value && typeof value === "object" && "age_band" in value) {
    return typeof value.age_band === "string" ? value.age_band : null;
  }

  return null;
}

function getRelatedStartTime(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0]?.start_time === "string" ? value[0].start_time : null;
  }

  if (value && typeof value === "object" && "start_time" in value) {
    return typeof value.start_time === "string" ? value.start_time : null;
  }

  return null;
}

function getRelatedWeekdays(value: unknown) {
  if (Array.isArray(value)) {
    return Array.isArray(value[0]?.weekdays) ? (value[0].weekdays as number[]) : [];
  }

  if (value && typeof value === "object" && "weekdays" in value) {
    return Array.isArray(value.weekdays) ? (value.weekdays as number[]) : [];
  }

  return [];
}

function getRelatedName(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0]?.name === "string" ? value[0].name : null;
  }

  if (value && typeof value === "object" && "name" in value) {
    return typeof value.name === "string" ? value.name : null;
  }

  return null;
}

function getStudentInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatBirthDate(value: string | null) {
  if (!value) {
    return "--.--.----";
  }

  return format(new Date(value), "dd.MM.yyyy");
}

function normalizeDetailQuestions(
  rows:
    | Array<{
        id: string;
        field_key: string;
        label: string;
        input_type: string;
        helper_text: string | null;
        placeholder: string | null;
        options: unknown;
        required: boolean | null;
        active: boolean | null;
        sort_order: number | null;
      }>
    | null
    | undefined,
): DetailQuestionRecord[] {
  if (!rows?.length) {
    return defaultStudentDetailQuestions;
  }

  return rows
    .map((row) => ({
      id: row.id,
      fieldKey: row.field_key,
      label: row.label,
      inputType: (
        row.input_type === "textarea" ||
        row.input_type === "number" ||
        row.input_type === "select"
          ? row.input_type
          : "text"
      ) as DetailQuestionRecord["inputType"],
      helperText: row.helper_text ?? "",
      placeholder: row.placeholder ?? "",
      options: parseQuestionOptions(row.options),
      required: Boolean(row.required),
      active: row.active ?? true,
      sortOrder: Number(row.sort_order ?? 100),
      source: "database" as const,
    }))
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function normalizeReportCardPayloadEntries(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("entries" in payload) || !Array.isArray(payload.entries)) {
    return [] as DetailAnswerRecord[];
  }

  return payload.entries
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const inputType =
        entry.inputType === "textarea" ||
        entry.inputType === "number" ||
        entry.inputType === "select"
          ? entry.inputType
          : "text";

      return {
        questionId: typeof entry.questionId === "string" ? entry.questionId : "",
        fieldKey: typeof entry.fieldKey === "string" ? entry.fieldKey : "",
        label: typeof entry.label === "string" ? entry.label : "Alan",
        inputType,
        value: typeof entry.value === "string" ? entry.value : "",
        sortOrder: typeof entry.sortOrder === "number" ? entry.sortOrder : 100,
      } satisfies DetailAnswerRecord;
    })
    .filter((entry): entry is DetailAnswerRecord => Boolean(entry?.fieldKey))
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function buildStudentReportCard(input: {
  id: string;
  summary: string;
  generatedAt: string | null;
  payload: unknown;
  legacyDetail?: {
    category?: string | null;
    clubName?: string | null;
    technicalScore?: number | null;
    disciplineScore?: number | null;
    participationScore?: number | null;
    strengths?: string | null;
    improvementAreas?: string | null;
    coachNotes?: string | null;
  } | null;
}) {
  const payloadEntries = normalizeReportCardPayloadEntries(input.payload);
  const fallbackEntries = input.legacyDetail ? getFallbackEntriesFromLegacy(input.legacyDetail) : [];
  const entries = payloadEntries.length ? payloadEntries : fallbackEntries;

  return {
    id: input.id,
    summary: input.summary,
    generatedAt: formatDateLabel(input.generatedAt),
    entries,
  } satisfies StudentReportCard;
}

function getStudentLifecycleStatus(balance: number, active: boolean) {
  if (!active) {
    return "Pasif";
  }

  return "Aktif";
}

function sumPayments(
  payments: Array<{ amount?: number | string | null }> | null | undefined,
) {
  return Array.isArray(payments)
    ? payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0)
    : 0;
}

function resolveChargePaymentStatus(input: {
  amount: number | string | null | undefined;
  payments?: Array<{ amount?: number | string | null }> | null;
  enrollmentStartsOn?: string | null;
  chargeCreatedAt?: string | null;
  dueDate?: string | null;
}) {
  const totalPaid = sumPayments(input.payments);
  const anchorDate = resolveChargeAnchorDate({
    enrollmentStartsOn: input.enrollmentStartsOn,
    chargeCreatedAt: input.chargeCreatedAt,
    dueDate: input.dueDate,
  });

  return resolvePaymentLifecycleStatus({
    amount: input.amount,
    totalPaid,
    anchorDate,
  });
}

function isLiveEnabled() {
  return getSupabaseConfig().isConfigured;
}

async function getCurrentOrganizationId() {
  const auth = await getCurrentAuthContext();
  if (!auth?.userId) {
    return null;
  }

  const context = await getOrCreateOrganizationContext(auth.userId);
  return context.organizationId;
}

export async function getStudentDetailQuestions() {
  if (!isLiveEnabled()) {
    return defaultStudentDetailQuestions;
  }

  const auth = await getCurrentAuthContext();
  const organizationId = await getCurrentOrganizationId();
  const adminClient = createSupabaseAdminClient();

  if (!organizationId || !adminClient) {
    return defaultStudentDetailQuestions;
  }

  return withDashboardCache(`student-detail-questions:${auth?.userId ?? "anonymous"}:${organizationId}`, async () => {
    const { data, error } = await adminClient
      .from("student_detail_questions")
      .select(
        "id, field_key, label, input_type, helper_text, placeholder, options, required, active, sort_order",
      )
      .eq("organization_id", organizationId)
      .order("sort_order");

    if (error) {
      return defaultStudentDetailQuestions;
    }

    return normalizeDetailQuestions(data);
  });
}

export async function getAdminMetrics() {
  if (!isLiveEnabled()) {
    return metricsByRole.admin;
  }

  const auth = await getCurrentAuthContext();

  return withDashboardCache(`admin-metrics:${auth?.userId ?? "anonymous"}`, async () => {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return metricsByRole.admin;
    }

    const [{ count: profileCount }, { count: roleCount }, { count: unreadCount }] = await Promise.all([
      supabase.from("profiles").select("*", { head: true, count: "exact" }),
      supabase.from("user_roles").select("*", { head: true, count: "exact" }),
      supabase.from("notifications").select("*", { head: true, count: "exact" }).is("read_at", null),
    ]);

    return [
      {
        label: "Aktif kullanici",
        value: String(profileCount ?? 0),
        delta: "Canli Supabase verisi",
      },
      {
        label: "Rol kaydi",
        value: String(roleCount ?? 0),
        delta: "Kurum ici dagilim",
      },
      {
        label: "Okunmamis bildirim",
        value: String(unreadCount ?? 0),
        delta: "Guvenlik ve operasyon akisi",
      },
    ] satisfies Metric[];
  });
}

export async function getAdminNotifications() {
  if (!isLiveEnabled()) {
    return [] as NotificationRecord[];
  }

  const auth = await getCurrentAuthContext();

  return withDashboardCache(`admin-notifications:${auth?.userId ?? "anonymous"}`, async () => {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return [] as NotificationRecord[];
    }

    const { data } = await supabase
      .from("notifications")
      .select("title, channel, read_at")
      .order("read_at", { ascending: true, nullsFirst: true })
      .limit(4);

    if (!data?.length) {
      return [] as NotificationRecord[];
    }

    return data.map((item) => ({
      title: item.title,
      channel: item.channel === "in_app" ? "In-app" : item.channel,
      status: item.read_at ? "Okundu" : "Yayin icin hazir",
    })) satisfies NotificationRecord[];
  });
}

export async function getAdminOverviewSummary() {
  try {
    const auth = await getCurrentAuthContext();

    return withDashboardCache(`admin-overview:${auth?.userId ?? "anonymous"}`, async () => {
      return {
        metrics: await getAdminMetrics(),
        notifications: await getAdminNotifications(),
      } satisfies AdminOverviewSummary;
    });
  } catch (error) {
    console.error("Admin overview summary failed", error);

    return {
      metrics: metricsByRole.admin,
      notifications: [],
    } satisfies AdminOverviewSummary;
  }
}

export async function getAdminUsers() {
  if (!isLiveEnabled()) {
    return [] as AdminUserRow[];
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return [] as AdminUserRow[];
  }

  const { data } = await adminClient
    .from("profiles")
    .select("id, full_name, user_roles(role)")
    .limit(20);

  if (!data?.length) {
    return [] as AdminUserRow[];
  }

  const emailMap = new Map<string, string>();

  const { data: userList } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  userList.users.forEach((user) => {
    if (user.id && user.email) {
      emailMap.set(user.id, user.email);
    }
  });

  return data.map((profile) => {
    const firstRole = Array.isArray(profile.user_roles) ? profile.user_roles[0] : null;

    return {
      id: profile.id,
      name: profile.full_name,
      email: emailMap.get(profile.id) ?? "Auth e-postasi baglanmadi",
      role: firstRole?.role ?? "Atanmamis",
      scope: "Tum kurum",
      status: "Aktif",
    };
  }) satisfies AdminUserRow[];
}

export async function getOrganizationSettingsData() {
  if (!isLiveEnabled()) {
    return {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Elit Sanat ve Spor Kulubu",
      slug: "elit-sanat-ve-spor-kulubu",
      locale: "tr-TR",
      timezone: "Europe/Istanbul",
    } satisfies OrganizationSettings;
  }

  const auth = await getCurrentAuthContext();
  if (!auth?.userId) {
    return null;
  }

  const context = await getOrCreateOrganizationContext(auth.userId);

  if (!context.organization) {
    return null;
  }

  return withDashboardCache(`organization-settings:${auth.userId}:${context.organization.id}`, async () => ({
    id: context.organization!.id,
    name: context.organization!.name,
    slug: context.organization!.slug,
    locale: context.organization!.locale,
    timezone: context.organization!.timezone,
  } satisfies OrganizationSettings));
}

export async function getBranchSettingsData() {
  if (!isLiveEnabled()) {
    return [
      {
        id: "00000000-0000-0000-0000-000000000301",
        name: "Merkez Kampus",
        slug: "merkez-kampus",
        location: "Silivri Merkez Yerleskesi",
        status: "Aktif",
        active: true,
        archived: false,
      },
      {
        id: "00000000-0000-0000-0000-000000000302",
        name: "Cok Amacli Salon",
        slug: "cok-amacli-salon",
        location: "Kapali Spor Alani",
        status: "Aktif",
        active: true,
        archived: false,
      },
    ] satisfies BranchSetting[];
  }

  const auth = await getCurrentAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !auth?.userId) {
    return [] as BranchSetting[];
  }

  const context = await getOrCreateOrganizationContext(auth.userId);

  if (!context.organizationId) {
    return [] as BranchSetting[];
  }

  return withDashboardCache(`branch-settings:${auth.userId}:${context.organizationId}`, async () => {
    const { data, error } = await supabase
      .from("branches")
      .select("id, name, slug, location, active, archived_at")
      .eq("organization_id", context.organizationId!)
      .order("name");

    if (error) {
      return [] as BranchSetting[];
    }

    return (data ?? []).map((branch) => ({
      id: branch.id,
      name: branch.name,
      slug: branch.slug,
      location: branch.location ?? "Lokasyon eklenmedi",
      status: branch.archived_at ? "Arsivde" : branch.active ? "Aktif" : "Pasif",
      active: branch.active ?? false,
      archived: Boolean(branch.archived_at),
    })) satisfies BranchSetting[];
  });
}

export async function getSeasonSettingsData() {
  if (!isLiveEnabled()) {
    return [
      {
        id: "00000000-0000-0000-0000-000000000401",
        title: "2026 Bahar Donemi",
        duration: "01 Mar 2026 - 30 Haz 2026",
        status: "Aktif",
        startsOn: "2026-03-01",
        endsOn: "2026-06-30",
        isActive: true,
        isDefault: true,
      },
      {
        id: "00000000-0000-0000-0000-000000000402",
        title: "2026 Yaz Kampi",
        duration: "01 Tem 2026 - 15 Agu 2026",
        status: "Planlandi",
        startsOn: "2026-07-01",
        endsOn: "2026-08-15",
        isActive: false,
        isDefault: false,
      },
    ] satisfies SeasonSetting[];
  }

  const auth = await getCurrentAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !auth?.userId) {
    return [] as SeasonSetting[];
  }

  const context = await getOrCreateOrganizationContext(auth.userId);

  if (!context.organizationId) {
    return [] as SeasonSetting[];
  }

  return withDashboardCache(`season-settings:${auth.userId}:${context.organizationId}`, async () => {
    const { data, error } = await supabase
      .from("seasons")
      .select("id, title, starts_on, ends_on, is_active, is_default")
      .eq("organization_id", context.organizationId!)
      .order("starts_on", { ascending: false });

    if (error) {
      return [] as SeasonSetting[];
    }

    return (data ?? []).map((season) => ({
      id: season.id,
      title: season.title,
      duration: `${formatDateLabel(season.starts_on)} - ${formatDateLabel(season.ends_on)}`,
      status: season.is_active ? "Aktif" : "Planlandi",
      startsOn: season.starts_on,
      endsOn: season.ends_on,
      isActive: season.is_active ?? false,
      isDefault: season.is_default ?? false,
    })) satisfies SeasonSetting[];
  });
}

export async function getManagerMetrics() {
  if (!isLiveEnabled()) {
    return metricsByRole.manager;
  }

  const auth = await getCurrentAuthContext();

  return withDashboardCache(`manager-metrics:${auth?.userId ?? "anonymous"}`, async () => {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return metricsByRole.manager;
    }

    const [studentsCount, sessionsCount, chargesData] = await Promise.all([
      supabase.from("students").select("*", { head: true, count: "exact" }),
      supabase.from("sessions").select("*", { head: true, count: "exact" }).is("cancelled_at", null),
      supabase.from("charges").select("amount, payments(amount)"),
    ]);

    const outstanding = calculateOutstandingBalance(
      (chargesData.data ?? []).map((row) => ({
        amount: Number(row.amount ?? 0),
        paid: Array.isArray(row.payments)
          ? row.payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0)
          : 0,
      })),
    );

    return [
      {
        label: "Toplam ogrenci",
        value: String(studentsCount.count ?? 0),
        delta: "Canli kayit havuzu",
      },
      {
        label: "Planli seans",
        value: String(sessionsCount.count ?? 0),
        delta: "Takvim verisi",
      },
      {
        label: "Acik borc",
        value: formatTry(outstanding),
        delta: "Tahakkuk ve odeme farki",
      },
    ] satisfies Metric[];
  });
}

export async function getManagerDashboardSummary() {
  if (!isLiveEnabled()) {
    return {
      metrics: metricsByRole.manager,
      todaySessions: [],
      announcements: [],
      priorityPayments: [],
      criticalStudents: [],
    } satisfies ManagerDashboardSummary;
  }

  const auth = await getCurrentAuthContext();

  if (!auth?.userId || (auth.role !== "manager" && auth.role !== "admin")) {
    return {
      metrics: metricsByRole.manager,
      todaySessions: [],
      announcements: [],
      priorityPayments: [],
      criticalStudents: [],
    } satisfies ManagerDashboardSummary;
  }

  const organizationContext = await getOrCreateOrganizationContext(auth.userId);
  const adminClient = createSupabaseAdminClient();

  if (!adminClient || !organizationContext.organizationId) {
    return {
      metrics: metricsByRole.manager,
      todaySessions: [],
      announcements: [],
      priorityPayments: [],
      criticalStudents: [],
    } satisfies ManagerDashboardSummary;
  }

  return withDashboardCache(`manager-dashboard-summary:${auth.userId}:${organizationContext.organizationId}`, async () => {
    const metrics = await getManagerMetrics();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const [
      { data: studentRows },
      { data: announcementRows },
      { data: sessionRows },
      { data: sessionsCoaches },
    ] = await Promise.all([
      adminClient
        .from("students")
        .select("id, full_name, active")
        .eq("organization_id", organizationContext.organizationId)
        .limit(12),
      adminClient
        .from("announcements")
        .select("title, body, audience_role, published_at")
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(4),
      adminClient
        .from("sessions")
        .select("id, title, starts_at, ends_at, location, coach_profile_id")
        .gte("starts_at", todayStart.toISOString())
        .lt("starts_at", tomorrowStart.toISOString())
        .is("cancelled_at", null)
        .order("starts_at")
        .limit(4),
      adminClient.from("profiles").select("id, full_name"),
    ]);

    const studentIds = (studentRows ?? []).map((student) => student.id);
    const { data: enrollments } = await adminClient
      .from("enrollments")
      .select("id, student_id, starts_on, status, programs(title)")
      .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]);

    const enrollmentIds = (enrollments ?? []).map((enrollment) => enrollment.id);
    const [attendance, { data: charges }] = await Promise.all([
      getAttendanceMapWithClient(adminClient, studentIds),
      adminClient
        .from("charges")
        .select("id, enrollment_id, amount, due_date, created_at, billing_period, payments(amount, paid_at)")
        .in("enrollment_id", enrollmentIds.length ? enrollmentIds : ["00000000-0000-0000-0000-000000000000"]),
    ]);

    const coachMap = new Map((sessionsCoaches ?? []).map((profile) => [profile.id, profile.full_name]));
    const enrollmentsByStudent = new Map<string, NonNullable<typeof enrollments>[number]>();
    for (const enrollment of (enrollments ?? []).sort((left, right) => {
      if (left.status === "active" && right.status !== "active") return -1;
      if (left.status !== "active" && right.status === "active") return 1;
      return (right.starts_on ?? "").localeCompare(left.starts_on ?? "");
    })) {
      if (!enrollmentsByStudent.has(enrollment.student_id)) {
        enrollmentsByStudent.set(enrollment.student_id, enrollment);
      }
    }

    const chargesByEnrollment = new Map<string, NonNullable<typeof charges>>();
    for (const charge of charges ?? []) {
      const bucket = chargesByEnrollment.get(charge.enrollment_id) ?? [];
      bucket.push(charge);
      chargesByEnrollment.set(charge.enrollment_id, bucket);
    }

    const studentSummaries = (studentRows ?? []).map((student) => {
      const enrollment = enrollmentsByStudent.get(student.id);
      const studentCharges = enrollment?.id ? chargesByEnrollment.get(enrollment.id) ?? [] : [];
      const outstanding = studentCharges.reduce((sum, charge) => {
        const paid = Array.isArray(charge.payments)
          ? charge.payments.reduce((innerSum, payment) => innerSum + Number(payment.amount ?? 0), 0)
          : 0;
        return sum + Math.max(Number(charge.amount ?? 0) - paid, 0);
      }, 0);

      return {
        id: student.id,
        name: student.full_name,
        program: getRelatedTitle(enrollment?.programs) ?? "Program baglanmadi",
        status: getStudentLifecycleStatus(outstanding, student.active ?? true),
        attendance: attendance.get(student.id) ?? "--",
        balance: formatTry(outstanding),
        outstandingValue: outstanding,
      };
    });

    const priorityPayments = studentSummaries
      .flatMap((student) => {
        const enrollment = enrollmentsByStudent.get(student.id);
        const studentCharges = enrollment?.id ? chargesByEnrollment.get(enrollment.id) ?? [] : [];

        return studentCharges.map((charge) => {
          const totalPaid = Array.isArray(charge.payments)
            ? charge.payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0)
            : 0;
          const totalAmount = Number(charge.amount ?? 0);
          const remainingAmount = Math.max(totalAmount - totalPaid, 0);
          const paymentStatus = resolveChargePaymentStatus({
            amount: totalAmount,
            payments: charge.payments,
            enrollmentStartsOn: enrollment?.starts_on ?? null,
            chargeCreatedAt: charge.created_at,
            dueDate: charge.due_date,
          });

          return {
            id: charge.id,
            enrollmentId: enrollment?.id,
            studentId: student.id,
            item: `${student.name} / ${student.program}`,
            dueDate: formatDateLabel(charge.due_date),
            amount: formatTry(totalAmount),
            status: getPaymentLifecycleLabel(paymentStatus),
            paymentStatus,
            billingPeriodLabel: charge.billing_period ? formatDateLabel(charge.billing_period) : undefined,
            totalAmountValue: totalAmount,
            paidAmountValue: totalPaid,
            remainingAmountValue: remainingAmount,
            paidAmount: formatTry(totalPaid),
            remainingAmount: formatTry(remainingAmount),
            lastPaymentLabel:
              Array.isArray(charge.payments) && charge.payments.length
                ? formatDateLabel(charge.payments[0]?.paid_at ?? null)
                : null,
          } satisfies ChargeRecord;
        });
      })
      .filter((charge) => charge.paymentStatus !== "completed")
      .sort((left, right) => (right.remainingAmountValue ?? 0) - (left.remainingAmountValue ?? 0))
      .slice(0, 4);

    const criticalStudents = studentSummaries
      .sort((left, right) => {
        if (right.outstandingValue !== left.outstandingValue) {
          return right.outstandingValue - left.outstandingValue;
        }
        return left.name.localeCompare(right.name, "tr");
      })
      .slice(0, 8)
      .map((student) => ({
        id: student.id,
        name: student.name,
        program: student.program,
        status: student.status,
        attendance: student.attendance,
        balance: student.balance,
      }));

    return {
      metrics,
      announcements: (announcementRows ?? []).map((announcement) => ({
        title: announcement.title,
        audience: announcement.audience_role ? announcement.audience_role : "Tum kullanicilar",
        time: announcement.published_at ? formatDateLabel(announcement.published_at) : "Taslak",
        summary: announcement.body,
      })),
      todaySessions: (sessionRows ?? []).map((session) => ({
        id: session.id,
        title: session.title ?? "Seans",
        slot: formatDateTimeRange(session.starts_at, session.ends_at),
        coach: session.coach_profile_id ? coachMap.get(session.coach_profile_id) ?? "Atanacak" : "Atanacak",
        roster: "",
        location: session.location ?? "Alan belirtilmedi",
        startsAt: session.starts_at,
        endsAt: session.ends_at,
        status: "active",
      })),
      priorityPayments,
      criticalStudents,
    } satisfies ManagerDashboardSummary;
  });
}

async function getAttendanceMap(studentIds: string[]) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || studentIds.length === 0) {
    return new Map<string, string>();
  }

  const { data } = await supabase
    .from("attendance_records")
    .select("student_id, status")
    .in("student_id", studentIds);

  const counts = new Map<string, { total: number; present: number }>();

  (data ?? []).forEach((row) => {
    const current = counts.get(row.student_id) ?? { total: 0, present: 0 };
    current.total += 1;
    if (row.status === "present") {
      current.present += 1;
    }
    counts.set(row.student_id, current);
  });

  return new Map(
    Array.from(counts.entries()).map(([studentId, value]) => [
      studentId,
      value.total > 0 ? `%${Math.round((value.present / value.total) * 100)}` : "--",
    ]),
  );
}

async function getAttendanceMapWithClient(supabase: DashboardAdminClient, studentIds: string[]) {
  if (studentIds.length === 0) {
    return new Map<string, string>();
  }

  const { data } = await supabase
    .from("attendance_records")
    .select("student_id, status")
    .in("student_id", studentIds);

  const counts = new Map<string, { total: number; present: number }>();

  (data ?? []).forEach((row) => {
    const current = counts.get(row.student_id) ?? { total: 0, present: 0 };
    current.total += 1;
    if (row.status === "present") {
      current.present += 1;
    }
    counts.set(row.student_id, current);
  });

  return new Map(
    Array.from(counts.entries()).map(([studentId, value]) => [
      studentId,
      value.total > 0 ? `%${Math.round((value.present / value.total) * 100)}` : "--",
    ]),
  );
}

export async function getManagerStudentListRows() {
  if (!isLiveEnabled()) {
    return [] as ManagerStudentListRow[];
  }

  const auth = await getCurrentAuthContext();

  if (!auth?.userId || (auth.role !== "manager" && auth.role !== "admin")) {
    return [] as ManagerStudentListRow[];
  }

  const organizationContext = await getOrCreateOrganizationContext(auth.userId);
  const adminClient = createSupabaseAdminClient();

  if (!adminClient || !organizationContext.organizationId || !organizationContext.organization) {
    return [] as ManagerStudentListRow[];
  }

  return withDashboardCache(`manager-student-list:${auth.userId}:${organizationContext.organizationId}`, async () => {
    const { data: students } = await adminClient
      .from("students")
      .select("id, full_name, birth_date, gender, active")
      .eq("organization_id", organizationContext.organizationId)
      .limit(20);

    if (!students?.length) {
      return [] as ManagerStudentListRow[];
    }

    const studentIds = students.map((student) => student.id);
    const { data: enrollments } = await adminClient
      .from("enrollments")
      .select(
        "id, student_id, status, program_id, session_series_id, starts_on, ends_on, programs(title, age_band), session_series(title, start_time, weekdays)",
      )
      .in("student_id", studentIds);

    const enrollmentIds = (enrollments ?? []).map((enrollment) => enrollment.id);
    const [
      allocationSummaryMap,
      { data: charges },
      { data: detailProfiles },
      { data: reportCards },
      { data: activatedPreRegistrations },
      { data: parentLinks },
      attendance,
    ] = await Promise.all([
      getAllocationSummaryMap(adminClient, enrollmentIds),
      adminClient
        .from("charges")
        .select("id, enrollment_id, amount, due_date, created_at, billing_period, payments(amount, paid_at, created_at, note)")
        .in("enrollment_id", enrollmentIds.length ? enrollmentIds : ["00000000-0000-0000-0000-000000000000"]),
      adminClient
        .from("student_detail_profiles")
        .select("student_id, category, club_name")
        .in("student_id", studentIds),
      adminClient.from("report_cards").select("student_id").in("student_id", studentIds),
      adminClient
        .from("pre_registrations")
        .select("activated_student_id, created_at")
        .in("activated_student_id", studentIds),
      adminClient
        .from("parent_student_links")
        .select("student_id, parent_profile_id")
        .in("student_id", studentIds),
      getAttendanceMapWithClient(adminClient, studentIds),
    ]);

    const parentProfileIds = Array.from(
      new Set((parentLinks ?? []).map((link) => link.parent_profile_id).filter((value): value is string => Boolean(value))),
    );

    const [{ data: parentProfiles }, { data: supportThreads }] = await Promise.all([
      parentProfileIds.length
        ? adminClient.from("profiles").select("id, full_name, phone").in("id", parentProfileIds)
        : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null; phone: string | null }> }),
      parentProfileIds.length
        ? adminClient
            .from("support_threads")
            .select("parent_profile_id, subject, status, created_at")
            .in("parent_profile_id", parentProfileIds)
            .order("created_at", { ascending: false })
            .limit(Math.min(Math.max(parentProfileIds.length * 4, 20), 120))
        : Promise.resolve({
            data: [] as Array<{ parent_profile_id: string; subject: string | null; status: string; created_at: string }>,
          }),
    ]);

    const parentPhones = Array.from(
      new Set((parentProfiles ?? []).map((profile) => normalizePhoneDigits(profile.phone)).filter(Boolean)),
    );
    const { data: messageDispatches } = parentPhones.length
      ? await adminClient
          .from("message_dispatches")
          .select("recipient_phone, normalized_phone, status, created_at, event_key, campaign_id")
          .eq("organization_id", organizationContext.organizationId)
          .in("normalized_phone", parentPhones)
          .order("created_at", { ascending: false })
          .limit(Math.min(Math.max(parentPhones.length * 4, 20), 120))
      : {
          data: [] as Array<{
            recipient_phone: string | null;
            normalized_phone: string | null;
            status: string;
            created_at: string;
            event_key: string | null;
            campaign_id: string | null;
          }>,
        };

    const chargesByEnrollment = new Map<string, typeof charges>();
    (charges ?? []).forEach((charge) => {
      const bucket = chargesByEnrollment.get(charge.enrollment_id) ?? [];
      bucket.push(charge);
      chargesByEnrollment.set(charge.enrollment_id, bucket);
    });

    const balances = new Map<string, number>();
    (enrollments ?? []).forEach((enrollment) => {
      const studentCharges = chargesByEnrollment.get(enrollment.id) ?? [];
      const outstanding = studentCharges.reduce((sum, charge) => {
        const paid = Array.isArray(charge.payments)
          ? charge.payments.reduce((innerSum, payment) => innerSum + Number(payment.amount ?? 0), 0)
          : 0;
        return sum + Math.max(Number(charge.amount ?? 0) - paid, 0);
      }, 0);
      balances.set(enrollment.student_id, (balances.get(enrollment.student_id) ?? 0) + outstanding);
    });

    const enrollmentByStudent = new Map<string, NonNullable<typeof enrollments>[number]>();
    [...(enrollments ?? [])]
      .sort((left, right) => {
        if (left.status === "active" && right.status !== "active") return -1;
        if (left.status !== "active" && right.status === "active") return 1;
        return (right.starts_on ?? "").localeCompare(left.starts_on ?? "");
      })
      .forEach((enrollment) => {
        if (!enrollmentByStudent.has(enrollment.student_id)) {
          enrollmentByStudent.set(enrollment.student_id, enrollment);
        }
      });

    const detailByStudent = new Map((detailProfiles ?? []).map((item) => [item.student_id, item] as const));
    const reportCardStudentIds = new Set((reportCards ?? []).map((item) => item.student_id));
    const preRegistrationSourceMap = new Map<string, string>();
    for (const preregistration of activatedPreRegistrations ?? []) {
      if (preregistration.activated_student_id) {
        preRegistrationSourceMap.set(
          preregistration.activated_student_id,
          preregistration.created_at ? `On kayit · ${formatDateLabel(preregistration.created_at)}` : "On kayit aktivasyonu",
        );
      }
    }

    const parentLinkMap = new Map<string, string>();
    for (const link of parentLinks ?? []) {
      if (!parentLinkMap.has(link.student_id)) {
        parentLinkMap.set(link.student_id, link.parent_profile_id);
      }
    }

    const parentProfileMap = new Map((parentProfiles ?? []).map((profile) => [profile.id, profile] as const));
    const supportThreadMap = new Map<string, { status: string; createdAt: string; subject: string | null }>();
    for (const thread of supportThreads ?? []) {
      if (!supportThreadMap.has(thread.parent_profile_id)) {
        supportThreadMap.set(thread.parent_profile_id, {
          status: thread.status,
          createdAt: thread.created_at,
          subject: thread.subject ?? null,
        });
      }
    }

    const messageDispatchMap = new Map<
      string,
      { status: string; createdAt: string; eventKey: string | null; campaignId: string | null }
    >();
    for (const dispatch of messageDispatches ?? []) {
      const normalizedPhone = normalizePhoneDigits(dispatch.normalized_phone ?? dispatch.recipient_phone);
      if (!normalizedPhone || messageDispatchMap.has(normalizedPhone)) {
        continue;
      }
      messageDispatchMap.set(normalizedPhone, {
        status: dispatch.status,
        createdAt: dispatch.created_at,
        eventKey: dispatch.event_key ?? null,
        campaignId: dispatch.campaign_id ?? null,
      });
    }

    return students.map((student) => {
      const enrollment = (enrollments ?? []).find((item) => item.id === enrollmentByStudent.get(student.id)?.id);
      const balance = balances.get(student.id) ?? 0;
      const detail = detailByStudent.get(student.id);
      const studentCharges = enrollment?.id ? chargesByEnrollment.get(enrollment.id) ?? [] : [];
      const sortedStudentCharges = [...studentCharges].sort((left, right) =>
        String(right.billing_period ?? right.due_date ?? right.created_at ?? "").localeCompare(
          String(left.billing_period ?? left.due_date ?? left.created_at ?? ""),
        ),
      );
      const latestCharge = sortedStudentCharges[0];
      const programName = getRelatedTitle(enrollment?.programs) ?? "Program baglanmadi";
      const sessionSeriesLabel = enrollment?.session_series_id
        ? formatSessionSeriesLabel({
            title: getRelatedTitle(enrollment.session_series) ?? "Grup",
            weekdays: getRelatedWeekdays(enrollment.session_series),
            startTime: getRelatedStartTime(enrollment.session_series),
          })
        : null;
      const programAgeBand = getRelatedAgeBand(enrollment?.programs);
      const category = detail?.category || programAgeBand || programName;
      const studentPaymentStatuses = studentCharges.map((charge) =>
        resolveChargePaymentStatus({
          amount: charge.amount,
          payments: charge.payments,
          enrollmentStartsOn: enrollment?.starts_on ?? null,
          chargeCreatedAt: charge.created_at,
          dueDate: charge.due_date,
        }),
      );
      const paymentStatus =
        studentPaymentStatuses.length > 0 ? resolveAggregatePaymentLifecycleStatus(studentPaymentStatuses) : "completed";
      const parentProfileId = parentLinkMap.get(student.id);
      const parentProfile = parentProfileId ? parentProfileMap.get(parentProfileId) : null;
      const latestThread = parentProfileId ? supportThreadMap.get(parentProfileId) : null;
      const latestDispatch = parentProfile?.phone ? messageDispatchMap.get(normalizePhoneDigits(parentProfile.phone)) : null;
      const latestChargeStatus = latestCharge
        ? getPaymentLifecycleLabel(
            resolveChargePaymentStatus({
              amount: latestCharge.amount,
              payments: latestCharge.payments,
              enrollmentStartsOn: enrollment?.starts_on ?? null,
              chargeCreatedAt: latestCharge.created_at,
              dueDate: latestCharge.due_date,
            }),
          )
        : null;
      const latestChargeAnchor =
        latestCharge?.billing_period ?? latestCharge?.due_date ?? latestCharge?.created_at ?? null;

      return {
        id: student.id,
        enrollmentId: enrollment?.id,
        initials: getStudentInitials(student.full_name),
        name: student.full_name,
        photoUrl: null,
        club: detail?.club_name || organizationContext.organization?.name || "Kulup baglanmadi",
        category,
        gender: student.gender === "female" ? "Kadin" : student.gender === "male" ? "Erkek" : "Belirtilmedi",
        birthDate: formatBirthDate(student.birth_date),
        program: programName,
        coach: "Canli atama sonrasi",
        attendance: attendance.get(student.id) ?? "--",
        balance: formatTry(balance),
        status: getStudentLifecycleStatus(balance, student.active ?? true),
        paymentStatus,
        registrationSourceLabel: preRegistrationSourceMap.get(student.id) ?? "Panel kaydi",
        parentName: parentProfile?.full_name ?? null,
        parentWhatsapp: parentProfile?.phone ?? null,
        lastChargeLabel: latestChargeAnchor
          ? `${formatDateLabel(latestChargeAnchor)} · ${formatTry(Number(latestCharge?.amount ?? 0))}`
          : null,
        lastChargeStatusLabel: latestChargeStatus,
        lastCommunicationLabel: latestThread
          ? `${formatDateLabel(latestThread.createdAt)} · ${latestThread.status === "open" ? "Destek acik" : "Destek cozuldu"}`
          : null,
        lastWhatsAppStatusLabel: latestDispatch
          ? `${formatDateLabel(latestDispatch.createdAt)} · ${formatMessageDeliveryLabel(latestDispatch.status)}`
          : null,
        programId: enrollment?.program_id,
        sessionSeriesId: enrollment?.session_series_id ?? null,
        sessionSeriesLabel,
        enrollmentStartsOn: enrollment?.starts_on ?? null,
        allocatedLessons: enrollment?.id ? allocationSummaryMap.get(enrollment.id)?.allocatedLessons ?? 0 : 0,
        consumedLessons: enrollment?.id ? allocationSummaryMap.get(enrollment.id)?.consumedLessons ?? 0 : 0,
        remainingLessons: enrollment?.id ? allocationSummaryMap.get(enrollment.id)?.remainingLessons ?? 0 : 0,
        nextAllocatedSessionAt: enrollment?.id ? allocationSummaryMap.get(enrollment.id)?.nextAllocatedSessionAt ?? null : null,
        lastAllocatedSessionAt: enrollment?.id ? allocationSummaryMap.get(enrollment.id)?.lastAllocatedSessionAt ?? null : null,
        detailSaved: Boolean(reportCardStudentIds.has(student.id) || detail),
      } satisfies ManagerStudentListRow;
    });
  });
}

export async function getManagerStudentSheet(studentId: string) {
  if (!isLiveEnabled()) {
    return null as ManagerStudentSheet | null;
  }

  const auth = await getCurrentAuthContext();
  if (!auth?.userId || (auth.role !== "manager" && auth.role !== "admin")) {
    return null as ManagerStudentSheet | null;
  }

  const organizationContext = await getOrCreateOrganizationContext(auth.userId);
  const adminClient = createSupabaseAdminClient();
  if (!adminClient || !organizationContext.organizationId || !organizationContext.organization) {
    return null as ManagerStudentSheet | null;
  }

  return withDashboardCache(`manager-student-sheet:${auth.userId}:${organizationContext.organizationId}:${studentId}`, async () => {
    const { data: student } = await adminClient
      .from("students")
      .select("id, full_name, active")
      .eq("organization_id", organizationContext.organizationId)
      .eq("id", studentId)
      .maybeSingle();

    if (!student?.id) {
      return null as ManagerStudentSheet | null;
    }

    const { data: enrollments } = await adminClient
      .from("enrollments")
      .select(
        "id, student_id, status, program_id, session_series_id, starts_on, programs(title, age_band), session_series(title, start_time, weekdays)",
      )
      .eq("student_id", studentId);

    const enrollment =
      [...(enrollments ?? [])].sort((left, right) => {
        if (left.status === "active" && right.status !== "active") return -1;
        if (left.status !== "active" && right.status === "active") return 1;
        return (right.starts_on ?? "").localeCompare(left.starts_on ?? "");
      })[0] ?? null;

    const enrollmentIds = enrollment?.id ? [enrollment.id] : [];
    const [
      allocationSummaryMap,
      { data: charges },
      { data: detailProfiles },
      { data: reportCards },
      { data: activatedPreRegistrations },
      { data: parentLinks },
    ] = await Promise.all([
      getAllocationSummaryMap(adminClient, enrollmentIds),
      adminClient
        .from("charges")
        .select("id, enrollment_id, amount, due_date, created_at, billing_period, payments(amount, paid_at, created_at, note)")
        .in("enrollment_id", enrollmentIds.length ? enrollmentIds : ["00000000-0000-0000-0000-000000000000"]),
      adminClient
        .from("student_detail_profiles")
        .select(
          "id, student_id, category, club_name, technical_score, discipline_score, participation_score, strengths, improvement_areas, coach_notes",
        )
        .eq("student_id", studentId),
      adminClient
        .from("report_cards")
        .select("id, student_id, summary, generated_at, payload")
        .eq("student_id", studentId),
      adminClient
        .from("pre_registrations")
        .select("id, activated_student_id, created_at")
        .eq("activated_student_id", studentId),
      adminClient
        .from("parent_student_links")
        .select("student_id, parent_profile_id")
        .eq("student_id", studentId),
    ]);

    const parentProfileIds = Array.from(
      new Set((parentLinks ?? []).map((link) => link.parent_profile_id).filter((value): value is string => Boolean(value))),
    );
    const [{ data: parentProfiles }, { data: supportThreads }] = await Promise.all([
      parentProfileIds.length
        ? adminClient.from("profiles").select("id, full_name, phone").in("id", parentProfileIds)
        : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null; phone: string | null }> }),
      parentProfileIds.length
        ? adminClient
            .from("support_threads")
            .select("parent_profile_id, subject, status, created_at")
            .in("parent_profile_id", parentProfileIds)
            .order("created_at", { ascending: false })
            .limit(20)
        : Promise.resolve({
            data: [] as Array<{ parent_profile_id: string; subject: string | null; status: string; created_at: string }>,
          }),
    ]);

    const parentPhones = Array.from(
      new Set((parentProfiles ?? []).map((profile) => normalizePhoneDigits(profile.phone)).filter(Boolean)),
    );
    const { data: messageDispatches } = parentPhones.length
      ? await adminClient
          .from("message_dispatches")
          .select("recipient_phone, normalized_phone, status, created_at, event_key, campaign_id")
          .eq("organization_id", organizationContext.organizationId)
          .in("normalized_phone", parentPhones)
          .order("created_at", { ascending: false })
          .limit(20)
      : {
          data: [] as Array<{
            recipient_phone: string | null;
            normalized_phone: string | null;
            status: string;
            created_at: string;
            event_key: string | null;
            campaign_id: string | null;
          }>,
        };

    const campaignIds = Array.from(
      new Set((messageDispatches ?? []).map((dispatch) => dispatch.campaign_id).filter((value): value is string => Boolean(value))),
    );
    const { data: campaigns } = campaignIds.length
      ? await adminClient.from("message_campaigns").select("id, title").in("id", campaignIds)
      : { data: [] as Array<{ id: string; title: string | null }> };

    const detail = (detailProfiles ?? [])[0] ?? null;
    const reportCard = (reportCards ?? [])[0] ?? null;
    const studentCharges = charges ?? [];
    const sortedStudentCharges = [...studentCharges].sort((left, right) =>
      String(right.billing_period ?? right.due_date ?? right.created_at ?? "").localeCompare(
        String(left.billing_period ?? left.due_date ?? left.created_at ?? ""),
      ),
    );
    const latestCharge = sortedStudentCharges[0];
    const programName = getRelatedTitle(enrollment?.programs) ?? "Program baglanmadi";
    const programAgeBand = getRelatedAgeBand(enrollment?.programs);
    const category = detail?.category || programAgeBand || programName;
    const legacyDetail = detail
      ? {
          category: detail.category ?? category,
          clubName: detail.club_name ?? organizationContext.organization?.name ?? "Kulup baglanmadi",
          technicalScore: detail.technical_score,
          disciplineScore: detail.discipline_score,
          participationScore: detail.participation_score,
          strengths: detail.strengths ?? "",
          improvementAreas: detail.improvement_areas ?? "",
          coachNotes: detail.coach_notes ?? "",
        }
      : null;
    const reportCardRecord = reportCard
      ? buildStudentReportCard({
          id: reportCard.id,
          summary: reportCard.summary,
          generatedAt: reportCard.generated_at,
          payload: reportCard.payload,
          legacyDetail,
        })
      : null;

    const parentProfile = parentProfiles?.[0] ?? null;
    const latestThread = (supportThreads ?? [])[0] ?? null;
    const latestDispatch = parentProfile?.phone
      ? (messageDispatches ?? []).find(
          (dispatch) =>
            normalizePhoneDigits(dispatch.normalized_phone ?? dispatch.recipient_phone) ===
            normalizePhoneDigits(parentProfile.phone),
        ) ?? null
      : null;
    const campaignMap = new Map((campaigns ?? []).map((campaign) => [campaign.id, campaign.title ?? "WhatsApp kampanyasi"]));
    const latestPaymentNote =
      [...studentCharges]
        .flatMap((charge) =>
          Array.isArray(charge.payments)
            ? charge.payments.map((payment) => ({
                note: typeof payment.note === "string" ? payment.note.trim() : "",
                paidAt: payment.paid_at ?? payment.created_at ?? null,
              }))
            : [],
        )
        .filter((payment) => payment.note.length > 0)
        .sort((left, right) => String(right.paidAt ?? "").localeCompare(String(left.paidAt ?? "")))[0] ?? null;
    const latestChargeStatus = latestCharge
      ? getPaymentLifecycleLabel(
          resolveChargePaymentStatus({
            amount: latestCharge.amount,
            payments: latestCharge.payments,
            enrollmentStartsOn: enrollment?.starts_on ?? null,
            chargeCreatedAt: latestCharge.created_at,
            dueDate: latestCharge.due_date,
          }),
        )
      : null;
    const latestChargeAnchor =
      latestCharge?.billing_period ?? latestCharge?.due_date ?? latestCharge?.created_at ?? null;
    const preRegistration = (activatedPreRegistrations ?? [])[0] ?? null;
    const crmTimeline = [
      preRegistration
        ? {
            id: `source-${student.id}`,
            title: "Kayit kaynagi",
            detail: preRegistration.created_at ? `On kayit · ${formatDateLabel(preRegistration.created_at)}` : "On kayit aktivasyonu",
            createdAt: preRegistration.created_at ? formatDateLabel(preRegistration.created_at) : "Baslangic",
            tone: "sky",
          }
        : {
            id: `source-${student.id}`,
            title: "Kayit kaynagi",
            detail: "Panelden manuel kayit acildi",
            createdAt: enrollment?.starts_on ? formatDateLabel(enrollment.starts_on) : "Kayit",
            tone: "slate",
          },
      latestChargeAnchor
        ? {
            id: `charge-${student.id}`,
            title: "Son tahakkuk",
            detail: `${formatTry(Number(latestCharge?.amount ?? 0))} · ${latestChargeStatus ?? "Durum yok"}`,
            createdAt: formatDateLabel(latestChargeAnchor),
            tone:
              latestChargeStatus === "Odeme Yapilmadi"
                ? "rose"
                : latestChargeStatus === "Odeme Bekleniyor"
                  ? "amber"
                  : "emerald",
          }
        : null,
      latestThread
        ? {
            id: `support-${student.id}`,
            title: "Son destek iletisimi",
            detail: latestThread.status === "open" ? "Destek kaydi acik" : "Destek kaydi cozuldu",
            createdAt: formatDateLabel(latestThread.created_at),
            tone: latestThread.status === "open" ? "amber" : "emerald",
          }
        : null,
      latestDispatch
        ? {
            id: `dispatch-${student.id}`,
            title: "Son WhatsApp",
            detail: formatMessageDeliveryLabel(latestDispatch.status),
            createdAt: formatDateLabel(latestDispatch.created_at),
            tone: latestDispatch.status === "failed" ? "rose" : "sky",
          }
        : null,
      enrollment?.id && allocationSummaryMap.get(enrollment.id)?.nextAllocatedSessionAt
        ? {
            id: `lesson-${student.id}`,
            title: "Siradaki seans",
            detail:
              enrollment?.session_series_id
                ? formatSessionSeriesLabel({
                    title: getRelatedTitle(enrollment.session_series) ?? "Grup",
                    weekdays: getRelatedWeekdays(enrollment.session_series),
                    startTime: getRelatedStartTime(enrollment.session_series),
                  })
                : programName,
            createdAt: formatDateLabel(allocationSummaryMap.get(enrollment.id)?.nextAllocatedSessionAt ?? ""),
            tone: "emerald",
          }
        : null,
    ].filter(Boolean) as StudentCrmTimelineItem[];

    return {
      id: student.id,
      chargeOptions: studentCharges
        .map((charge) => {
          const chargePaymentStatus = resolveChargePaymentStatus({
            amount: charge.amount,
            payments: charge.payments,
            enrollmentStartsOn: enrollment?.starts_on ?? null,
            chargeCreatedAt: charge.created_at,
            dueDate: charge.due_date,
          });

          return {
            id: charge.id,
            label: `${student.full_name} / ${programName}`,
            amount: formatTry(Number(charge.amount ?? 0)),
            status: getPaymentLifecycleLabel(chargePaymentStatus),
            paymentStatus: chargePaymentStatus,
          };
        })
        .filter((charge) => charge.paymentStatus !== "completed"),
      reportCard: reportCardRecord,
      detailEntries: reportCardRecord?.entries ?? (legacyDetail ? getFallbackEntriesFromLegacy(legacyDetail) : []),
      crmTimeline,
      lastSupportSubject: latestThread?.subject ?? null,
      lastCampaignLabel: latestDispatch
        ? latestDispatch.campaign_id
          ? campaignMap.get(latestDispatch.campaign_id) ?? "WhatsApp kampanyasi"
          : formatMessageEventLabel(latestDispatch.event_key)
        : null,
      lastPaymentNote: latestPaymentNote?.note ?? null,
      lastChargeLabel: latestChargeAnchor
        ? `${formatDateLabel(latestChargeAnchor)} · ${formatTry(Number(latestCharge?.amount ?? 0))}`
        : null,
      lastChargeStatusLabel: latestChargeStatus,
      lastCommunicationLabel: latestThread
        ? `${formatDateLabel(latestThread.created_at)} · ${latestThread.status === "open" ? "Destek acik" : "Destek cozuldu"}`
        : null,
      lastWhatsAppStatusLabel: latestDispatch
        ? `${formatDateLabel(latestDispatch.created_at)} · ${formatMessageDeliveryLabel(latestDispatch.status)}`
        : null,
      detailSaved: Boolean(reportCardRecord || detail),
    } satisfies ManagerStudentSheet;
  });
}

export async function getManagerStudents() {
  if (!isLiveEnabled()) {
    return [] as StudentRecord[];
  }

  const auth = await getCurrentAuthContext();

  if (!auth?.userId || (auth.role !== "manager" && auth.role !== "admin")) {
    return [] as StudentRecord[];
  }

  const organizationContext = await getOrCreateOrganizationContext(auth.userId);
  const adminClient = createSupabaseAdminClient();

  if (!adminClient || !organizationContext.organizationId || !organizationContext.organization) {
    return [] as StudentRecord[];
  }

  return withDashboardCache(`manager-students:${auth.userId}:${organizationContext.organizationId}`, async () => {
    const { data: students } = await adminClient
      .from("students")
      .select("id, full_name, birth_date, gender, active")
      .eq("organization_id", organizationContext.organizationId)
      .limit(20);

    if (!students?.length) {
      return [] as StudentRecord[];
    }

    const studentIds = students.map((student) => student.id);
    const { data: enrollments } = await adminClient
      .from("enrollments")
      .select(
        "id, student_id, status, program_id, session_series_id, starts_on, ends_on, programs(title, age_band), session_series(title, start_time, weekdays)",
      )
      .in("student_id", studentIds);

    const enrollmentIds = (enrollments ?? []).map((enrollment) => enrollment.id);
    const [
      allocationSummaryMap,
      { data: charges },
      { data: detailProfiles },
      { data: reportCards },
      { data: activatedPreRegistrations },
      { data: parentLinks },
      attendance,
    ] = await Promise.all([
      getAllocationSummaryMap(adminClient, enrollmentIds),
      adminClient
        .from("charges")
        .select("id, enrollment_id, amount, status, due_date, created_at, billing_period, payments(amount, paid_at, created_at, note)")
        .in("enrollment_id", enrollmentIds.length ? enrollmentIds : ["00000000-0000-0000-0000-000000000000"]),
      adminClient
        .from("student_detail_profiles")
        .select(
          "id, student_id, category, club_name, technical_score, discipline_score, participation_score, strengths, improvement_areas, coach_notes",
        )
        .in("student_id", studentIds),
      adminClient
        .from("report_cards")
        .select("id, student_id, summary, generated_at, payload")
        .in("student_id", studentIds),
      adminClient
        .from("pre_registrations")
        .select("id, activated_student_id, created_at")
        .in("activated_student_id", studentIds),
      adminClient
        .from("parent_student_links")
        .select("student_id, parent_profile_id")
        .in("student_id", studentIds),
      getAttendanceMapWithClient(adminClient, studentIds),
    ]);

    const parentProfileIds = Array.from(
      new Set((parentLinks ?? []).map((link) => link.parent_profile_id).filter((value): value is string => Boolean(value))),
    );

    const [{ data: parentProfiles }, { data: supportThreads }] = await Promise.all([
      parentProfileIds.length
        ? adminClient
            .from("profiles")
            .select("id, full_name, phone")
            .in("id", parentProfileIds)
        : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null; phone: string | null }> }),
      parentProfileIds.length
        ? adminClient
            .from("support_threads")
            .select("parent_profile_id, subject, status, created_at")
            .in("parent_profile_id", parentProfileIds)
            .order("created_at", { ascending: false })
            .limit(Math.min(Math.max(parentProfileIds.length * 8, 40), 200))
        : Promise.resolve({
            data: [] as Array<{ parent_profile_id: string; subject: string | null; status: string; created_at: string }>,
          }),
    ]);

    const parentPhones = Array.from(
      new Set((parentProfiles ?? []).map((profile) => normalizePhoneDigits(profile.phone)).filter(Boolean)),
    );
    const { data: messageDispatches } = parentPhones.length
      ? await adminClient
          .from("message_dispatches")
          .select("recipient_phone, normalized_phone, status, created_at, event_key, campaign_id")
          .eq("organization_id", organizationContext.organizationId)
          .in("normalized_phone", parentPhones)
          .order("created_at", { ascending: false })
          .limit(Math.min(Math.max(parentPhones.length * 8, 40), 200))
      : {
          data: [] as Array<{
            recipient_phone: string | null;
            normalized_phone: string | null;
            status: string;
            created_at: string;
            event_key: string | null;
            campaign_id: string | null;
          }>,
        };

    const campaignIds = Array.from(
      new Set((messageDispatches ?? []).map((dispatch) => dispatch.campaign_id).filter((value): value is string => Boolean(value))),
    );
    const { data: campaigns } = campaignIds.length
      ? await adminClient.from("message_campaigns").select("id, title").in("id", campaignIds)
      : { data: [] as Array<{ id: string; title: string | null }> };

    const preRegistrationIds = (activatedPreRegistrations ?? []).map((item) => item.id);
    const { data: preRegistrationAssets } = await adminClient
      .from("pre_registration_assets")
      .select("pre_registration_id, file_type, storage_path, public_url")
      .in(
        "pre_registration_id",
        preRegistrationIds.length ? preRegistrationIds : ["00000000-0000-0000-0000-000000000000"],
      )
      .eq("file_type", "student_photo");

    const signedStudentPhotoMap = new Map<string, string>();
    const studentPhotoPaths = (preRegistrationAssets ?? [])
      .filter((asset) => typeof asset.storage_path === "string" && asset.storage_path.length > 0)
      .map((asset) => asset.storage_path as string);

    if (studentPhotoPaths.length) {
      const signedUrlsResult = await adminClient.storage
        .from("pre-registration-assets")
        .createSignedUrls(studentPhotoPaths, 60 * 15);

      for (const item of signedUrlsResult.data ?? []) {
        if (item.path && item.signedUrl) {
          signedStudentPhotoMap.set(item.path, item.signedUrl);
        }
      }
    }

    const chargesByEnrollment = new Map<string, typeof charges>();
    (charges ?? []).forEach((charge) => {
      const bucket = chargesByEnrollment.get(charge.enrollment_id) ?? [];
      bucket.push(charge);
      chargesByEnrollment.set(charge.enrollment_id, bucket);
    });

    const balances = new Map<string, number>();
    (enrollments ?? []).forEach((enrollment) => {
      const studentCharges = chargesByEnrollment.get(enrollment.id) ?? [];
      const outstanding = studentCharges.reduce((sum, charge) => {
        const paid = Array.isArray(charge.payments)
          ? charge.payments.reduce((innerSum, payment) => innerSum + Number(payment.amount ?? 0), 0)
          : 0;
        return sum + Math.max(Number(charge.amount ?? 0) - paid, 0);
      }, 0);
      balances.set(enrollment.student_id, (balances.get(enrollment.student_id) ?? 0) + outstanding);
    });

    const enrollmentByStudent = new Map<string, NonNullable<typeof enrollments>[number]>();
    [...(enrollments ?? [])]
      .sort((left, right) => {
        if (left.status === "active" && right.status !== "active") {
          return -1;
        }
        if (left.status !== "active" && right.status === "active") {
          return 1;
        }
        return (right.starts_on ?? "").localeCompare(left.starts_on ?? "");
      })
      .forEach((enrollment) => {
        if (!enrollmentByStudent.has(enrollment.student_id)) {
          enrollmentByStudent.set(enrollment.student_id, enrollment);
        }
      });

    const detailByStudent = new Map((detailProfiles ?? []).map((item) => [item.student_id, item] as const));
    const reportCardByStudent = new Map((reportCards ?? []).map((item) => [item.student_id, item] as const));
    const photoAssetByPreRegistration = new Map(
      (preRegistrationAssets ?? []).map((asset) => [asset.pre_registration_id, asset] as const),
    );

    const studentPhotoMap = new Map<string, string>();
    const preRegistrationSourceMap = new Map<string, string>();
    const preRegistrationSourceDateMap = new Map<string, string>();
    for (const preregistration of activatedPreRegistrations ?? []) {
      const photoAsset = photoAssetByPreRegistration.get(preregistration.id);
      const resolvedUrl =
        (typeof photoAsset?.storage_path === "string" && signedStudentPhotoMap.get(photoAsset.storage_path)) ||
        photoAsset?.public_url ||
        "";

      if (preregistration.activated_student_id && resolvedUrl) {
        studentPhotoMap.set(preregistration.activated_student_id, resolvedUrl);
      }

      if (preregistration.activated_student_id) {
        preRegistrationSourceMap.set(
          preregistration.activated_student_id,
          preregistration.created_at ? `On kayit · ${formatDateLabel(preregistration.created_at)}` : "On kayit aktivasyonu",
        );
        if (preregistration.created_at) {
          preRegistrationSourceDateMap.set(preregistration.activated_student_id, preregistration.created_at);
        }
      }
    }

    const parentLinkMap = new Map<string, string>();
    for (const link of parentLinks ?? []) {
      if (!parentLinkMap.has(link.student_id)) {
        parentLinkMap.set(link.student_id, link.parent_profile_id);
      }
    }

    const parentProfileMap = new Map((parentProfiles ?? []).map((profile) => [profile.id, profile] as const));
    const supportThreadMap = new Map<string, { status: string; createdAt: string; subject: string | null }>();
    for (const thread of supportThreads ?? []) {
      if (!supportThreadMap.has(thread.parent_profile_id)) {
        supportThreadMap.set(thread.parent_profile_id, {
          status: thread.status,
          createdAt: thread.created_at,
          subject: thread.subject ?? null,
        });
      }
    }

    const campaignMap = new Map((campaigns ?? []).map((campaign) => [campaign.id, campaign.title ?? "WhatsApp kampanyasi"]));
    const messageDispatchMap = new Map<string, { status: string; createdAt: string; eventKey: string | null; campaignId: string | null }>();
    for (const dispatch of messageDispatches ?? []) {
      const normalizedPhone = normalizePhoneDigits(dispatch.normalized_phone ?? dispatch.recipient_phone);
      if (!normalizedPhone || messageDispatchMap.has(normalizedPhone)) {
        continue;
      }
      messageDispatchMap.set(normalizedPhone, {
        status: dispatch.status,
        createdAt: dispatch.created_at,
        eventKey: dispatch.event_key ?? null,
        campaignId: dispatch.campaign_id ?? null,
      });
    }

    return students.map((student) => {
    const enrollment = (enrollments ?? [])
      .find((item) => item.id === enrollmentByStudent.get(student.id)?.id);
    const balance = balances.get(student.id) ?? 0;
    const detail = detailByStudent.get(student.id);
    const reportCard = reportCardByStudent.get(student.id);
    const studentCharges = enrollment?.id ? chargesByEnrollment.get(enrollment.id) ?? [] : [];
    const sortedStudentCharges = [...studentCharges].sort((left, right) =>
      String(right.billing_period ?? right.due_date ?? right.created_at ?? "").localeCompare(
        String(left.billing_period ?? left.due_date ?? left.created_at ?? ""),
      ),
    );
    const latestCharge = sortedStudentCharges[0];
    const programName = getRelatedTitle(enrollment?.programs) ?? "Program baglanmadi";
    const sessionSeriesLabel = enrollment?.session_series_id
      ? formatSessionSeriesLabel({
          title: getRelatedTitle(enrollment.session_series) ?? "Grup",
          weekdays: getRelatedWeekdays(enrollment.session_series),
          startTime: getRelatedStartTime(enrollment.session_series),
        })
      : null;
    const programAgeBand = getRelatedAgeBand(enrollment?.programs);
    const category = detail?.category || programAgeBand || programName;
    const legacyDetail = detail
      ? {
          category: detail.category ?? category,
          clubName: detail.club_name ?? organizationContext.organization?.name ?? "Kulup baglanmadi",
          technicalScore: detail.technical_score,
          disciplineScore: detail.discipline_score,
          participationScore: detail.participation_score,
          strengths: detail.strengths ?? "",
          improvementAreas: detail.improvement_areas ?? "",
          coachNotes: detail.coach_notes ?? "",
        }
      : null;
    const reportCardRecord = reportCard
      ? buildStudentReportCard({
          id: reportCard.id,
          summary: reportCard.summary,
          generatedAt: reportCard.generated_at,
          payload: reportCard.payload,
          legacyDetail,
        })
      : null;
    const studentPaymentStatuses = studentCharges.map((charge) =>
      resolveChargePaymentStatus({
        amount: charge.amount,
        payments: charge.payments,
        enrollmentStartsOn: enrollment?.starts_on ?? null,
        chargeCreatedAt: charge.created_at,
        dueDate: charge.due_date,
      }),
    );
    const paymentStatus =
      studentPaymentStatuses.length > 0
        ? resolveAggregatePaymentLifecycleStatus(studentPaymentStatuses)
        : "completed";
    const parentProfileId = parentLinkMap.get(student.id);
    const parentProfile = parentProfileId ? parentProfileMap.get(parentProfileId) : null;
    const latestThread = parentProfileId ? supportThreadMap.get(parentProfileId) : null;
    const latestDispatch = parentProfile?.phone
      ? messageDispatchMap.get(normalizePhoneDigits(parentProfile.phone))
      : null;
    const latestPaymentNote =
      [...studentCharges]
        .flatMap((charge) =>
          Array.isArray(charge.payments)
            ? charge.payments.map((payment) => ({
                note: typeof payment.note === "string" ? payment.note.trim() : "",
                paidAt: payment.paid_at ?? payment.created_at ?? null,
              }))
            : [],
        )
        .filter((payment) => payment.note.length > 0)
        .sort((left, right) => String(right.paidAt ?? "").localeCompare(String(left.paidAt ?? "")))[0] ?? null;
    const latestChargeStatus = latestCharge
      ? getPaymentLifecycleLabel(
          resolveChargePaymentStatus({
            amount: latestCharge.amount,
            payments: latestCharge.payments,
            enrollmentStartsOn: enrollment?.starts_on ?? null,
            chargeCreatedAt: latestCharge.created_at,
            dueDate: latestCharge.due_date,
          }),
        )
      : null;
    const latestChargeAnchor =
      latestCharge?.billing_period ?? latestCharge?.due_date ?? latestCharge?.created_at ?? null;
    const preRegistrationSourceDate = preRegistrationSourceDateMap.get(student.id) ?? null;
    const crmTimeline = [
      preRegistrationSourceMap.get(student.id)
        ? {
            id: `source-${student.id}`,
            title: "Kayit kaynagi",
            detail: preRegistrationSourceMap.get(student.id) ?? "On kayit aktivasyonu",
            createdAt: preRegistrationSourceDate ? formatDateLabel(preRegistrationSourceDate) : "Baslangic",
            tone: "sky",
          }
        : {
            id: `source-${student.id}`,
            title: "Kayit kaynagi",
            detail: "Panelden manuel kayit acildi",
            createdAt: enrollment?.starts_on ? formatDateLabel(enrollment.starts_on) : "Kayit",
            tone: "slate",
          },
      latestChargeAnchor
        ? {
            id: `charge-${student.id}`,
            title: "Son tahakkuk",
            detail: `${formatTry(Number(latestCharge?.amount ?? 0))} · ${latestChargeStatus ?? "Durum yok"}`,
            createdAt: formatDateLabel(latestChargeAnchor),
            tone:
              latestChargeStatus === "Odeme Yapilmadi"
                ? "rose"
                : latestChargeStatus === "Odeme Bekleniyor"
                  ? "amber"
                  : "emerald",
          }
        : null,
      latestThread
        ? {
            id: `support-${student.id}`,
            title: "Son destek iletisimi",
            detail: latestThread.status === "open" ? "Destek kaydi acik" : "Destek kaydi cozuldu",
            createdAt: formatDateLabel(latestThread.createdAt),
            tone: latestThread.status === "open" ? "amber" : "emerald",
          }
        : null,
      latestDispatch
        ? {
            id: `dispatch-${student.id}`,
            title: "Son WhatsApp",
            detail: formatMessageDeliveryLabel(latestDispatch.status),
            createdAt: formatDateLabel(latestDispatch.createdAt),
            tone: latestDispatch.status === "failed" ? "rose" : "sky",
          }
        : null,
      enrollment?.id && allocationSummaryMap.get(enrollment.id)?.nextAllocatedSessionAt
        ? {
            id: `lesson-${student.id}`,
            title: "Siradaki seans",
            detail: sessionSeriesLabel ?? programName,
            createdAt: formatDateLabel(allocationSummaryMap.get(enrollment.id)?.nextAllocatedSessionAt ?? ""),
            tone: "emerald",
          }
        : null,
    ].filter(Boolean) as StudentCrmTimelineItem[];

    return {
      id: student.id,
      enrollmentId: enrollment?.id,
      initials: getStudentInitials(student.full_name),
      name: student.full_name,
      photoUrl: studentPhotoMap.get(student.id) ?? null,
      club: detail?.club_name || organizationContext.organization?.name || "Kulup baglanmadi",
      category,
      gender:
        student.gender === "female" ? "Kadin" : student.gender === "male" ? "Erkek" : "Belirtilmedi",
      birthDate: formatBirthDate(student.birth_date),
      program: programName,
      coach: "Canli atama sonrasi",
      attendance: attendance.get(student.id) ?? "--",
      balance: formatTry(balance),
      status: getStudentLifecycleStatus(balance, student.active ?? true),
      paymentStatus,
      registrationSourceLabel: preRegistrationSourceMap.get(student.id) ?? "Panel kaydi",
      parentName: parentProfile?.full_name ?? null,
      parentWhatsapp: parentProfile?.phone ?? null,
      lastChargeLabel: latestChargeAnchor
        ? `${formatDateLabel(latestChargeAnchor)} · ${formatTry(Number(latestCharge?.amount ?? 0))}`
        : null,
      lastChargeStatusLabel: latestChargeStatus,
      lastCommunicationLabel: latestThread
        ? `${formatDateLabel(latestThread.createdAt)} · ${
            latestThread.status === "open" ? "Destek acik" : "Destek cozuldu"
          }`
        : null,
      lastSupportSubject: latestThread?.subject ?? null,
      lastWhatsAppStatusLabel: latestDispatch
        ? `${formatDateLabel(latestDispatch.createdAt)} · ${formatMessageDeliveryLabel(latestDispatch.status)}`
        : null,
      lastCampaignLabel: latestDispatch
        ? latestDispatch.campaignId
          ? campaignMap.get(latestDispatch.campaignId) ?? "WhatsApp kampanyasi"
          : formatMessageEventLabel(latestDispatch.eventKey)
        : null,
      lastPaymentNote: latestPaymentNote?.note ?? null,
      programId: enrollment?.program_id,
      sessionSeriesId: enrollment?.session_series_id ?? null,
      sessionSeriesLabel,
      enrollmentStartsOn: enrollment?.starts_on ?? null,
      allocatedLessons: enrollment?.id ? allocationSummaryMap.get(enrollment.id)?.allocatedLessons ?? 0 : 0,
      consumedLessons: enrollment?.id ? allocationSummaryMap.get(enrollment.id)?.consumedLessons ?? 0 : 0,
      remainingLessons: enrollment?.id ? allocationSummaryMap.get(enrollment.id)?.remainingLessons ?? 0 : 0,
      nextAllocatedSessionAt: enrollment?.id ? allocationSummaryMap.get(enrollment.id)?.nextAllocatedSessionAt ?? null : null,
      lastAllocatedSessionAt: enrollment?.id ? allocationSummaryMap.get(enrollment.id)?.lastAllocatedSessionAt ?? null : null,
      chargeOptions: studentCharges
        .map((charge) => {
          const chargePaymentStatus = resolveChargePaymentStatus({
            amount: charge.amount,
            payments: charge.payments,
            enrollmentStartsOn: enrollment?.starts_on ?? null,
            chargeCreatedAt: charge.created_at,
            dueDate: charge.due_date,
          });

          return {
            id: charge.id,
            label: `${student.full_name} / ${programName}`,
            amount: formatTry(Number(charge.amount ?? 0)),
            status: getPaymentLifecycleLabel(chargePaymentStatus),
            paymentStatus: chargePaymentStatus,
          };
        })
        .filter((charge) => charge.paymentStatus !== "completed")
        ,
      detailSaved: Boolean(reportCardRecord || detail),
      reportCard: reportCardRecord,
      detailEntries: reportCardRecord?.entries ?? (legacyDetail ? getFallbackEntriesFromLegacy(legacyDetail) : []),
      crmTimeline,
    };
  }) satisfies StudentRecord[];
  });
}

export async function getProgramsData() {
  if (!isLiveEnabled()) {
    return [] as ProgramRecord[];
  }

  const auth = await getCurrentAuthContext();
  const adminClient = createSupabaseAdminClient();

  if (!auth?.userId || !adminClient) {
    return [];
  }

  const context = await getOrCreateOrganizationContext(auth.userId);

  if (!context.organizationId) {
    return [];
  }

  return withDashboardCache(`programs-data:${auth.userId}:${context.organizationId}`, async () => {
    const { data } = await adminClient
      .from("programs")
      .select(
        "id, title, age_band, capacity, monthly_price, archived_at, status, notes, monthly_lesson_quota, program_type_id, season_id, category_id, branch_id, sports_branch_id, coach_profile_id, area_id, program_types(name), seasons(title), categories(name), branches(name), sports_branches(name), profiles(full_name), areas(name)",
      )
      .eq("organization_id", context.organizationId)
      .is("archived_at", null)
      .order("title");

    const programIds = (data ?? []).map((program) => program.id);
    const [{ data: enrollments }, { data: sessionSeries }] = await Promise.all([
      adminClient
        .from("enrollments")
        .select("program_id")
        .eq("status", "active")
        .in("program_id", programIds.length ? programIds : ["00000000-0000-0000-0000-000000000000"]),
      adminClient
        .from("session_series")
        .select("program_id")
        .in("program_id", programIds.length ? programIds : ["00000000-0000-0000-0000-000000000000"])
        .in("status", ["active", "paused"]),
    ]);

    const enrollmentCounts = new Map<string, number>();
    (enrollments ?? []).forEach((enrollment) => {
      enrollmentCounts.set(enrollment.program_id, (enrollmentCounts.get(enrollment.program_id) ?? 0) + 1);
    });
    const sessionSeriesCounts = new Map<string, number>();
    (sessionSeries ?? []).forEach((series) => {
      sessionSeriesCounts.set(series.program_id, (sessionSeriesCounts.get(series.program_id) ?? 0) + 1);
    });

    return (data ?? []).map((program) => {
      const enrolledCount = enrollmentCounts.get(program.id) ?? 0;

      return {
        id: program.id,
        title: program.title,
        detail: [
          getRelatedName(program.program_types),
          getRelatedTitle(program.seasons),
          getRelatedName(program.branches),
          `Kontenjan ${Number(program.capacity ?? 0)}`,
        ]
          .filter(Boolean)
          .join(" · "),
        ageBand: program.age_band ?? "Tum grup",
        capacity: Number(program.capacity ?? 0),
        monthlyPrice: Number(program.monthly_price ?? 0),
        programTypeId: program.program_type_id,
        programTypeName: getRelatedName(program.program_types) ?? undefined,
        seasonId: program.season_id,
        seasonTitle: getRelatedTitle(program.seasons) ?? undefined,
        categoryId: program.category_id,
        categoryName: getRelatedName(program.categories) ?? undefined,
        branchId: program.branch_id,
        branchName: getRelatedName(program.branches) ?? undefined,
        sportsBranchId: program.sports_branch_id,
        sportsBranchName: getRelatedName(program.sports_branches) ?? undefined,
        coachProfileId: program.coach_profile_id,
        coachName: getRelatedFullName(program.profiles) ?? "Atanacak",
        areaId: program.area_id,
        areaName: getRelatedName(program.areas) ?? "Alan belirtilmedi",
        notes: program.notes ?? "",
        enrolledCount,
        sessionSeriesCount: sessionSeriesCounts.get(program.id) ?? 0,
        monthlyLessonQuota: Number(program.monthly_lesson_quota ?? 8),
        status: "active",
      };
    }) satisfies ProgramRecord[];
  });
}

export async function getProgramOptions() {
  if (!isLiveEnabled()) {
    return [] as ProgramOption[];
  }

  const auth = await getCurrentAuthContext();
  const adminClient = createSupabaseAdminClient();

  if (!auth?.userId || !adminClient) {
    return [] as ProgramOption[];
  }

  const context = await getOrCreateOrganizationContext(auth.userId);
  if (!context.organizationId) {
    return [] as ProgramOption[];
  }

  const { data } = await adminClient
    .from("programs")
    .select("id, title, branches(name), categories(name), areas(name)")
    .eq("organization_id", context.organizationId)
    .is("archived_at", null)
    .order("title");

  return (data ?? []).map((program) => ({
    id: program.id,
    title: program.title,
    branchName: getRelatedName(program.branches) ?? undefined,
    categoryName: getRelatedName(program.categories) ?? undefined,
    areaName: getRelatedName(program.areas) ?? undefined,
  })) satisfies ProgramOption[];
}

export async function getSessionSeriesOptions() {
  if (!isLiveEnabled()) {
    return [] as SessionSeriesOption[];
  }

  const auth = await getCurrentAuthContext();
  const adminClient = createSupabaseAdminClient();

  if (!auth?.userId || !adminClient) {
    return [] as SessionSeriesOption[];
  }

  const context = await getOrCreateOrganizationContext(auth.userId);
  if (!context.organizationId) {
    return [] as SessionSeriesOption[];
  }

  return withDashboardCache(`session-series-options:${auth.userId}:${context.organizationId}`, async () => {
    const { data } = await adminClient
      .from("session_series")
      .select(
        "id, title, program_id, starts_on, ends_on, start_time, weekdays, status, programs!inner(title, organization_id)",
      )
      .eq("programs.organization_id", context.organizationId)
      .in("status", ["active", "paused"])
      .order("starts_on", { ascending: true });

    return (data ?? [])
      .filter((series) => series.program_id)
      .map((series) => ({
        id: series.id,
        programId: series.program_id,
        programTitle: getRelatedTitle(series.programs) ?? "Program",
        title: series.title,
        label: formatSessionSeriesLabel({
          title: series.title,
          weekdays: Array.isArray(series.weekdays) ? (series.weekdays as number[]) : [],
          startTime: series.start_time,
        }),
        startsOn: series.starts_on,
        endsOn: series.ends_on,
        status:
          series.status === "paused" || series.status === "cancelled" ? series.status : "active",
      })) satisfies SessionSeriesOption[];
  });
}

export async function getStudentOptions() {
  if (!isLiveEnabled()) {
    return [] as StudentOption[];
  }

  const auth = await getCurrentAuthContext();
  const adminClient = createSupabaseAdminClient();

  if (!auth?.userId || !adminClient) {
    return [] as StudentOption[];
  }

  const context = await getOrCreateOrganizationContext(auth.userId);
  if (!context.organizationId) {
    return [] as StudentOption[];
  }

  const [{ data: students }, { data: enrollments }] = await Promise.all([
    adminClient
      .from("students")
      .select("id, full_name")
      .eq("organization_id", context.organizationId)
      .eq("active", true)
      .order("full_name"),
    adminClient
      .from("enrollments")
      .select("student_id, session_series_id, programs(title)")
      .eq("status", "active"),
  ]);

  const sessionSeriesIds = Array.from(
    new Set((enrollments ?? []).map((row) => row.session_series_id).filter((value): value is string => Boolean(value))),
  );

  const { data: sessionSeries } = await adminClient
    .from("session_series")
    .select("id, title")
    .in("id", sessionSeriesIds.length ? sessionSeriesIds : ["00000000-0000-0000-0000-000000000000"]);

  return (students ?? []).map((student) => {
    const enrollment = (enrollments ?? []).find((row) => row.student_id === student.id);
    const series = (sessionSeries ?? []).find((row) => row.id === enrollment?.session_series_id);
    const programLabel = getRelatedTitle(enrollment?.programs) ?? undefined;

    return {
      id: student.id,
      label: student.full_name,
      programLabel,
      sessionSeriesLabel: series?.title ?? undefined,
    };
  }) satisfies StudentOption[];
}

export async function getCoachOptions() {
  if (!isLiveEnabled()) {
    return [] as CoachOption[];
  }

  const auth = await getCurrentAuthContext();
  const adminClient = createSupabaseAdminClient();

  if (!auth?.userId || !adminClient) {
    return [] as CoachOption[];
  }

  const context = await getOrCreateOrganizationContext(auth.userId);

  if (!context.organizationId) {
    return [] as CoachOption[];
  }

  const { data } = await adminClient
    .from("profiles")
    .select("id, full_name, user_roles(role)")
    .eq("organization_id", context.organizationId)
    .limit(100);

  return (data ?? [])
    .filter((profile) =>
      Array.isArray(profile.user_roles)
        ? profile.user_roles.some((role) => role.role === "coach")
        : false,
    )
    .map((profile) => ({
      id: profile.id,
      name: profile.full_name,
    })) satisfies CoachOption[];
}

export async function getProgramFormOptions(): Promise<ProgramFormOptions> {
  const auth = await getCurrentAuthContext();
  const adminClient = createSupabaseAdminClient();

  if (!auth?.userId || !adminClient) {
    return {
      seasons: [],
      branches: [],
      programTypes: [],
      categories: [],
      sportsBranches: [],
      areas: [],
      coaches: [],
    };
  }

  const context = await getOrCreateOrganizationContext(auth.userId);

  if (!context.organizationId) {
    return {
      seasons: [],
      branches: [],
      programTypes: [],
      categories: [],
      sportsBranches: [],
      areas: [],
      coaches: [],
    };
  }

  const [seasons, branches, programTypes, categories, sportsBranches, areas, coaches] = await Promise.all([
    adminClient.from("seasons").select("id, title").eq("organization_id", context.organizationId).order("starts_on", { ascending: false }),
    adminClient.from("branches").select("id, name").eq("organization_id", context.organizationId).is("archived_at", null).order("name"),
    adminClient.from("program_types").select("id, name, slug").eq("organization_id", context.organizationId).order("name"),
    adminClient.from("categories").select("id, name, slug").eq("organization_id", context.organizationId).order("name"),
    adminClient.from("sports_branches").select("id, name, slug").eq("organization_id", context.organizationId).order("name"),
    adminClient.from("areas").select("id, name, slug, branch_id").eq("organization_id", context.organizationId).order("name"),
    adminClient.from("profiles").select("id, full_name, user_roles(role)").eq("organization_id", context.organizationId).limit(100),
  ]);

  return {
    seasons: (seasons.data ?? []).map((season) => ({ id: season.id, label: season.title })),
    branches: (branches.data ?? []).map((branch) => ({ id: branch.id, label: branch.name })),
    programTypes: (programTypes.data ?? []) as ProgramType[],
    categories: (categories.data ?? []) as Category[],
    sportsBranches: (sportsBranches.data ?? []) as SportsBranch[],
    areas: (areas.data ?? []).map((area) => ({
      id: area.id,
      name: area.name,
      slug: "slug" in area ? area.slug ?? undefined : undefined,
      branchId: area.branch_id,
    })) satisfies Area[],
    coaches: (coaches.data ?? [])
      .filter((profile) =>
        Array.isArray(profile.user_roles) ? profile.user_roles.some((role) => role.role === "coach") : false,
      )
      .map((profile) => ({
        id: profile.id,
        name: profile.full_name,
      })) satisfies CoachOption[],
  };
}

export async function getProgramResourceAdminData(): Promise<ProgramResourceAdminData> {
  const auth = await getCurrentAuthContext();
  const adminClient = createSupabaseAdminClient();

  if (!auth?.userId || !adminClient) {
    return {
      branches: [],
      programTypes: [],
      categories: [],
      sportsBranches: [],
      areas: [],
    };
  }

  const context = await getOrCreateOrganizationContext(auth.userId);

  if (!context.organizationId) {
    return {
      branches: [],
      programTypes: [],
      categories: [],
      sportsBranches: [],
      areas: [],
    };
  }

  const [branches, programTypes, categories, sportsBranches, areas] = await Promise.all([
    adminClient.from("branches").select("id, name").eq("organization_id", context.organizationId).is("archived_at", null).order("name"),
    adminClient.from("program_types").select("id, name, slug").eq("organization_id", context.organizationId).order("name"),
    adminClient.from("categories").select("id, name, slug").eq("organization_id", context.organizationId).order("name"),
    adminClient.from("sports_branches").select("id, name, slug").eq("organization_id", context.organizationId).order("name"),
    adminClient.from("areas").select("id, name, slug, branch_id, branches(name)").eq("organization_id", context.organizationId).order("name"),
  ]);

  return {
    branches: (branches.data ?? []).map((branch) => ({ id: branch.id, label: branch.name })),
    programTypes: (programTypes.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
    })) satisfies ProgramType[],
    categories: (categories.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
    })) satisfies Category[],
    sportsBranches: (sportsBranches.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
    })) satisfies SportsBranch[],
    areas: (areas.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      branchId: item.branch_id,
      branchName: getRelatedName(item.branches) ?? undefined,
    })) satisfies Area[],
  };
}

export async function getSessionsData() {
  if (!isLiveEnabled()) {
    return [] as SessionRecord[];
  }

  const auth = await getCurrentAuthContext();
  const adminClient = createSupabaseAdminClient();

  if (!auth?.userId || !adminClient) {
    return [] as SessionRecord[];
  }

  const { role, userId } = auth ?? {};
  const context = await getOrCreateOrganizationContext(auth.userId);

  if (!context.organizationId) {
    return [] as SessionRecord[];
  }

  let sessions:
    | Array<{
        id: string;
        title: string;
        starts_at: string;
        ends_at: string;
        location: string | null;
        notes: string | null;
        program_id: string;
        coach_profile_id: string | null;
        area_id: string | null;
        session_series_id: string | null;
      }>
    | null = null;
  let allocationRows:
    | Array<{
        session_id: string;
        student_id: string;
        status: string;
      }>
    | null = null;

  if (role === "parent" && userId) {
    const { data: links } = await adminClient
      .from("parent_student_links")
      .select("student_id")
      .eq("parent_profile_id", userId);
    const studentIds = (links ?? []).map((link) => link.student_id);
    const { data: parentAllocations } = await adminClient
      .from("enrollment_session_allocations")
      .select("session_id, student_id, status")
      .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"])
      .neq("status", "cancelled");
    const sessionIds = Array.from(new Set((parentAllocations ?? []).map((allocation) => allocation.session_id)));

    const { data: sessionRows } = await adminClient
      .from("sessions")
      .select("id, title, starts_at, ends_at, location, notes, program_id, coach_profile_id, area_id, session_series_id")
      .is("cancelled_at", null)
      .in("id", sessionIds.length ? sessionIds : ["00000000-0000-0000-0000-000000000000"])
      .gte("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(200);

    sessions = sessionRows;
    allocationRows = parentAllocations;
  } else {
    const { data: programs } = await adminClient
      .from("programs")
      .select("id")
      .eq("organization_id", context.organizationId)
      .is("archived_at", null);
    const allowedProgramIds = (programs ?? []).map((program) => program.id);

    let query = adminClient
      .from("sessions")
      .select("id, title, starts_at, ends_at, location, notes, program_id, coach_profile_id, area_id, session_series_id")
      .is("cancelled_at", null)
      .in("program_id", allowedProgramIds.length ? allowedProgramIds : ["00000000-0000-0000-0000-000000000000"])
      .order("starts_at");

    if (role === "coach" && userId) {
      query = query.eq("coach_profile_id", userId);
    }

    sessions = await query.limit(200).then((result) => result.data);
    const sessionIds = Array.from(new Set((sessions ?? []).map((session) => session.id)));
    const { data: rows } = await adminClient
      .from("enrollment_session_allocations")
      .select("session_id, student_id, status")
      .in("session_id", sessionIds.length ? sessionIds : ["00000000-0000-0000-0000-000000000000"])
      .neq("status", "cancelled");
    allocationRows = rows;
  }

  if (!sessions?.length) {
    return [];
  }

  const programIds = Array.from(new Set(sessions.map((session) => session.program_id)));
  const coachIds = Array.from(new Set(sessions.map((session) => session.coach_profile_id).filter(Boolean)));
  const areaIds = Array.from(new Set(sessions.map((session) => session.area_id).filter(Boolean)));

  const [{ data: programs }, { data: coaches }, { data: areas }] = await Promise.all([
    adminClient
      .from("programs")
      .select("id, title, capacity, branches(name), sports_branches(name), areas(name)")
      .in("id", programIds),
    coachIds.length
      ? adminClient.from("profiles").select("id, full_name").in("id", coachIds as string[])
      : Promise.resolve({ data: [] as Array<{ id: string; full_name: string }> }),
    areaIds.length
      ? adminClient.from("areas").select("id, name").in("id", areaIds as string[])
      : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
  ]);

  const programMap = new Map((programs ?? []).map((program) => [program.id, program]));
  const coachMap = new Map((coaches ?? []).map((coach) => [coach.id, coach.full_name]));
  const areaMap = new Map((areas ?? []).map((area) => [area.id, area.name]));
  const allocationsBySession = new Map<string, Array<{ student_id: string; status: string }>>();

  (allocationRows ?? []).forEach((allocation) => {
    const current = allocationsBySession.get(allocation.session_id) ?? [];
    current.push({
      student_id: allocation.student_id,
      status: allocation.status,
    });
    allocationsBySession.set(allocation.session_id, current);
  });

  const studentIds = Array.from(
    new Set((allocationRows ?? []).map((allocation) => allocation.student_id).filter(Boolean)),
  );
  const { data: students } = await adminClient
    .from("students")
    .select("id, full_name")
    .in("id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]);
  const studentMap = new Map((students ?? []).map((student) => [student.id, student.full_name]));

  return sessions.map((session) => {
    const program = programMap.get(session.program_id);
    const sessionAllocations = allocationsBySession.get(session.id) ?? [];
    const studentCount = sessionAllocations.length;
    const capacity = Number(program?.capacity ?? 0);
    const studentNames = Array.from(
      new Set(
        sessionAllocations
          .map((allocation) => studentMap.get(allocation.student_id)?.trim())
          .filter((name): name is string => Boolean(name)),
      ),
    );

    return {
      id: session.id,
      title: session.title ?? program?.title ?? "Seans",
      slot: formatDateTimeRange(session.starts_at, session.ends_at),
      coach: session.coach_profile_id ? coachMap.get(session.coach_profile_id) ?? "Atanacak" : "Atanacak",
      roster: `${studentCount} / ${capacity || studentCount} sporcu`,
      location: session.location ?? areaMap.get(session.area_id ?? "") ?? "Alan belirtilmedi",
      studentNames,
      programTitle: program?.title ?? undefined,
      branchName: getRelatedName(program?.branches) ?? undefined,
      sportsBranchName: getRelatedName(program?.sports_branches) ?? undefined,
      areaName: areaMap.get(session.area_id ?? "") ?? getRelatedName(program?.areas) ?? undefined,
      studentCount,
      capacity,
      sessionSeriesId: session.session_series_id,
      programId: session.program_id,
      coachId: session.coach_profile_id,
      areaId: session.area_id,
      notes: session.notes ?? "",
      startsAt: session.starts_at,
      endsAt: session.ends_at,
      status: "active",
    };
  }) satisfies SessionRecord[];
}

async function getCoachSessionData() {
  if (!isLiveEnabled()) {
    return {
      sessions: [] as Array<{
        id: string;
        title: string;
        starts_at: string;
        ends_at: string | null;
        location: string | null;
      }>,
      allocations: [] as Array<{ session_id: string; student_id: string; status: string }>,
      attendanceRows: [] as Array<{
        session_id: string;
        student_id: string;
        status: string;
        note: string | null;
      }>,
      studentMap: new Map<string, string>(),
      attendanceHistoryCounts: new Map<string, number>(),
      closingNoteMap: new Map<string, { note: string; createdAt: string }>(),
    };
  }

  const auth = await getCurrentAuthContext();
  const adminClient = createSupabaseAdminClient();
  const context = auth?.userId ? await getOrCreateOrganizationContext(auth.userId) : null;

  if (!adminClient || !auth?.userId || !context?.organizationId) {
    return {
      sessions: [] as Array<{
        id: string;
        title: string;
        starts_at: string;
        ends_at: string | null;
        location: string | null;
      }>,
      allocations: [] as Array<{ session_id: string; student_id: string; status: string }>,
      attendanceRows: [] as Array<{
        session_id: string;
        student_id: string;
        status: string;
        note: string | null;
      }>,
      studentMap: new Map<string, string>(),
      attendanceHistoryCounts: new Map<string, number>(),
      closingNoteMap: new Map<string, { note: string; createdAt: string }>(),
    };
  }

  let sessionQuery = adminClient
    .from("sessions")
    .select("id, title, starts_at, ends_at, location, program_id, session_series_id")
    .is("cancelled_at", null)
    .order("starts_at");

  if (auth.role !== "admin") {
    sessionQuery = sessionQuery.eq("coach_profile_id", auth.userId);
  }

  const { data: sessions } = await sessionQuery;

  if (!sessions?.length) {
    return {
      sessions: [] as Array<{
        id: string;
        title: string;
        starts_at: string;
        ends_at: string | null;
        location: string | null;
      }>,
      allocations: [] as Array<{ session_id: string; student_id: string; status: string }>,
      attendanceRows: [] as Array<{
        session_id: string;
        student_id: string;
        status: string;
        note: string | null;
      }>,
      studentMap: new Map<string, string>(),
      attendanceHistoryCounts: new Map<string, number>(),
      closingNoteMap: new Map<string, { note: string; createdAt: string }>(),
    };
  }

  const sessionIds = sessions.map((session) => session.id);
  const [{ data: allocations }, { data: attendanceRows }, { data: closingAuditRows }] = await Promise.all([
    adminClient
      .from("enrollment_session_allocations")
      .select("session_id, student_id, status")
      .in("session_id", sessionIds)
      .neq("status", "cancelled"),
    adminClient
      .from("attendance_records")
      .select("session_id, student_id, status, note")
      .in("session_id", sessionIds),
    adminClient
      .from("audit_logs")
      .select("entity_id, payload, created_at")
      .eq("organization_id", context.organizationId)
      .eq("scope", "Yoklama")
      .eq("entity_type", "sessions")
      .in("entity_id", sessionIds)
      .order("created_at", { ascending: false }),
  ]);
  const studentIds = Array.from(new Set((allocations ?? []).map((item) => item.student_id)));
  const attendanceHistoryCounts = new Map<string, number>();
  (attendanceRows ?? []).forEach((row) => {
    attendanceHistoryCounts.set(row.student_id, (attendanceHistoryCounts.get(row.student_id) ?? 0) + 1);
  });
  const { data: students } = await adminClient
    .from("students")
    .select("id, full_name")
    .in("id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]);
  const studentMap = new Map((students ?? []).map((student) => [student.id, student.full_name]));
  const closingNoteMap = new Map<string, { note: string; createdAt: string }>();
  for (const row of closingAuditRows ?? []) {
    if (!row.entity_id || closingNoteMap.has(row.entity_id)) {
      continue;
    }
    const payload =
      row.payload && typeof row.payload === "object" ? (row.payload as Record<string, unknown>) : null;
    const note =
      payload && typeof payload.sessionClosingNote === "string" ? payload.sessionClosingNote.trim() : "";
    if (!note) {
      continue;
    }
    closingNoteMap.set(row.entity_id, {
      note,
      createdAt: row.created_at,
    });
  }

  return {
    sessions,
    allocations: allocations ?? [],
    attendanceRows: attendanceRows ?? [],
    studentMap,
    attendanceHistoryCounts,
    closingNoteMap,
  };
}

export async function getCoachSessionSummaries() {
  const { sessions, allocations, attendanceRows, studentMap, closingNoteMap } =
    await getCoachSessionData();

  if (!sessions.length) {
    return [] as CoachSessionSummary[];
  }

  return sessions.map((session) => {
    const sessionStudents = allocations.filter((allocation) => allocation.session_id === session.id);
    const sessionAttendanceRows = attendanceRows.filter((row) => row.session_id === session.id);
    const closingNote = closingNoteMap.get(session.id);

    return {
      sessionId: session.id,
      title: session.title,
      slot: formatDateTimeRange(session.starts_at, session.ends_at),
      location: session.location ?? "Alan belirtilmedi",
      roster: `${sessionStudents.length} sporcu`,
      dateLabel: formatDayLabel(session.starts_at),
      dayKey: formatDayKey(session.starts_at),
      dayShort: formatDayShort(session.starts_at),
      startTime: formatTimeValue(session.starts_at),
      endTime: formatTimeValue(session.ends_at),
      sessionClosingNote: closingNote?.note ?? null,
      sessionClosingUpdatedAt: closingNote?.createdAt ? formatDateLabel(closingNote.createdAt) : null,
      studentCount: sessionStudents.length,
      pendingNotesCount: sessionAttendanceRows.filter((row) => !(row.note ?? "").trim()).length,
      studentPreviewNames: sessionStudents
        .slice(0, 3)
        .map((allocation) => studentMap.get(allocation.student_id) ?? "Ogrenci"),
    };
  }) satisfies CoachSessionSummary[];
}

export async function getCoachSessionDetail(sessionId: string) {
  const { sessions, allocations, attendanceRows, studentMap, attendanceHistoryCounts, closingNoteMap } =
    await getCoachSessionData();

  const session = sessions.find((item) => item.id === sessionId);
  if (!session) {
    return null as CoachSessionDetail | null;
  }

  const sessionStudents = allocations.filter((allocation) => allocation.session_id === session.id);
  const closingNote = closingNoteMap.get(session.id);

  return {
    sessionId: session.id,
    title: session.title,
    slot: formatDateTimeRange(session.starts_at, session.ends_at),
    location: session.location ?? "Alan belirtilmedi",
    roster: `${sessionStudents.length} sporcu`,
    dateLabel: formatDayLabel(session.starts_at),
    dayKey: formatDayKey(session.starts_at),
    dayShort: formatDayShort(session.starts_at),
    startTime: formatTimeValue(session.starts_at),
    endTime: formatTimeValue(session.ends_at),
    sessionClosingNote: closingNote?.note ?? null,
    sessionClosingUpdatedAt: closingNote?.createdAt ? formatDateLabel(closingNote.createdAt) : null,
    students: sessionStudents.map((allocation): AttendanceStudent => {
      const attendance = attendanceRows.find(
        (row) => row.session_id === session.id && row.student_id === allocation.student_id,
      );

      return {
        studentId: allocation.student_id,
        name: studentMap.get(allocation.student_id) ?? "Ogrenci",
        status: attendance?.status ?? "present",
        note: attendance?.note ?? "",
        hasAttendanceRecord: Boolean(attendance),
        firstSessionFlag: (attendanceHistoryCounts.get(allocation.student_id) ?? 0) <= 1,
        allocationStatus: allocation.status === "consumed" ? "consumed" : "planned",
      };
    }),
  } satisfies CoachSessionDetail;
}

export async function getCoachSessionBoards() {
  const summaries = await getCoachSessionSummaries();
  const details = await Promise.all(summaries.map((session) => getCoachSessionDetail(session.sessionId)));
  return details.filter((session): session is CoachSessionDetail => Boolean(session));
}

export async function getChargeData() {
  if (!isLiveEnabled()) {
    return [] as ChargeRecord[];
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [] as ChargeRecord[];
  }

  const auth = await getCurrentAuthContext();
  const { role, userId } = auth ?? {};

  if (role === "parent" && userId) {
    const { data: links } = await supabase
      .from("parent_student_links")
      .select("student_id")
      .eq("parent_profile_id", userId);
    const studentIds = (links ?? []).map((link) => link.student_id);
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, student_id, starts_on")
      .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]);
    const enrollmentIds = (enrollments ?? []).map((enrollment) => enrollment.id);
    const { data: charges } = await supabase
      .from("charges")
      .select("id, enrollment_id, amount, due_date, status, created_at, billing_period, payments(amount, paid_at)")
      .in("enrollment_id", enrollmentIds.length ? enrollmentIds : ["00000000-0000-0000-0000-000000000000"])
      .order("due_date");

    return (charges ?? []).map((charge) => {
      const enrollment = (enrollments ?? []).find((item) => item.id === charge.enrollment_id);
      const totalPaid = Array.isArray(charge.payments)
        ? charge.payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0)
        : 0;
      const totalAmount = Number(charge.amount ?? 0);
      const remainingAmount = Math.max(totalAmount - totalPaid, 0);
      const paymentStatus = resolveChargePaymentStatus({
        amount: totalAmount,
        payments: charge.payments,
        enrollmentStartsOn: enrollment?.starts_on ?? null,
        chargeCreatedAt: charge.created_at,
        dueDate: charge.due_date,
      });

      return {
        id: charge.id,
        enrollmentId: charge.enrollment_id,
        studentId: enrollment?.student_id,
        item: "Program tahakkuku",
        dueDate: formatDateLabel(charge.due_date),
        amount: formatTry(totalAmount),
        status: getPaymentLifecycleLabel(paymentStatus),
        paymentStatus,
        billingPeriodLabel: charge.billing_period ? formatDateLabel(charge.billing_period) : undefined,
        totalAmountValue: totalAmount,
        paidAmountValue: totalPaid,
        remainingAmountValue: remainingAmount,
        paidAmount: formatTry(totalPaid),
        remainingAmount: formatTry(remainingAmount),
        lastPaymentLabel: Array.isArray(charge.payments) && charge.payments.length
          ? formatDateLabel(
              [...charge.payments]
                .sort((left, right) => String(right.paid_at ?? "").localeCompare(String(left.paid_at ?? "")))[0]?.paid_at ??
                null,
            )
          : null,
      };
    }) satisfies ChargeRecord[];
  }

  const { data: charges } = await supabase
    .from("charges")
    .select(
      "id, enrollment_id, amount, due_date, status, created_at, billing_period, payments(amount, paid_at), enrollments(student_id, starts_on, program_id, programs(title), students(full_name))",
    )
    .order("due_date")
    .limit(20);

  return (charges ?? []).map((charge) => {
    const enrollment = Array.isArray(charge.enrollments) ? charge.enrollments[0] : charge.enrollments;
    const studentName = getRelatedFullName(enrollment?.students);
    const programName = getRelatedTitle(enrollment?.programs);
    const totalPaid = Array.isArray(charge.payments)
      ? charge.payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0)
      : 0;
    const totalAmount = Number(charge.amount ?? 0);
    const remainingAmount = Math.max(totalAmount - totalPaid, 0);
    const paymentStatus = resolveChargePaymentStatus({
      amount: totalAmount,
      payments: charge.payments,
      enrollmentStartsOn: enrollment?.starts_on ?? null,
      chargeCreatedAt: charge.created_at,
      dueDate: charge.due_date,
    });

    return {
      id: charge.id,
      enrollmentId: charge.enrollment_id,
      studentId: enrollment?.student_id ?? undefined,
      programId: enrollment?.program_id ?? undefined,
      item: studentName && programName ? `${studentName} / ${programName}` : "Program tahakkuku",
      dueDate: formatDateLabel(charge.due_date),
      amount: formatTry(totalAmount),
      status: getPaymentLifecycleLabel(paymentStatus),
      paymentStatus,
      billingPeriodLabel: charge.billing_period ? formatDateLabel(charge.billing_period) : undefined,
      totalAmountValue: totalAmount,
      paidAmountValue: totalPaid,
      remainingAmountValue: remainingAmount,
      paidAmount: formatTry(totalPaid),
      remainingAmount: formatTry(remainingAmount),
      lastPaymentLabel: Array.isArray(charge.payments) && charge.payments.length
        ? formatDateLabel(
            [...charge.payments]
              .sort((left, right) => String(right.paid_at ?? "").localeCompare(String(left.paid_at ?? "")))[0]?.paid_at ??
              null,
          )
        : null,
    };
  }) satisfies ChargeRecord[];
}

export async function getChargeOptions() {
  if (!isLiveEnabled()) {
    return [] as ChargeOption[];
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [] as ChargeOption[];
  }

  const auth = await getCurrentAuthContext();

  if (!auth) {
    return [] as ChargeOption[];
  }

  if (auth.role === "parent" && auth.userId) {
    const { data: links } = await supabase
      .from("parent_student_links")
      .select("student_id")
      .eq("parent_profile_id", auth.userId);
    const studentIds = (links ?? []).map((link) => link.student_id);
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, student_id, starts_on, students(full_name), programs(title)")
      .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]);
    const enrollmentIds = (enrollments ?? []).map((item) => item.id);
    const { data: charges } = await supabase
      .from("charges")
      .select("id, amount, status, due_date, created_at, billing_period, payments(amount, paid_at), enrollment_id")
      .in("enrollment_id", enrollmentIds.length ? enrollmentIds : ["00000000-0000-0000-0000-000000000000"]);

    return (charges ?? [])
      .map((charge) => {
      const enrollment = (enrollments ?? []).find((item) => item.id === charge.enrollment_id);
      const studentName = getRelatedFullName(enrollment?.students);
      const programName = getRelatedTitle(enrollment?.programs);
      const totalPaid = Array.isArray(charge.payments)
        ? charge.payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0)
        : 0;
      const totalAmount = Number(charge.amount ?? 0);
      const remainingAmount = Math.max(totalAmount - totalPaid, 0);
      const paymentStatus = resolveChargePaymentStatus({
        amount: totalAmount,
        payments: charge.payments,
        enrollmentStartsOn: enrollment?.starts_on ?? null,
        chargeCreatedAt: charge.created_at,
        dueDate: charge.due_date,
      });

      return {
        id: charge.id,
        label:
          studentName && programName
            ? `${studentName} / ${programName}${charge.billing_period ? ` / ${formatDateLabel(charge.billing_period)}` : ""}`
            : "Program tahakkuku",
        amount: formatTry(remainingAmount),
        status: getPaymentLifecycleLabel(paymentStatus),
        paymentStatus,
        remainingAmountValue: remainingAmount,
        billingPeriodLabel: charge.billing_period ? formatDateLabel(charge.billing_period) : undefined,
        dueDateLabel: formatDateLabel(charge.due_date),
      };
      })
      .filter((charge) => charge.paymentStatus !== "completed") satisfies ChargeOption[];
  }

  const { data: charges } = await supabase
    .from("charges")
    .select(
      "id, amount, status, due_date, created_at, billing_period, payments(amount, paid_at), enrollment_id, enrollments(student_id, starts_on, students(full_name), programs(title))",
    )
    .order("due_date")
    .limit(25);

  return (charges ?? [])
    .map((charge) => {
    const enrollment = Array.isArray(charge.enrollments) ? charge.enrollments[0] : charge.enrollments;
    const studentName = getRelatedFullName(enrollment?.students);
    const programName = getRelatedTitle(enrollment?.programs);
    const totalPaid = Array.isArray(charge.payments)
      ? charge.payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0)
      : 0;
    const totalAmount = Number(charge.amount ?? 0);
    const remainingAmount = Math.max(totalAmount - totalPaid, 0);
    const paymentStatus = resolveChargePaymentStatus({
      amount: totalAmount,
      payments: charge.payments,
      enrollmentStartsOn: enrollment?.starts_on ?? null,
      chargeCreatedAt: charge.created_at,
      dueDate: charge.due_date,
    });

    return {
      id: charge.id,
      label:
        studentName && programName
          ? `${studentName} / ${programName}${charge.billing_period ? ` / ${formatDateLabel(charge.billing_period)}` : ""}`
          : "Program tahakkuku",
      amount: formatTry(remainingAmount),
      status: getPaymentLifecycleLabel(paymentStatus),
      paymentStatus,
      remainingAmountValue: remainingAmount,
      billingPeriodLabel: charge.billing_period ? formatDateLabel(charge.billing_period) : undefined,
      dueDateLabel: formatDateLabel(charge.due_date),
    };
    })
    .filter((charge) => charge.paymentStatus !== "completed") satisfies ChargeOption[];
}

export async function getAnnouncementsData() {
  if (!isLiveEnabled()) {
    return [] as AnnouncementRecord[];
  }

  const supabase = await createSupabaseServerClient();
  const auth = await getCurrentAuthContext();

  if (!supabase) {
    return [] as AnnouncementRecord[];
  }

  return withDashboardCache(`announcements:${auth?.userId ?? "anonymous"}`, async () => {
    const { data } = await supabase
      .from("announcements")
      .select("title, body, audience_role, published_at")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(10);

    return (data ?? []).map((announcement) => ({
      title: announcement.title,
      audience: announcement.audience_role ? announcement.audience_role : "Tum kullanicilar",
      time: announcement.published_at ? formatDateLabel(announcement.published_at) : "Taslak",
      summary: announcement.body,
    })) satisfies AnnouncementRecord[];
  });
}

export async function getNotificationData() {
  if (!isLiveEnabled()) {
    return [] as NotificationRecord[];
  }

  return getAdminNotifications();
}

export async function getCoachMetrics() {
  if (!isLiveEnabled()) {
    return metricsByRole.coach;
  }

  const auth = await getCurrentAuthContext();

  if (!auth?.userId) {
    return metricsByRole.coach;
  }

  return withDashboardCache(`coach-metrics:${auth.userId}:${auth.role}`, async () => {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return metricsByRole.coach;
    }

    const sessionProgramQuery = supabase
      .from("sessions")
      .select("program_id, session_series_id")
      .is("cancelled_at", null);
    const sessionCountQuery = supabase
      .from("sessions")
      .select("*", { head: true, count: "exact" })
      .is("cancelled_at", null);

    if (auth.role !== "admin") {
      sessionProgramQuery.eq("coach_profile_id", auth.userId);
      sessionCountQuery.eq("coach_profile_id", auth.userId);
    }

    const sessionProgramsResult = await sessionProgramQuery;
    const sessionSeriesIds = sessionProgramsResult.data
      ?.map((row) => row.session_series_id)
      .filter((value): value is string => Boolean(value)) ?? ["00000000-0000-0000-0000-000000000000"];

    const [{ count: sessionCount }, { count: rosterCount }, { count: pendingAttendance }] =
      await Promise.all([
        sessionCountQuery,
        supabase
          .from("enrollment_session_allocations")
          .select("id", { head: true, count: "exact" })
          .in("session_series_id", sessionSeriesIds)
          .neq("status", "cancelled"),
        supabase
          .from("attendance_records")
          .select("*", { head: true, count: "exact" })
          .eq("status", "absent"),
      ]);

    return [
      { label: "Toplam seans", value: String(sessionCount ?? 0), delta: "Koc bagli takvim" },
      { label: "Bagli roster", value: String(rosterCount ?? 0), delta: "Canli kayit listesi" },
      {
        label: "Aksiyon sinyali",
        value: String(pendingAttendance ?? 0),
        delta: "Aksiyon gereken kayit",
      },
    ] satisfies Metric[];
  });
}

export async function getCoachDashboardSummary() {
  if (!isLiveEnabled()) {
    return {
      metrics: metricsByRole.coach,
      focusSessions: [],
      pendingAttendance: 0,
      noteQueue: 0,
      firstTimers: 0,
      postSessionClosures: 0,
      firstTimerStudents: [],
      exceptionStudents: [],
    } satisfies CoachDashboardSummary;
  }

  const auth = await getCurrentAuthContext();
  const adminClient = createSupabaseAdminClient();
  const context = auth?.userId ? await getOrCreateOrganizationContext(auth.userId) : null;

  if (!adminClient || !auth?.userId || !context?.organizationId) {
    return {
      metrics: metricsByRole.coach,
      focusSessions: [],
      pendingAttendance: 0,
      noteQueue: 0,
      firstTimers: 0,
      postSessionClosures: 0,
      firstTimerStudents: [],
      exceptionStudents: [],
    } satisfies CoachDashboardSummary;
  }

  return withDashboardCache(`coach-dashboard-summary:${auth.userId}:${auth.role}`, async () => {
    const metrics = await getCoachMetrics();
    const todayKey = formatDayKey(new Date().toISOString());

    const buildSessionQuery = () => {
      let query = adminClient
        .from("sessions")
        .select("id, title, starts_at, ends_at, location")
        .is("cancelled_at", null)
        .order("starts_at");

      if (auth.role !== "admin") {
        query = query.eq("coach_profile_id", auth.userId);
      }

      return query;
    };

    const [{ data: todaySessions }, { data: fallbackSessions }] = await Promise.all([
      buildSessionQuery()
        .gte("starts_at", `${todayKey}T00:00:00.000Z`)
        .lt("starts_at", `${todayKey}T23:59:59.999Z`)
        .limit(6),
      buildSessionQuery().limit(6),
    ]);

    const focusBaseSessions = (todaySessions?.length ? todaySessions : fallbackSessions ?? []).slice(0, 4);
    if (!focusBaseSessions.length) {
      return {
        metrics,
        focusSessions: [],
        pendingAttendance: 0,
        noteQueue: 0,
        firstTimers: 0,
        postSessionClosures: 0,
        firstTimerStudents: [],
        exceptionStudents: [],
      } satisfies CoachDashboardSummary;
    }

    const sessionIds = focusBaseSessions.map((session) => session.id);
    const [{ data: allocations }, { data: attendanceRows }] = await Promise.all([
      adminClient
        .from("enrollment_session_allocations")
        .select("session_id, student_id, status")
        .in("session_id", sessionIds)
        .neq("status", "cancelled"),
      adminClient
        .from("attendance_records")
        .select("session_id, student_id, status, note")
        .in("session_id", sessionIds),
    ]);

    const studentIds = Array.from(new Set((allocations ?? []).map((row) => row.student_id)));
    const [{ data: students }, { data: allAttendanceRows }] = await Promise.all([
      adminClient
        .from("students")
        .select("id, full_name")
        .in("id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]),
      adminClient
        .from("attendance_records")
        .select("student_id")
        .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]),
    ]);

    const studentMap = new Map((students ?? []).map((student) => [student.id, student.full_name]));
    const attendanceCountByStudent = new Map<string, number>();
    for (const row of allAttendanceRows ?? []) {
      attendanceCountByStudent.set(row.student_id, (attendanceCountByStudent.get(row.student_id) ?? 0) + 1);
    }

    const focusSessions = focusBaseSessions.map((session) => {
      const sessionAllocations = (allocations ?? []).filter((allocation) => allocation.session_id === session.id);
      const sessionAttendanceRows = (attendanceRows ?? []).filter((row) => row.session_id === session.id);
      const firstSessionCount = sessionAllocations.filter(
        (allocation) => (attendanceCountByStudent.get(allocation.student_id) ?? 0) <= 1,
      ).length;

      return {
        sessionId: session.id,
        title: session.title ?? "Seans",
        location: session.location ?? "Alan belirtilmedi",
        dateLabel: formatDayLabel(session.starts_at),
        dayKey: formatDayKey(session.starts_at),
        dayShort: formatDayShort(session.starts_at),
        startTime: formatTimeValue(session.starts_at),
        endTime: formatTimeValue(session.ends_at),
        studentCount: sessionAllocations.length,
        pendingAttendanceCount: Math.max(sessionAllocations.length - sessionAttendanceRows.length, 0),
        firstSessionCount,
      };
    });

    const pendingAttendance = focusSessions.reduce((sum, session) => sum + session.pendingAttendanceCount, 0);
    const noteQueue = focusSessions.reduce((sum, session) => {
      const sessionAttendanceRows = (attendanceRows ?? []).filter((row) => row.session_id === session.sessionId);
      const emptyNotes = sessionAttendanceRows.filter((row) => !(row.note ?? "").trim()).length;
      return sum + emptyNotes;
    }, 0);
    const firstTimerStudents = (allocations ?? [])
      .filter((allocation) => (attendanceCountByStudent.get(allocation.student_id) ?? 0) <= 1)
      .slice(0, 4)
      .map((allocation) => {
        const session = focusSessions.find((item) => item.sessionId === allocation.session_id);
        return {
          sessionId: allocation.session_id,
          sessionTitle: session?.title ?? "Seans",
          dateLabel: session?.dateLabel ?? "",
          studentName: studentMap.get(allocation.student_id) ?? "Ogrenci",
        };
      });
    const exceptionStudents = (attendanceRows ?? [])
      .filter((row) => row.status === "absent" || row.status === "excused")
      .slice(0, 4)
      .map((row) => {
        const session = focusSessions.find((item) => item.sessionId === row.session_id);
        return {
          sessionId: row.session_id,
          sessionTitle: session?.title ?? "Seans",
          dateLabel: session?.dateLabel ?? "",
          studentName: studentMap.get(row.student_id) ?? "Ogrenci",
          reason: row.note?.trim() || (row.status === "excused" ? "Izinli" : "Devamsiz"),
        };
      });

    return {
      metrics,
      focusSessions,
      pendingAttendance,
      noteQueue,
      firstTimers: firstTimerStudents.length,
      postSessionClosures: pendingAttendance + noteQueue,
      firstTimerStudents,
      exceptionStudents,
    } satisfies CoachDashboardSummary;
  });
}

export async function getCoachStudents() {
  if (!isLiveEnabled()) {
    return [] as CoachStudentRecord[];
  }

  const auth = await getCurrentAuthContext();
  const adminClient = createSupabaseAdminClient();

  if (!adminClient || !auth?.userId) {
    return [] as CoachStudentRecord[];
  }

  const coachUserId = auth.userId;

  return withDashboardCache(`coach-students:${coachUserId}:${auth.role}`, async () => {

  let coachSessionsQuery = adminClient
    .from("sessions")
    .select("program_id, session_series_id")
    .is("cancelled_at", null);

  if (auth.role !== "admin") {
    coachSessionsQuery = coachSessionsQuery.eq("coach_profile_id", coachUserId);
  }

  const { data: coachSessions } = await coachSessionsQuery;

  const programIds = Array.from(new Set((coachSessions ?? []).map((session) => session.program_id)));
  const sessionSeriesIds = Array.from(
    new Set(
      (coachSessions ?? [])
        .map((session) => session.session_series_id)
        .filter((value): value is string => Boolean(value)),
    ),
  );
  const { data: enrollments } = await adminClient
    .from("enrollments")
    .select("id, student_id, session_series_id, programs(title)")
    .in("program_id", programIds.length ? programIds : ["00000000-0000-0000-0000-000000000000"])
    .in(
      "session_series_id",
      sessionSeriesIds.length ? sessionSeriesIds : ["00000000-0000-0000-0000-000000000000"],
    );

  const studentIds = Array.from(new Set((enrollments ?? []).map((enrollment) => enrollment.student_id)));
  const { data: students } = await adminClient
    .from("students")
    .select("id, full_name, birth_date, gender, active")
    .in("id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]);

  const organizationContext = await getOrCreateOrganizationContext(coachUserId);
  const { data: detailProfiles } = await adminClient
    .from("student_detail_profiles")
    .select(
      "student_id, category, club_name, technical_score, discipline_score, participation_score, strengths, improvement_areas, coach_notes",
    )
    .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]);

  const { data: reportCards } = await adminClient
    .from("report_cards")
    .select("id, student_id, summary, generated_at, payload")
    .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]);

  const attendance = await getAttendanceMap(studentIds);
  const enrollmentIds = (enrollments ?? []).map((enrollment) => enrollment.id);
  const allocationSummaryMap = await getAllocationSummaryMap(adminClient, enrollmentIds);
  const { data: attendanceRows } = await adminClient
    .from("attendance_records")
    .select("student_id, status, created_at")
    .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"])
    .order("created_at", { ascending: false });

  const attendanceHistoryMap = new Map<
    string,
    {
      count: number;
      lastCreatedAt: string | null;
      lastStatus: string | null;
    }
  >();

  for (const row of attendanceRows ?? []) {
    const current = attendanceHistoryMap.get(row.student_id) ?? {
      count: 0,
      lastCreatedAt: null,
      lastStatus: null,
    };
    current.count += 1;
    if (!current.lastCreatedAt) {
      current.lastCreatedAt = row.created_at ?? null;
      current.lastStatus = row.status ?? null;
    }
    attendanceHistoryMap.set(row.student_id, current);
  }

  return (students ?? []).map((student) => {
    const enrollment = (enrollments ?? []).find((item) => item.student_id === student.id);
    const detail = (detailProfiles ?? []).find((item) => item.student_id === student.id);
    const reportCard = (reportCards ?? []).find((item) => item.student_id === student.id);
    const attendanceHistory = attendanceHistoryMap.get(student.id);
    const legacyDetail = detail
      ? {
          category: detail.category ?? getRelatedTitle(enrollment?.programs) ?? "Kategori",
          clubName: detail.club_name ?? organizationContext.organization?.name ?? "Kulup",
          technicalScore: detail.technical_score,
          disciplineScore: detail.discipline_score,
          participationScore: detail.participation_score,
          strengths: detail.strengths ?? "",
          improvementAreas: detail.improvement_areas ?? "",
          coachNotes: detail.coach_notes ?? "",
        }
      : null;
    const reportCardRecord = reportCard
      ? buildStudentReportCard({
          id: reportCard.id,
          summary: reportCard.summary,
          generatedAt: reportCard.generated_at,
          payload: reportCard.payload,
          legacyDetail,
        })
      : null;

    return {
      id: student.id,
      initials: getStudentInitials(student.full_name),
      name: student.full_name,
      club: legacyDetail?.clubName ?? organizationContext.organization?.name ?? "Kulup",
      category: legacyDetail?.category ?? getRelatedTitle(enrollment?.programs) ?? "Kategori",
      gender:
        student.gender === "female" ? "Kadin" : student.gender === "male" ? "Erkek" : "Belirtilmedi",
      birthDate: formatBirthDate(student.birth_date),
      program: getRelatedTitle(enrollment?.programs) ?? "Program baglanmadi",
      coach: "Atanan roster",
      attendance: attendance.get(student.id) ?? "--",
      status: student.active ? "Aktif" : "Pasif",
      remainingLessons: enrollment?.id ? allocationSummaryMap.get(enrollment.id)?.remainingLessons ?? 0 : 0,
      lastAttendanceLabel: attendanceHistory?.lastCreatedAt
        ? `${formatDateLabel(attendanceHistory.lastCreatedAt)} · ${
            attendanceHistory.lastStatus === "present"
              ? "Katildi"
              : attendanceHistory.lastStatus === "excused"
                ? "Mazeretli"
                : "Gelmedi"
          }`
        : "Henuz yoklama yok",
      coachNoteSummary: detail?.coach_notes?.trim()
        ? detail.coach_notes.trim().slice(0, 96)
        : null,
      firstSessionFlag: (attendanceHistory?.count ?? 0) === 0,
      detailSaved: Boolean(reportCardRecord || detail),
      reportCard: reportCardRecord,
      detailEntries: reportCardRecord?.entries ?? (legacyDetail ? getFallbackEntriesFromLegacy(legacyDetail) : []),
    };
  }) satisfies CoachStudentRecord[];
  });
}

export async function getParentMetrics() {
  if (!isLiveEnabled()) {
    return metricsByRole.parent;
  }

  const auth = await getCurrentAuthContext();

  if (!auth?.userId) {
    return metricsByRole.parent;
  }

  return withDashboardCache(`parent-metrics:${auth.userId}:${auth.role}`, async () => {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return metricsByRole.parent;
    }

    let studentIds: string[] = [];

    if (auth.role === "admin") {
      const { data: students } = await supabase.from("students").select("id");
      studentIds = (students ?? []).map((student) => student.id);
    } else {
      const { data: links } = await supabase
        .from("parent_student_links")
        .select("student_id")
        .eq("parent_profile_id", auth.userId);
      studentIds = (links ?? []).map((link) => link.student_id);
    }

    const sessions = await getSessionsData();
    const charges = await getChargeData();
    const attendance = await getAttendanceMap(studentIds);
    const attendanceValues = Array.from(attendance.values())
      .map((value) => Number(value.replace("%", "")))
      .filter((value) => !Number.isNaN(value));
    const averageAttendance = attendanceValues.length
      ? Math.round(attendanceValues.reduce((sum, value) => sum + value, 0) / attendanceValues.length)
      : 0;

    const totalOutstanding = charges.reduce((sum, charge) => {
      const digits = charge.amount.replace(/[^\d]/g, "");
      return sum + Number(digits || 0);
    }, 0);

    return [
      {
        label: "Bu hafta seans",
        value: String(sessions.length),
        delta: "Bagli ogrenci takvimi",
      },
      {
        label: "Devam orani",
        value: `%${averageAttendance}`,
        delta: "Canli attendance verisi",
      },
      {
        label: "Acik bakiye",
        value: formatTry(totalOutstanding),
        delta: "Tahakkuk farki",
      },
    ] satisfies Metric[];
  });
}

export async function getParentDashboardSummary() {
  const auth = await getCurrentAuthContext();

  if (!auth?.userId) {
    return {
      metrics: metricsByRole.parent,
      linkedStudentsLabel: "Bagli ogrenci bulunmuyor",
      linkedStudentsSummary: "Bagli ogrenci bulunmuyor",
      totalOutstandingValue: 0,
      unreadNotifications: 0,
      reportCardCount: 0,
      upcomingSessions: [],
      actionItems: [],
      linkedStudentSummaries: [],
      financeCharges: [],
    } satisfies ParentDashboardSummary;
  }

  return withDashboardCache(`parent-dashboard-summary:${auth.userId}:${auth.role}`, async () => {
    const [metrics, sessions, charges, notifications, reportCards, linkedStudentNames, linkedStudentSummaries] =
      await Promise.all([
        getParentMetrics(),
        getSessionsData(),
        getChargeData(),
        getParentNotificationsData(),
        getParentReportCards(),
        getParentLinkedStudentNames(),
        getParentLinkedStudentSummaries(),
      ]);

    const linkedStudentsLabel = linkedStudentNames.length
      ? linkedStudentNames.join(", ")
      : "Bagli ogrenci bulunmuyor";
    const linkedStudentsSummary =
      linkedStudentNames.length === 1 ? linkedStudentNames[0] : `${linkedStudentNames.length} bagli ogrenci`;
    const totalOutstandingValue = charges.reduce((sum, charge) => {
      if (charge.paymentStatus === "completed") {
        return sum;
      }
      return sum + (charge.remainingAmountValue ?? 0);
    }, 0);
    const unreadNotifications = notifications.filter((notification) => notification.status !== "read").length;
    const actionItems = [
      ...sessions.slice(0, 2).map((session) => ({
        title: session.title,
        subtitle: `${session.slot} · ${session.location}`,
        state: "Yaklasan ders",
        actionLabel: "Takvimi ac",
        href: "/parent/schedule",
      })),
      ...charges.slice(0, 2).map((charge) => ({
        title: charge.item,
        subtitle: `${charge.dueDate} · ${charge.remainingAmount ?? charge.amount}`,
        state: charge.status,
        actionLabel: "Odemeleri gor",
        href: "/parent/payments",
      })),
      ...notifications.slice(0, 1).map((notification) => ({
        title: notification.title,
        subtitle: notification.body,
        state: notification.status === "read" ? "Okundu" : "Yeni bildirim",
        actionLabel: "Bildirimler",
        href: "/parent/support",
      })),
    ].slice(0, 5);

    return {
      metrics,
      linkedStudentsLabel,
      linkedStudentsSummary,
      totalOutstandingValue,
      unreadNotifications,
      reportCardCount: reportCards.length,
      upcomingSessions: sessions.slice(0, 3),
      actionItems,
      linkedStudentSummaries: linkedStudentSummaries.slice(0, 2),
      financeCharges: charges.slice(0, 2),
    } satisfies ParentDashboardSummary;
  });
}

export async function getParentLinkedStudentNames() {
  if (!isLiveEnabled()) {
    return [] as string[];
  }

  const auth = await getCurrentAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !auth?.userId) {
    return [] as string[];
  }

  let studentIds: string[] = [];

  if (auth.role === "admin") {
    const { data: students } = await supabase.from("students").select("id");
    studentIds = (students ?? []).map((student) => student.id);
  } else {
    const { data: links } = await supabase
      .from("parent_student_links")
      .select("student_id")
      .eq("parent_profile_id", auth.userId);
    studentIds = (links ?? []).map((link) => link.student_id);
  }

  if (!studentIds.length) {
    return [] as string[];
  }

  return withDashboardCache(`parent-linked-student-names:${auth.userId}:${auth.role}`, async () => {
    const { data: students } = await supabase
      .from("students")
      .select("full_name")
      .in("id", studentIds);

    return Array.from(
      new Set(
        (students ?? [])
          .map((student) => student.full_name?.trim())
          .filter((name): name is string => Boolean(name)),
      ),
    );
  });
}

export async function getParentLinkedStudentSummaries() {
  if (!isLiveEnabled()) {
    return [] as ParentLinkedStudentSummary[];
  }

  const auth = await getCurrentAuthContext();
  const adminClient = createSupabaseAdminClient();

  if (!adminClient || !auth?.userId) {
    return [] as ParentLinkedStudentSummary[];
  }

  const { data: links } = await adminClient
    .from("parent_student_links")
    .select("student_id")
    .eq("parent_profile_id", auth.userId);

  const studentIds = (links ?? []).map((link) => link.student_id);
  if (!studentIds.length) {
    return [] as ParentLinkedStudentSummary[];
  }

  return withDashboardCache(`parent-linked-student-summaries:${auth.userId}:${auth.role}`, async () => {
    const [{ data: students }, { data: enrollments }] = await Promise.all([
      adminClient
        .from("students")
        .select("id, full_name, birth_date")
        .in("id", studentIds),
      adminClient
        .from("enrollments")
        .select(
          "id, student_id, starts_on, program_id, session_series_id, programs(title, age_band), session_series(title, start_time, weekdays), profiles(full_name)",
        )
        .in("student_id", studentIds)
        .order("starts_on", { ascending: false }),
    ]);

  const activeEnrollments = new Map<
    string,
    {
      id: string;
      student_id: string;
      starts_on: string | null;
      program_id: string;
      session_series_id: string | null;
      programs: unknown;
      session_series: unknown;
      profiles: unknown;
    }
  >();
  for (const enrollment of enrollments ?? []) {
    if (activeEnrollments.has(enrollment.student_id)) {
      continue;
    }
    activeEnrollments.set(enrollment.student_id, enrollment);
  }

    const enrollmentIds = Array.from(activeEnrollments.values()).map((enrollment) => enrollment.id);
    const { data: charges } = await adminClient
      .from("charges")
      .select("id, enrollment_id, amount, due_date, created_at, billing_period, payments(amount, paid_at)")
      .in("enrollment_id", enrollmentIds.length ? enrollmentIds : ["00000000-0000-0000-0000-000000000000"]);

    return (students ?? []).map((student) => {
    const enrollment = activeEnrollments.get(student.id);
    const studentCharges = (charges ?? []).filter((charge) => charge.enrollment_id === enrollment?.id);
    const latestCharge = [...studentCharges].sort((left, right) =>
      String(right.billing_period ?? right.due_date ?? right.created_at ?? "").localeCompare(
        String(left.billing_period ?? left.due_date ?? left.created_at ?? ""),
      ),
    )[0];
    const totalAmount = Number(latestCharge?.amount ?? 0);
    const paidAmount = Array.isArray(latestCharge?.payments)
      ? latestCharge.payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0)
      : 0;
    const remainingAmount = Math.max(totalAmount - paidAmount, 0);
    const paymentStatus = latestCharge
      ? resolveChargePaymentStatus({
          amount: totalAmount,
          payments: latestCharge.payments,
          enrollmentStartsOn: enrollment?.starts_on ?? null,
          chargeCreatedAt: latestCharge.created_at,
          dueDate: latestCharge.due_date,
        })
      : "completed";

    return {
      studentId: student.id,
      studentName: student.full_name,
      ageBand: getRelatedAgeBand(enrollment?.programs) ?? "Yas grubu belirtilmedi",
      programName: getRelatedTitle(enrollment?.programs) ?? "Program baglanmadi",
      sessionSeriesLabel: enrollment?.session_series_id
        ? formatSessionSeriesLabel({
            title: getRelatedTitle(enrollment.session_series) ?? "Grup",
            weekdays: getRelatedWeekdays(enrollment.session_series),
            startTime: getRelatedStartTime(enrollment.session_series),
          })
        : "Grup baglanmadi",
      coachName: getRelatedFullName(enrollment?.profiles) ?? "Koc atanacak",
      paymentStatus,
      paymentStatusLabel: getPaymentLifecycleLabel(paymentStatus),
      billingPeriodLabel: latestCharge?.billing_period ? formatDateLabel(latestCharge.billing_period) : "Donem yok",
      remainingAmountLabel: formatTry(remainingAmount),
      remainingAmountValue: remainingAmount,
      nextPaymentDueLabel: latestCharge?.due_date ? formatDateLabel(latestCharge.due_date) : "Vade yok",
    };
    }) satisfies ParentLinkedStudentSummary[];
  });
}

export async function getParentNotificationsData() {
  if (!isLiveEnabled()) {
    return [] as ParentNotification[];
  }

  const auth = await getCurrentAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !auth?.userId) {
    return [] as ParentNotification[];
  }

  return withDashboardCache(`parent-notifications:${auth.userId}:${auth.role}`, async () => {
    let query = supabase
      .from("notifications")
      .select("id, title, body, channel, read_at")
      .order("read_at", { ascending: true, nullsFirst: true })
      .limit(8);

    if (auth.role !== "admin") {
      query = query.eq("profile_id", auth.userId);
    }

    const { data } = await query;

    return (data ?? []).map((notification) => ({
      id: notification.id,
      title: notification.title,
      body: notification.body ?? "Bildirim detayi eklenmedi.",
      channel: notification.channel === "in_app" ? "In-app" : notification.channel,
      status: notification.read_at ? "Okundu" : "Okunmadi",
    })) satisfies ParentNotification[];
  });
}

export async function getParentReportCards() {
  const auth = await getCurrentAuthContext();

  if (!auth?.userId) {
    return [] as Array<
      StudentReportCard & {
        studentId: string;
        studentName: string;
      }
    >;
  }

  if (!isLiveEnabled()) {
    return [] as Array<
      StudentReportCard & {
        studentId: string;
        studentName: string;
      }
    >;
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return [] as Array<
      StudentReportCard & {
        studentId: string;
        studentName: string;
      }
    >;
  }

  let studentIds: string[] = [];

  if (auth.role === "admin") {
    const { data: students } = await adminClient.from("students").select("id");
    studentIds = (students ?? []).map((student) => student.id);
  } else {
    const { data: links } = await adminClient
      .from("parent_student_links")
      .select("student_id")
      .eq("parent_profile_id", auth.userId);
    studentIds = (links ?? []).map((link) => link.student_id);
  }

  if (!studentIds.length) {
    return [] as Array<
      StudentReportCard & {
        studentId: string;
        studentName: string;
      }
    >;
  }

  return withDashboardCache(`parent-report-cards:${auth.userId}:${auth.role}`, async () => {
    const { data: students } = await adminClient
      .from("students")
      .select("id, full_name")
      .in("id", studentIds);

    const { data: detailProfiles } = await adminClient
      .from("student_detail_profiles")
      .select(
        "student_id, category, club_name, technical_score, discipline_score, participation_score, strengths, improvement_areas, coach_notes",
      )
      .in("student_id", studentIds);

    const { data: reportCards } = await adminClient
      .from("report_cards")
      .select("id, student_id, summary, generated_at, payload")
      .in("student_id", studentIds)
      .order("generated_at", { ascending: false });

    return (reportCards ?? []).map((reportCard) => {
      const student = (students ?? []).find((item) => item.id === reportCard.student_id);
      const detail = (detailProfiles ?? []).find((item) => item.student_id === reportCard.student_id);
      const normalized = buildStudentReportCard({
        id: reportCard.id,
        summary: reportCard.summary,
        generatedAt: reportCard.generated_at,
        payload: reportCard.payload,
        legacyDetail: detail
          ? {
              category: detail.category,
              clubName: detail.club_name,
              technicalScore: detail.technical_score,
              disciplineScore: detail.discipline_score,
              participationScore: detail.participation_score,
              strengths: detail.strengths,
              improvementAreas: detail.improvement_areas,
              coachNotes: detail.coach_notes,
            }
          : null,
      });

      return {
        studentId: reportCard.student_id,
        studentName: student?.full_name ?? "Sporcu",
        ...normalized,
      };
    });
  });
}

async function buildSupportThreadsData(options?: {
  includeMessages?: boolean;
  threadId?: string;
  limit?: number;
}) {
  if (!isLiveEnabled()) {
    return [] as SupportThread[];
  }

  const auth = await getCurrentAuthContext();
  const supabase = await createSupabaseServerClient();
  const adminClient = createSupabaseAdminClient();

  if (!supabase || !adminClient || !auth?.userId) {
    return [] as SupportThread[];
  }

  let query = supabase
    .from("support_threads")
    .select("id, subject, status, created_at, parent_profile_id")
    .order("created_at", { ascending: false });

  if (options?.threadId) {
    query = query.eq("id", options.threadId);
  } else {
    query = query.limit(options?.limit ?? 24);
  }

  if (auth.role === "parent") {
    query = query.eq("parent_profile_id", auth.userId);
  }

  const { data } = await query;
  const threadIds = (data ?? []).map((thread) => thread.id);
  const parentIds = Array.from(
    new Set((data ?? []).map((thread) => thread.parent_profile_id).filter((value): value is string => Boolean(value))),
  );

  const messageLimit = options?.includeMessages
    ? Math.max(threadIds.length * 40, 80)
    : Math.min(Math.max(threadIds.length * 6, 24), 120);

  const [{ data: messages }, { data: parents }] = await Promise.all([
    threadIds.length
      ? adminClient
          .from("support_messages")
          .select("id, thread_id, body, created_at, author_profile_id")
          .in("thread_id", threadIds)
          .order("created_at", { ascending: false })
          .limit(messageLimit)
      : Promise.resolve({
          data: [] as Array<{
            thread_id: string;
            id: string;
            body: string;
            created_at: string;
            author_profile_id: string | null;
          }>,
        }),
    parentIds.length
      ? adminClient
          .from("profiles")
          .select("id, full_name")
          .in("id", parentIds)
      : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null }> }),
  ]);

  const parentMap = new Map((parents ?? []).map((parent) => [parent.id, parent.full_name ?? "Veli"]));
  const messageMap = new Map<
    string,
    {
      preview: string;
      count: number;
      lastAuthorId: string | null;
      updatedAt: string;
    }
  >();
  const messageThreadMap = new Map<string, SupportThread["messages"]>();

  for (const message of messages ?? []) {
    const current = messageMap.get(message.thread_id) ?? {
      preview: "",
      count: 0,
      lastAuthorId: null,
      updatedAt: message.created_at,
    };
    current.count += 1;
    if (!current.preview) {
      current.preview = message.body?.trim().slice(0, 120) ?? "";
      current.lastAuthorId = message.author_profile_id ?? null;
      current.updatedAt = message.created_at;
    }
    messageMap.set(message.thread_id, current);

    if (options?.includeMessages) {
      const threadMessages = messageThreadMap.get(message.thread_id) ?? [];
      threadMessages.push({
        id: message.id,
        body: message.body ?? "",
        createdAt: formatDateLabel(message.created_at),
        authorLabel:
          message.author_profile_id && parentMap.has(message.author_profile_id)
            ? parentMap.get(message.author_profile_id) ?? "Veli"
            : "Ekip",
        authorType: message.author_profile_id && parentMap.has(message.author_profile_id) ? "parent" : "staff",
      });
      messageThreadMap.set(message.thread_id, threadMessages);
    }
  }

  return (data ?? []).map((thread) => {
    const messageMeta = messageMap.get(thread.id);
    const statusKey: SupportThreadStatusKey =
      thread.status === "resolved"
        ? "resolved"
        : messageMeta?.lastAuthorId === thread.parent_profile_id
          ? "open"
          : messageMeta?.lastAuthorId
            ? "waiting_parent"
            : getSupportStatusKey(thread.status);
    const responseAgeDays = getDayDifferenceFromNow(messageMeta?.updatedAt ?? thread.created_at);
    const slaMeta = getSupportSlaMeta(statusKey, thread.created_at);

    return {
      id: thread.id,
      subject: thread.subject,
      status: getSupportStatusLabel(statusKey),
      statusKey,
      openedAtValue: thread.created_at,
      openedAtLabel: formatDateLabel(thread.created_at),
      updatedAt: formatDateLabel(messageMeta?.updatedAt ?? thread.created_at),
      updatedAtValue: messageMeta?.updatedAt ?? thread.created_at,
      responseAgeDays,
      responseAgeLabel: formatResponseAgeLabel(messageMeta?.updatedAt ?? thread.created_at),
      slaStatusLabel: slaMeta.label,
      slaTone: slaMeta.tone,
      latestMessagePreview: messageMeta?.preview || "Mesaj icerigi henuz eklenmedi.",
      messageCount: messageMeta?.count ?? 0,
      parentName: thread.parent_profile_id ? parentMap.get(thread.parent_profile_id) ?? "Veli" : "Veli",
      messages: options?.includeMessages ? [...(messageThreadMap.get(thread.id) ?? [])].reverse() : undefined,
    };
  }) satisfies SupportThread[];
}

export async function getSupportThreadsData() {
  const auth = await getCurrentAuthContext();
  return withDashboardCache(`support-threads:${auth?.userId ?? "anonymous"}:${auth?.role ?? "guest"}`, async () =>
    buildSupportThreadsData({ includeMessages: false, limit: 24 }),
  );
}

export async function getSupportThreadDetail(threadId: string) {
  const auth = await getCurrentAuthContext();
  const rows = await withDashboardCache(
    `support-thread-detail:${auth?.userId ?? "anonymous"}:${auth?.role ?? "guest"}:${threadId}`,
    async () => buildSupportThreadsData({ includeMessages: true, threadId }),
  );

  return rows[0] ?? null;
}

export async function getCoachClosingNoteArchive(limit = 8) {
  if (!isLiveEnabled()) {
    return [] as CoachClosingNoteArchiveItem[];
  }

  const auth = await getCurrentAuthContext();
  const adminClient = createSupabaseAdminClient();

  if (!adminClient || !auth?.userId) {
    return [] as CoachClosingNoteArchiveItem[];
  }

  let auditQuery = adminClient
    .from("audit_logs")
    .select("entity_id, created_at, payload")
    .eq("scope", "Yoklama")
    .eq("entity_type", "sessions")
    .order("created_at", { ascending: false })
    .limit(limit * 3);

  if (auth.role !== "admin") {
    auditQuery = auditQuery.eq("actor_profile_id", auth.userId);
  }

  const { data: rows } = await auditQuery;
  const closingRows = (rows ?? [])
    .map((row) => ({
      sessionId: row.entity_id ?? "",
      createdAt: row.created_at,
      note:
        row.payload && typeof row.payload === "object" && typeof (row.payload as Record<string, unknown>).sessionClosingNote === "string"
          ? String((row.payload as Record<string, unknown>).sessionClosingNote).trim()
          : "",
    }))
    .filter((row) => row.sessionId && row.note.length > 0)
    .slice(0, limit);

  if (!closingRows.length) {
    return [] as CoachClosingNoteArchiveItem[];
  }

  const sessionIds = Array.from(new Set(closingRows.map((row) => row.sessionId)));
  const { data: sessions } = await adminClient
    .from("sessions")
    .select("id, title")
    .in("id", sessionIds);

  const sessionMap = new Map((sessions ?? []).map((session) => [session.id, session.title ?? "Seans"]));

  return closingRows.map((row) => ({
    sessionId: row.sessionId,
    sessionTitle: sessionMap.get(row.sessionId) ?? "Seans",
    note: row.note,
    createdAt: formatDateLabel(row.createdAt),
    createdAtValue: row.createdAt,
  })) satisfies CoachClosingNoteArchiveItem[];
}

export async function getManagerCommunicationTimeline() {
  if (!isLiveEnabled()) {
    return [] as CommunicationTimelineItem[];
  }

  const auth = await getCurrentAuthContext();
  const adminClient = createSupabaseAdminClient();
  const context = auth?.userId ? await getOrCreateOrganizationContext(auth.userId) : null;

  if (!adminClient || !auth?.userId || !context?.organizationId || (auth.role !== "manager" && auth.role !== "admin")) {
    return [] as CommunicationTimelineItem[];
  }

  const [{ data: links }, { data: supportThreads }, { data: dispatches }] = await Promise.all([
    adminClient.from("parent_student_links").select("student_id, parent_profile_id"),
    adminClient
      .from("support_threads")
      .select("id, parent_profile_id, subject, status, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    adminClient
      .from("message_dispatches")
      .select("id, recipient_name, recipient_phone, normalized_phone, status, created_at, event_key")
      .eq("organization_id", context.organizationId)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const studentIds = Array.from(new Set((links ?? []).map((link) => link.student_id)));
  const parentIds = Array.from(new Set((links ?? []).map((link) => link.parent_profile_id)));
  const [{ data: students }, { data: parents }, { data: messages }] = await Promise.all([
    studentIds.length
      ? adminClient.from("students").select("id, full_name").in("id", studentIds)
      : Promise.resolve({ data: [] as Array<{ id: string; full_name: string }> }),
    parentIds.length
      ? adminClient.from("profiles").select("id, full_name, phone").in("id", parentIds)
      : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null; phone: string | null }> }),
    supportThreads?.length
      ? adminClient
          .from("support_messages")
          .select("thread_id, body, created_at")
          .in("thread_id", supportThreads.map((thread) => thread.id))
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as Array<{ thread_id: string; body: string; created_at: string }> }),
  ]);

  const studentMap = new Map((students ?? []).map((student) => [student.id, student.full_name]));
  const parentMap = new Map((parents ?? []).map((parent) => [parent.id, parent]));
  const phoneToParentId = new Map<string, string>();
  for (const parent of parents ?? []) {
    const phone = normalizePhoneDigits(parent.phone);
    if (phone) {
      phoneToParentId.set(phone, parent.id);
    }
  }
  const parentToStudentName = new Map<string, string>();
  for (const link of links ?? []) {
    if (!parentToStudentName.has(link.parent_profile_id)) {
      parentToStudentName.set(link.parent_profile_id, studentMap.get(link.student_id) ?? "Ogrenci");
    }
  }
  const supportMessageMap = new Map<string, { preview: string; createdAt: string }>();
  for (const message of messages ?? []) {
    if (!supportMessageMap.has(message.thread_id)) {
      supportMessageMap.set(message.thread_id, {
        preview: message.body?.trim().slice(0, 120) ?? "Mesaj detay yok",
        createdAt: message.created_at,
      });
    }
  }

  const timeline: CommunicationTimelineItem[] = [];

  for (const thread of supportThreads ?? []) {
    const parent = thread.parent_profile_id ? parentMap.get(thread.parent_profile_id) : null;
    timeline.push({
      id: `support-${thread.id}`,
      studentName: thread.parent_profile_id
        ? parentToStudentName.get(thread.parent_profile_id) ?? "Bagli ogrenci"
        : "Bagli ogrenci",
      parentName: parent?.full_name ?? "Veli",
      channel: "Destek",
      summary: supportMessageMap.get(thread.id)?.preview ?? thread.subject,
      status: getSupportStatusLabel(thread.status),
      createdAt: supportMessageMap.get(thread.id)?.createdAt ?? thread.created_at,
    });
  }

  for (const dispatch of dispatches ?? []) {
    const parentId = phoneToParentId.get(normalizePhoneDigits(dispatch.normalized_phone ?? dispatch.recipient_phone));
    if (!parentId) {
      continue;
    }
    const parent = parentMap.get(parentId);
    timeline.push({
      id: `dispatch-${dispatch.id}`,
      studentName: parentToStudentName.get(parentId) ?? "Bagli ogrenci",
      parentName: parent?.full_name ?? dispatch.recipient_name ?? "Veli",
      channel: "WhatsApp",
      summary: dispatch.event_key === "payment_reminder_manual" ? "Odeme hatirlatmasi" : "Mesaj gonderimi",
      status: formatMessageDeliveryLabel(dispatch.status),
      createdAt: dispatch.created_at,
    });
  }

  return timeline
    .sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();
      return rightTime - leftTime;
    })
    .slice(0, 12)
    .map((item) => ({
      ...item,
      createdAt: formatDateLabel(item.createdAt),
    }));
}

function buildAuditDetail(row: {
  event_type: string;
  payload?: Record<string, unknown> | null;
}) {
  const payload = row.payload ?? {};
  const amountValue = payload.amount;
  const countValue = payload.count;
  const paymentMethod = payload.paymentMethod;
  const scope = payload.scope;

  if (typeof amountValue === "number") {
    return `${formatTry(amountValue)} · ${typeof paymentMethod === "string" ? paymentMethod : "manuel kayit"}`;
  }

  if (typeof countValue === "number") {
    return `${countValue} kayit${typeof scope === "string" ? ` · ${scope}` : ""}`;
  }

  if (typeof payload.studentId === "string") {
    return "Ogrenci bazli operasyon";
  }

  if (typeof payload.chargeId === "string") {
    return "Tahakkuk bazli operasyon";
  }

  return null;
}

export async function getAuditLogRows(options?: { scope?: string; limit?: number }) {
  if (!isLiveEnabled()) {
    return [] as AuditLogRow[];
  }

  const supabase = await createSupabaseServerClient();
  const adminClient = createSupabaseAdminClient();
  const organizationId = await getCurrentOrganizationId();

  if (!supabase || !adminClient || !organizationId) {
    return [] as AuditLogRow[];
  }

  return withDashboardCache(`audit-rows:${organizationId}:${options?.scope ?? "all"}:${options?.limit ?? 12}`, async () => {
    let auditQuery = supabase
      .from("audit_logs")
      .select("actor_profile_id, actor_role, event_type, scope, entity_type, entity_id, payload, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(options?.limit ?? 12);

    if (options?.scope) {
      auditQuery = auditQuery.eq("scope", options.scope);
    }

    const { data } = await auditQuery;

    const actorIds = Array.from(new Set((data ?? []).map((row) => row.actor_profile_id).filter(Boolean)));
    const { data: profiles } = actorIds.length
      ? await adminClient.from("profiles").select("id, full_name").in("id", actorIds)
      : { data: [] as Array<{ id: string; full_name: string }> };

    const actorMap = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name]));

    return (data ?? []).map((row) => ({
      event: row.event_type,
      actor: row.actor_profile_id ? actorMap.get(row.actor_profile_id) ?? "Sistem" : "Sistem",
      scope: row.scope,
      createdAt: formatDateLabel(row.created_at),
      createdAtValue: row.created_at,
      actorRole: row.actor_role ?? null,
      entityType: row.entity_type ?? null,
      entityId: row.entity_id ?? null,
      detail: buildAuditDetail({
        event_type: row.event_type,
        payload: row.payload && typeof row.payload === "object" ? (row.payload as Record<string, unknown>) : null,
      }),
    })) satisfies AuditLogRow[];
  });
}

export async function getLeadSubmissionRows() {
  if (!isLiveEnabled()) {
    return [] as LeadSubmissionRow[];
  }

  const supabase = await createSupabaseServerClient();
  const organizationId = await getCurrentOrganizationId();

  if (!supabase || !organizationId) {
    return [] as LeadSubmissionRow[];
  }

  return withDashboardCache(`lead-submission-rows:${organizationId}`, async () => {
    const { data } = await supabase
      .from("lead_submissions")
      .select("id, full_name, email, phone, branch_interest, status, source, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(20);

    return (data ?? []).map((row) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      status:
        row.branch_interest?.trim() ||
        (row.status === "new"
          ? "Yeni"
          : row.status === "contacted"
            ? "Arandi"
            : row.status === "qualified"
              ? "Uygun"
              : "Kapandi"),
      source:
        row.source === "organic_home"
          ? "Homepage"
          : row.source === "organic_seo_page"
            ? "SEO sayfasi"
            : row.source === "gbp"
              ? "Google Business"
              : row.source === "whatsapp"
                ? "WhatsApp"
                : row.source === "phone"
                  ? "Telefon"
                  : "Bilinmiyor",
      createdAt: formatDateLabel(row.created_at),
    })) satisfies LeadSubmissionRow[];
  });
}

export async function getManagerAttendanceBoards() {
  if (!isLiveEnabled()) {
    return [] as CoachSessionBoard[];
  }

  const adminClient = createSupabaseAdminClient();
  const auth = await getCurrentAuthContext();
  const context = auth?.userId ? await getOrCreateOrganizationContext(auth.userId) : null;

  if (!adminClient || !context?.organizationId) {
    return [] as CoachSessionBoard[];
  }

  const { data: sessions } = await adminClient
    .from("sessions")
    .select("id, title, starts_at, ends_at, location, program_id, session_series_id")
    .is("cancelled_at", null)
    .order("starts_at")
    .limit(12);

  if (!sessions?.length) {
    return [] as CoachSessionBoard[];
  }

  const sessionIds = sessions.map((session) => session.id);
  const [{ data: allocations }, { data: attendanceRows }] = await Promise.all([
    adminClient
      .from("enrollment_session_allocations")
      .select("session_id, student_id, status")
      .in("session_id", sessionIds)
      .neq("status", "cancelled"),
    adminClient
      .from("attendance_records")
      .select("session_id, student_id, status, note")
      .in("session_id", sessionIds),
  ]);
  const studentIds = Array.from(new Set((allocations ?? []).map((item) => item.student_id)));
  const { data: studentsData } = await adminClient
    .from("students")
    .select("id, full_name")
    .in("id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]);
  const studentMap = new Map((studentsData ?? []).map((student) => [student.id, student.full_name]));

  return sessions.map((session) => {
    const students = (allocations ?? [])
      .filter((allocation) => allocation.session_id === session.id)
      .map((allocation): AttendanceStudent => {
        const attendance = (attendanceRows ?? []).find(
          (row) => row.session_id === session.id && row.student_id === allocation.student_id,
        );

        return {
          studentId: allocation.student_id,
          name: studentMap.get(allocation.student_id) ?? "Ogrenci",
          status: attendance?.status ?? "present",
          note: attendance?.note ?? "",
          allocationStatus: allocation.status === "consumed" ? "consumed" : "planned",
        };
      });

    return {
      sessionId: session.id,
      title: session.title,
      slot: formatDateTimeRange(session.starts_at, session.ends_at),
      location: session.location ?? "Alan belirtilmedi",
      roster: `${students.length} sporcu`,
      students,
    };
  }) satisfies CoachSessionBoard[];
}
