import { format } from "date-fns";

import { calculateOutstandingBalance, formatTry } from "@/lib/finance";
import {
  announcementRecords,
  chargeRecords,
  metricsByRole,
  notificationRecords,
  sessionRecords,
  studentRecords,
  supportThreads,
} from "@/lib/mock-data";
import { getCurrentAuthContext } from "@/lib/auth";
import type {
  AnnouncementRecord,
  AdminUserRow,
  BranchSetting,
  ChargeRecord,
  ChargeOption,
  CoachOption,
  CoachSessionBoard,
  Metric,
  NotificationRecord,
  OrganizationSettings,
  ParentNotification,
  ProgramOption,
  SeasonSetting,
  SessionRecord,
  StudentRecord,
  SupportThread,
} from "@/lib/types";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

function formatDateTimeRange(startsAt: string, endsAt: string) {
  return `${format(new Date(startsAt), "dd MMM / HH:mm")} - ${format(
    new Date(endsAt),
    "HH:mm",
  )}`;
}

function formatDateLabel(value: string | null) {
  if (!value) {
    return "Tarih yok";
  }

  return format(new Date(value), "dd MMM yyyy");
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

function getStatusFromBalance(balance: number, active: boolean) {
  if (!active) {
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

export async function getAdminMetrics() {
  if (!isLiveEnabled()) {
    return metricsByRole.admin;
  }

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
}

export async function getAdminNotifications() {
  if (!isLiveEnabled()) {
    return notificationRecords;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return notificationRecords;
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
}

export async function getAdminUsers() {
  if (!isLiveEnabled()) {
    return [
      {
        id: "00000000-0000-0000-0000-000000000001",
        name: "Zeynep Sari",
        email: "zeynep@elitkids.com",
        role: "Admin",
        scope: "Tum kurum",
        status: "Aktif",
      },
      {
        id: "00000000-0000-0000-0000-000000000002",
        name: "Can Guler",
        email: "can@elitkids.com",
        role: "Yonetici",
        scope: "Tum kurum",
        status: "Aktif",
      },
      {
        id: "00000000-0000-0000-0000-000000000003",
        name: "Ece Yilmaz",
        email: "ece@elitkids.com",
        role: "Koc",
        scope: "Mini Ice",
        status: "Aktif",
      },
      {
        id: "00000000-0000-0000-0000-000000000004",
        name: "Ayse Kaya",
        email: "ayse@elitkids.com",
        role: "Veli",
        scope: "Mina Kaya",
        status: "Aktif",
      },
    ] satisfies AdminUserRow[];
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
      name: "Elit Kids Akademi",
      slug: "elitkids",
      locale: "tr-TR",
      timezone: "Europe/Istanbul",
    } satisfies OrganizationSettings;
  }

  const auth = await getCurrentAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !auth?.userId) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", auth.userId)
    .maybeSingle();

  if (!profile?.organization_id) {
    return null;
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name, slug, locale, timezone")
    .eq("id", profile.organization_id)
    .maybeSingle();

  if (!organization) {
    return null;
  }

  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    locale: organization.locale,
    timezone: organization.timezone,
  } satisfies OrganizationSettings;
}

export async function getBranchSettingsData() {
  if (!isLiveEnabled()) {
    return [
      {
        id: "00000000-0000-0000-0000-000000000301",
        name: "Ana Pist",
        slug: "ana-pist",
        location: "Zeytinburnu Buz Pisti",
        status: "Aktif",
        active: true,
        archived: false,
      },
      {
        id: "00000000-0000-0000-0000-000000000302",
        name: "Mini Akademi",
        slug: "mini-akademi",
        location: "Atletik Gelisim Salonu",
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", auth.userId)
    .maybeSingle();

  if (!profile?.organization_id) {
    return [] as BranchSetting[];
  }

  const { data, error } = await supabase
    .from("branches")
    .select("id, name, slug, location, active, archived_at")
    .eq("organization_id", profile.organization_id)
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", auth.userId)
    .maybeSingle();

  if (!profile?.organization_id) {
    return [] as SeasonSetting[];
  }

  const { data, error } = await supabase
    .from("seasons")
    .select("id, title, starts_on, ends_on, is_active, is_default")
    .eq("organization_id", profile.organization_id)
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

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return metricsByRole.manager;
  }

  const [studentsCount, sessionsCount, chargesData] = await Promise.all([
    supabase.from("students").select("*", { head: true, count: "exact" }),
    supabase.from("sessions").select("*", { head: true, count: "exact" }),
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
    return studentRecords;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [] as StudentRecord[];
  }

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, active, enrollments(status, programs(title))")
    .limit(20);

  if (!students?.length) {
    return [];
  }

  const studentIds = students.map((student) => student.id);
  const [balances, attendance] = await Promise.all([
    getStudentBalanceMap(studentIds),
    getAttendanceMap(studentIds),
  ]);

  return students.map((student) => {
    const enrollment = Array.isArray(student.enrollments) ? student.enrollments[0] : student.enrollments;
    const balance = balances.get(student.id) ?? 0;

    return {
      name: student.full_name,
      program: getRelatedTitle(enrollment?.programs) ?? "Program baglanmadi",
      coach: "Canli atama sonrasi",
      attendance: attendance.get(student.id) ?? "--",
      balance: formatTry(balance),
      status: getStatusFromBalance(balance, student.active ?? true),
    };
  }) satisfies StudentRecord[];
}

export async function getProgramsData() {
  if (!isLiveEnabled()) {
    return [
      { title: "Mini Ice / 6-8 Yas", detail: "Haftada 2 seans · Kontenjan 16 · Aylik ₺4.800" },
      { title: "Power Skating / 9-12 Yas", detail: "Haftada 3 seans · Kontenjan 20 · Aylik ₺6.250" },
      { title: "Artistik Baslangic", detail: "Haftada 2 seans · Kontenjan 14 · Aylik ₺5.400" },
    ];
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("programs")
    .select("title, age_band, capacity, monthly_price")
    .order("title");

  return (data ?? []).map((program) => ({
    title: program.title,
    detail: `${program.age_band ?? "Tum grup"} · Kontenjan ${program.capacity ?? 0} · ${formatTry(
      Number(program.monthly_price ?? 0),
    )}`,
  }));
}

export async function getProgramOptions() {
  if (!isLiveEnabled()) {
    return [
      { id: "00000000-0000-0000-0000-000000000001", title: "Mini Ice / 6-8 Yas" },
      { id: "00000000-0000-0000-0000-000000000002", title: "Power Skating / 9-12 Yas" },
      { id: "00000000-0000-0000-0000-000000000003", title: "Artistik Baslangic" },
    ] satisfies ProgramOption[];
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [] as ProgramOption[];
  }

  const { data } = await supabase.from("programs").select("id, title").order("title");

  return (data ?? []).map((program) => ({
    id: program.id,
    title: program.title,
  })) satisfies ProgramOption[];
}

export async function getCoachOptions() {
  if (!isLiveEnabled()) {
    return [{ id: "00000000-0000-0000-0000-000000000101", name: "Ece Yilmaz" }] satisfies CoachOption[];
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [] as CoachOption[];
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, user_roles(role)")
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

export async function getSessionsData() {
  if (!isLiveEnabled()) {
    return sessionRecords;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [] as SessionRecord[];
  }

  const auth = await getCurrentAuthContext();
  const { role, userId } = auth ?? {};

  let query = supabase
    .from("sessions")
    .select("id, title, starts_at, ends_at, location, program_id, coach_profile_id, programs(title), profiles(full_name)")
    .order("starts_at");

  if (role === "coach" && userId) {
    query = query.eq("coach_profile_id", userId);
  }

  if (role === "parent" && userId) {
    const { data: links } = await supabase
      .from("parent_student_links")
      .select("student_id")
      .eq("parent_profile_id", userId);
    const studentIds = (links ?? []).map((link) => link.student_id);
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("program_id")
      .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]);
    const programIds = Array.from(new Set((enrollments ?? []).map((enrollment) => enrollment.program_id)));
    query = query.in("program_id", programIds.length ? programIds : ["00000000-0000-0000-0000-000000000000"]);
  }

  const { data: sessions } = await query.limit(12);

  if (!sessions?.length) {
    return [];
  }

  const programIds = Array.from(new Set(sessions.map((session) => session.program_id)));
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("program_id")
    .in("program_id", programIds);

  const rosterCounts = new Map<string, number>();
  (enrollments ?? []).forEach((enrollment) => {
    rosterCounts.set(
      enrollment.program_id,
      (rosterCounts.get(enrollment.program_id) ?? 0) + 1,
    );
  });

  return sessions.map((session) => ({
    title: session.title ?? getRelatedTitle(session.programs) ?? "Seans",
    slot: formatDateTimeRange(session.starts_at, session.ends_at),
    coach: getRelatedFullName(session.profiles) ?? "Atanacak",
    roster: `${rosterCounts.get(session.program_id) ?? 0} sporcu`,
    location: session.location ?? "Alan belirtilmedi",
  })) satisfies SessionRecord[];
}

export async function getCoachSessionBoards() {
  if (!isLiveEnabled()) {
    return sessionRecords.map((session, index) => ({
      sessionId: `mock-session-${index}`,
      title: session.title,
      slot: session.slot,
      location: session.location,
      roster: session.roster,
      students: studentRecords.slice(0, 3).map((student) => ({
        studentId: `${index}-${student.name}`,
        name: student.name,
        status: student.status === "Aktif" ? "present" : "late",
      })),
    })) satisfies CoachSessionBoard[];
  }

  const supabase = await createSupabaseServerClient();
  const auth = await getCurrentAuthContext();

  if (!supabase || !auth?.userId) {
    return [] as CoachSessionBoard[];
  }

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, title, starts_at, ends_at, location, program_id")
    .eq("coach_profile_id", auth.userId)
    .order("starts_at");

  if (!sessions?.length) {
    return [] as CoachSessionBoard[];
  }

  const programIds = Array.from(new Set(sessions.map((session) => session.program_id)));
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("program_id, student_id, students(full_name)")
    .in("program_id", programIds);

  const sessionIds = sessions.map((session) => session.id);
  const { data: attendanceRows } = await supabase
    .from("attendance_records")
    .select("session_id, student_id, status")
    .in("session_id", sessionIds);

  return sessions.map((session) => {
    const sessionStudents = (enrollments ?? []).filter(
      (enrollment) => enrollment.program_id === session.program_id,
    );

    return {
      sessionId: session.id,
      title: session.title,
      slot: formatDateTimeRange(session.starts_at, session.ends_at),
      location: session.location ?? "Alan belirtilmedi",
      roster: `${sessionStudents.length} sporcu`,
      students: sessionStudents.map((enrollment) => {
        const attendance = (attendanceRows ?? []).find(
          (row) => row.session_id === session.id && row.student_id === enrollment.student_id,
        );

        return {
          studentId: enrollment.student_id,
          name: getRelatedFullName(enrollment.students) ?? "Ogrenci",
          status: attendance?.status ?? "present",
        };
      }),
    };
  }) satisfies CoachSessionBoard[];
}

export async function getChargeData() {
  if (!isLiveEnabled()) {
    return chargeRecords;
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
    return chargeRecords.map((charge, index) => ({
      id: `mock-${index}`,
      label: charge.item,
      amount: charge.amount,
      status: charge.status,
    })) satisfies ChargeOption[];
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
    return announcementRecords;
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
    return notificationRecords;
  }

  return getAdminNotifications();
}

export async function getCoachMetrics() {
  if (!isLiveEnabled()) {
    return metricsByRole.coach;
  }

  const supabase = await createSupabaseServerClient();
  const auth = await getCurrentAuthContext();

  if (!supabase || !auth?.userId) {
    return metricsByRole.coach;
  }

  const [{ count: sessionCount }, { count: rosterCount }, { count: pendingAttendance }] = await Promise.all([
    supabase.from("sessions").select("*", { head: true, count: "exact" }).eq("coach_profile_id", auth.userId),
    supabase
      .from("enrollments")
      .select("id", { head: true, count: "exact" })
      .in(
        "program_id",
        (
          await supabase
            .from("sessions")
            .select("program_id")
            .eq("coach_profile_id", auth.userId)
        ).data?.map((row) => row.program_id) ?? ["00000000-0000-0000-0000-000000000000"],
      ),
    supabase
      .from("attendance_records")
      .select("*", { head: true, count: "exact" })
      .eq("status", "absent"),
  ]);

  return [
    { label: "Toplam seans", value: String(sessionCount ?? 0), delta: "Koc bagli takvim" },
    { label: "Bagli roster", value: String(rosterCount ?? 0), delta: "Canli kayit listesi" },
    { label: "Aksiyon sinyali", value: String(pendingAttendance ?? 0), delta: "Takip gereken kayit" },
  ] satisfies Metric[];
}

export async function getCoachStudents() {
  if (!isLiveEnabled()) {
    return studentRecords.map((student) => ({
      name: student.name,
      program: student.program,
      coach: student.coach,
      attendance: student.attendance,
      status: student.status,
    }));
  }

  const supabase = await createSupabaseServerClient();
  const auth = await getCurrentAuthContext();

  if (!supabase || !auth?.userId) {
    return [];
  }

  const { data: coachSessions } = await supabase
    .from("sessions")
    .select("program_id")
    .eq("coach_profile_id", auth.userId);

  const programIds = Array.from(new Set((coachSessions ?? []).map((session) => session.program_id)));
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("student_id, programs(title)")
    .in("program_id", programIds.length ? programIds : ["00000000-0000-0000-0000-000000000000"]);

  const studentIds = Array.from(new Set((enrollments ?? []).map((enrollment) => enrollment.student_id)));
  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, active")
    .in("id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]);

  const attendance = await getAttendanceMap(studentIds);

  return (students ?? []).map((student) => {
    const enrollment = (enrollments ?? []).find((item) => item.student_id === student.id);

    return {
      name: student.full_name,
      program: getRelatedTitle(enrollment?.programs) ?? "Program baglanmadi",
      coach: "Atanan roster",
      attendance: attendance.get(student.id) ?? "--",
      status: student.active ? "Aktif" : "Risk",
    };
  });
}

export async function getParentMetrics() {
  if (!isLiveEnabled()) {
    return metricsByRole.parent;
  }

  const auth = await getCurrentAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !auth?.userId) {
    return metricsByRole.parent;
  }

  const { data: links } = await supabase
    .from("parent_student_links")
    .select("student_id")
    .eq("parent_profile_id", auth.userId);

  const studentIds = (links ?? []).map((link) => link.student_id);
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
}

export async function getParentNotificationsData() {
  if (!isLiveEnabled()) {
    return [
      {
        id: "00000000-0000-0000-0000-000000000201",
        title: "Yeni odeme kaydi eklendi",
        body: "Tahakkuk odemesi guncellendi. Kalan bakiye ozete yansitildi.",
        channel: "In-app",
        status: "Okunmadi",
      },
      {
        id: "00000000-0000-0000-0000-000000000202",
        title: "Hafta sonu seansi hatirlatmasi",
        body: "Cumartesi gunu Ana Pist seansi saat 10:00'da baslayacak.",
        channel: "In-app",
        status: "Okundu",
      },
    ] satisfies ParentNotification[];
  }

  const auth = await getCurrentAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !auth?.userId) {
    return [] as ParentNotification[];
  }

  const { data } = await supabase
    .from("notifications")
    .select("id, title, body, channel, read_at")
    .eq("profile_id", auth.userId)
    .order("read_at", { ascending: true, nullsFirst: true })
    .limit(8);

  return (data ?? []).map((notification) => ({
    id: notification.id,
    title: notification.title,
    body: notification.body ?? "Bildirim detayi eklenmedi.",
    channel: notification.channel === "in_app" ? "In-app" : notification.channel,
    status: notification.read_at ? "Okundu" : "Okunmadi",
  })) satisfies ParentNotification[];
}

export async function getSupportThreadsData() {
  if (!isLiveEnabled()) {
    return supportThreads;
  }

  const auth = await getCurrentAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !auth?.userId) {
    return [] as SupportThread[];
  }

  const { data } = await supabase
    .from("support_threads")
    .select("subject, status, created_at")
    .eq("parent_profile_id", auth.userId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((thread) => ({
    subject: thread.subject,
    status: thread.status === "open" ? "Yanit bekliyor" : "Cozuldu",
    updatedAt: formatDateLabel(thread.created_at),
  })) satisfies SupportThread[];
}
