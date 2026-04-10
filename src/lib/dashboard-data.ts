import { format } from "date-fns";

import { calculateOutstandingBalance, formatTry } from "@/lib/finance";
import { metricsByRole } from "@/lib/mock-data";
import {
  backfillMissingAllocationsForOrganization,
  getAllocationSummaryMap,
  syncPastAllocationsForOrganization,
} from "@/lib/session-allocations";
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
  Area,
  AttendanceStudent,
  AuditLogRow,
  BranchSetting,
  Category,
  ChargeRecord,
  ChargeOption,
  CoachOption,
  CoachStudentRecord,
  CoachSessionBoard,
  DetailAnswerRecord,
  DetailQuestionRecord,
  LeadSubmissionRow,
  Metric,
  NotificationRecord,
  OrganizationSettings,
  ParentNotification,
  ProgramFormOptions,
  ProgramResourceAdminData,
  ProgramRecord,
  ProgramOption,
  ProgramType,
  SeasonSetting,
  SessionSeriesOption,
  SessionRecord,
  SportsBranch,
  StudentRecord,
  StudentReportCard,
  SupportThread,
} from "@/lib/types";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

const DASHBOARD_CACHE_TTL_MS = 8_000;
const dashboardCache = new Map<string, { expiresAt: number; value: unknown }>();

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

  if (balance >= 1500) {
    return "Risk";
  }

  if (balance > 0) {
    return "Takip";
  }

  return "Aktif";
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

  const organizationId = await getCurrentOrganizationId();
  const adminClient = createSupabaseAdminClient();

  if (!organizationId || !adminClient) {
    return defaultStudentDetailQuestions;
  }

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
      slug: "elitkids",
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

  return {
    id: context.organization.id,
    name: context.organization.name,
    slug: context.organization.slug,
    locale: context.organization.locale,
    timezone: context.organization.timezone,
  } satisfies OrganizationSettings;
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

  const { data, error } = await supabase
    .from("branches")
    .select("id, name, slug, location, active, archived_at")
    .eq("organization_id", context.organizationId)
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

  const { data, error } = await supabase
    .from("seasons")
    .select("id, title, starts_on, ends_on, is_active, is_default")
    .eq("organization_id", context.organizationId)
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

async function getStudentBalanceMap(studentIds: string[]) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || studentIds.length === 0) {
    return new Map<string, number>();
  }

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, student_id")
    .in("student_id", studentIds);

  const enrollmentIds = (enrollments ?? []).map((enrollment) => enrollment.id);

  if (enrollmentIds.length === 0) {
    return new Map<string, number>();
  }

  const { data } = await supabase
    .from("charges")
    .select("amount, enrollment_id, payments(amount)")
    .in("enrollment_id", enrollmentIds);

  const enrollmentToStudent = new Map(
    (enrollments ?? []).map((enrollment) => [enrollment.id, enrollment.student_id]),
  );

  const outstandingMap = new Map<string, number>();

  (data ?? []).forEach((charge) => {
    const studentId = enrollmentToStudent.get(charge.enrollment_id);

    if (!studentId) {
      return;
    }

    const paid = Array.isArray(charge.payments)
      ? charge.payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0)
      : 0;

    const current = outstandingMap.get(studentId) ?? 0;
    outstandingMap.set(studentId, current + Math.max(Number(charge.amount ?? 0) - paid, 0));
  });

  return outstandingMap;
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

  await backfillMissingAllocationsForOrganization(adminClient, organizationContext.organizationId);
  await syncPastAllocationsForOrganization(adminClient, organizationContext.organizationId);

  const { data: students } = await adminClient
    .from("students")
    .select("id, full_name, birth_date, gender, active")
    .eq("organization_id", organizationContext.organizationId)
    .limit(20);

  if (!students?.length) {
    return [];
  }

  const studentIds = students.map((student) => student.id);
  const { data: enrollments } = await adminClient
    .from("enrollments")
    .select(
      "id, student_id, status, program_id, session_series_id, starts_on, ends_on, programs(title, age_band), session_series(title, start_time, weekdays)",
    )
    .in("student_id", studentIds);

  const enrollmentIds = (enrollments ?? []).map((enrollment) => enrollment.id);
  const allocationSummaryMap = await getAllocationSummaryMap(adminClient, enrollmentIds);
  const { data: charges } = await adminClient
    .from("charges")
    .select("id, enrollment_id, amount, status")
    .in("enrollment_id", enrollmentIds.length ? enrollmentIds : ["00000000-0000-0000-0000-000000000000"]);

  const { data: detailProfiles } = await adminClient
    .from("student_detail_profiles")
    .select(
      "id, student_id, category, club_name, technical_score, discipline_score, participation_score, strengths, improvement_areas, coach_notes",
    )
    .in("student_id", studentIds);

  const { data: reportCards } = await adminClient
    .from("report_cards")
    .select("id, student_id, summary, generated_at, payload")
    .in("student_id", studentIds);

  const [balances, attendance] = await Promise.all([
    getStudentBalanceMap(studentIds),
    getAttendanceMap(studentIds),
  ]);

  return students.map((student) => {
    const enrollment = (enrollments ?? [])
      .filter((item) => item.student_id === student.id)
      .sort((left, right) => {
        if (left.status === "active" && right.status !== "active") {
          return -1;
        }

        if (left.status !== "active" && right.status === "active") {
          return 1;
        }

        return (right.starts_on ?? "").localeCompare(left.starts_on ?? "");
      })[0];
    const balance = balances.get(student.id) ?? 0;
    const detail = (detailProfiles ?? []).find((item) => item.student_id === student.id);
    const reportCard = (reportCards ?? []).find((item) => item.student_id === student.id);
    const studentCharges = (charges ?? []).filter((charge) => charge.enrollment_id === enrollment?.id);
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

    return {
      id: student.id,
      enrollmentId: enrollment?.id,
      initials: getStudentInitials(student.full_name),
      name: student.full_name,
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
        .filter((charge) => charge.status !== "paid")
        .map((charge) => ({
          id: charge.id,
          label: `${student.full_name} / ${programName}`,
          amount: formatTry(Number(charge.amount ?? 0)),
          status: charge.status === "paid" ? "Odendi" : "Bekliyor",
        })),
      detailSaved: Boolean(reportCardRecord || detail),
      reportCard: reportCardRecord,
      detailEntries: reportCardRecord?.entries ?? (legacyDetail ? getFallbackEntriesFromLegacy(legacyDetail) : []),
    };
  }) satisfies StudentRecord[];
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

  await backfillMissingAllocationsForOrganization(adminClient, context.organizationId);
  await backfillMissingAllocationsForOrganization(adminClient, context.organizationId);
  await syncPastAllocationsForOrganization(adminClient, context.organizationId);

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

  return sessions.map((session) => {
    const program = programMap.get(session.program_id);
    const studentCount = allocationsBySession.get(session.id)?.length ?? 0;
    const capacity = Number(program?.capacity ?? 0);

    return {
      id: session.id,
      title: session.title ?? program?.title ?? "Seans",
      slot: formatDateTimeRange(session.starts_at, session.ends_at),
      coach: session.coach_profile_id ? coachMap.get(session.coach_profile_id) ?? "Atanacak" : "Atanacak",
      roster: `${studentCount} / ${capacity || studentCount} sporcu`,
      location: session.location ?? areaMap.get(session.area_id ?? "") ?? "Alan belirtilmedi",
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

export async function getCoachSessionBoards() {
  if (!isLiveEnabled()) {
    return [] as CoachSessionBoard[];
  }

  const auth = await getCurrentAuthContext();
  const adminClient = createSupabaseAdminClient();
  const context = auth?.userId ? await getOrCreateOrganizationContext(auth.userId) : null;

  if (!adminClient || !auth?.userId || !context?.organizationId) {
    return [] as CoachSessionBoard[];
  }

  await backfillMissingAllocationsForOrganization(adminClient, context.organizationId);
  await syncPastAllocationsForOrganization(adminClient, context.organizationId);

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
  const { data: students } = await adminClient
    .from("students")
    .select("id, full_name")
    .in("id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]);
  const studentMap = new Map((students ?? []).map((student) => [student.id, student.full_name]));

  return sessions.map((session) => {
    const sessionStudents = (allocations ?? []).filter((allocation) => allocation.session_id === session.id);

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
      students: sessionStudents.map((allocation): AttendanceStudent => {
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
      }),
    };
  }) satisfies CoachSessionBoard[];
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
      .select("id, student_id")
      .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]);
    const enrollmentIds = (enrollments ?? []).map((enrollment) => enrollment.id);
    const { data: charges } = await supabase
      .from("charges")
      .select("amount, due_date, status")
      .in("enrollment_id", enrollmentIds.length ? enrollmentIds : ["00000000-0000-0000-0000-000000000000"])
      .order("due_date");

    return (charges ?? []).map((charge) => ({
      item: "Program tahakkuku",
      dueDate: formatDateLabel(charge.due_date),
      amount: formatTry(Number(charge.amount ?? 0)),
      status: charge.status === "paid" ? "Odendi" : "Bekliyor",
    })) satisfies ChargeRecord[];
  }

  const { data: charges } = await supabase
    .from("charges")
    .select("amount, due_date, status, enrollments(programs(title), students(full_name))")
    .order("due_date")
    .limit(20);

  return (charges ?? []).map((charge) => {
    const enrollment = Array.isArray(charge.enrollments) ? charge.enrollments[0] : charge.enrollments;
    const studentName = getRelatedFullName(enrollment?.students);
    const programName = getRelatedTitle(enrollment?.programs);

    return {
      item: studentName && programName ? `${studentName} / ${programName}` : "Program tahakkuku",
      dueDate: formatDateLabel(charge.due_date),
      amount: formatTry(Number(charge.amount ?? 0)),
      status: charge.status === "paid" ? "Odendi" : "Bekliyor",
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
      .select("id, students(full_name), programs(title)")
      .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]);
    const enrollmentIds = (enrollments ?? []).map((item) => item.id);
    const { data: charges } = await supabase
      .from("charges")
      .select("id, amount, status, enrollment_id")
      .in("enrollment_id", enrollmentIds.length ? enrollmentIds : ["00000000-0000-0000-0000-000000000000"]);

    return (charges ?? []).map((charge) => {
      const enrollment = (enrollments ?? []).find((item) => item.id === charge.enrollment_id);
      const studentName = getRelatedFullName(enrollment?.students);
      const programName = getRelatedTitle(enrollment?.programs);

      return {
        id: charge.id,
        label: studentName && programName ? `${studentName} / ${programName}` : "Program tahakkuku",
        amount: formatTry(Number(charge.amount ?? 0)),
        status: charge.status === "paid" ? "Odendi" : "Bekliyor",
      };
    }) satisfies ChargeOption[];
  }

  const { data: charges } = await supabase
    .from("charges")
    .select("id, amount, status, enrollment_id, enrollments(students(full_name), programs(title))")
    .order("due_date")
    .limit(25);

  return (charges ?? []).map((charge) => {
    const enrollment = Array.isArray(charge.enrollments) ? charge.enrollments[0] : charge.enrollments;
    const studentName = getRelatedFullName(enrollment?.students);
    const programName = getRelatedTitle(enrollment?.programs);

    return {
      id: charge.id,
      label: studentName && programName ? `${studentName} / ${programName}` : "Program tahakkuku",
      amount: formatTry(Number(charge.amount ?? 0)),
      status: charge.status === "paid" ? "Odendi" : "Bekliyor",
    };
  }) satisfies ChargeOption[];
}

export async function getAnnouncementsData() {
  if (!isLiveEnabled()) {
    return [] as AnnouncementRecord[];
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [] as AnnouncementRecord[];
  }

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
        delta: "Takip gereken kayit",
      },
    ] satisfies Metric[];
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

  let coachSessionsQuery = adminClient
    .from("sessions")
    .select("program_id, session_series_id")
    .is("cancelled_at", null);

  if (auth.role !== "admin") {
    coachSessionsQuery = coachSessionsQuery.eq("coach_profile_id", auth.userId);
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
    .select("student_id, session_series_id, programs(title)")
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

  const organizationContext = await getOrCreateOrganizationContext(auth.userId);
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

  return (students ?? []).map((student) => {
    const enrollment = (enrollments ?? []).find((item) => item.student_id === student.id);
    const detail = (detailProfiles ?? []).find((item) => item.student_id === student.id);
    const reportCard = (reportCards ?? []).find((item) => item.student_id === student.id);
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
      status: student.active ? "Aktif" : "Risk",
      detailSaved: Boolean(reportCardRecord || detail),
      reportCard: reportCardRecord,
      detailEntries: reportCardRecord?.entries ?? (legacyDetail ? getFallbackEntriesFromLegacy(legacyDetail) : []),
    };
  }) satisfies CoachStudentRecord[];
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

export async function getParentNotificationsData() {
  if (!isLiveEnabled()) {
    return [] as ParentNotification[];
  }

  const auth = await getCurrentAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !auth?.userId) {
    return [] as ParentNotification[];
  }

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
}

export async function getSupportThreadsData() {
  if (!isLiveEnabled()) {
    return [] as SupportThread[];
  }

  const auth = await getCurrentAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !auth?.userId) {
    return [] as SupportThread[];
  }

  let query = supabase
    .from("support_threads")
    .select("subject, status, created_at")
    .order("created_at", { ascending: false });

  if (auth.role !== "admin") {
    query = query.eq("parent_profile_id", auth.userId);
  }

  const { data } = await query;

  return (data ?? []).map((thread) => ({
    subject: thread.subject,
    status: thread.status === "open" ? "Yanit bekliyor" : "Cozuldu",
    updatedAt: formatDateLabel(thread.created_at),
  })) satisfies SupportThread[];
}

export async function getAuditLogRows() {
  if (!isLiveEnabled()) {
    return [] as AuditLogRow[];
  }

  const supabase = await createSupabaseServerClient();
  const adminClient = createSupabaseAdminClient();
  const organizationId = await getCurrentOrganizationId();

  if (!supabase || !adminClient || !organizationId) {
    return [] as AuditLogRow[];
  }

  const { data } = await supabase
    .from("audit_logs")
    .select("actor_profile_id, event_type, scope, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(12);

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
  })) satisfies AuditLogRow[];
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

  const { data } = await supabase
    .from("lead_submissions")
    .select("id, full_name, email, phone, branch_interest, status, created_at")
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
    createdAt: formatDateLabel(row.created_at),
  })) satisfies LeadSubmissionRow[];
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

  await syncPastAllocationsForOrganization(adminClient, context.organizationId);

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
