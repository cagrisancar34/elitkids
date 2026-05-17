import "server-only";

import {
  addMonths,
  endOfMonth,
  format,
  isAfter,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns";

import { getCurrentAuthContext } from "@/lib/auth";
import { formatTry } from "@/lib/finance";
import { getMessageTopicByKey } from "@/lib/message-topics-server";
import { renderMessageTemplate } from "@/lib/message-topics";
import { getOrCreateOrganizationContext } from "@/lib/organization-context";
import {
  getPaymentLifecycleLabel,
  getPaymentLifecycleTone,
  resolvePaymentLifecycleStatus,
} from "@/lib/payment-status";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  AuditLogRow,
  BillingChargeRecord,
  PaymentHistoryEntry,
  PaymentMethod,
  StudentPaymentSummary,
} from "@/lib/types";
import { buildWebWhatsAppHref } from "@/lib/whatsapp-server";

type EnrollmentBillingRow = {
  id: string;
  student_id: string;
  starts_on: string | null;
  status: string | null;
  program_id: string | null;
  session_series_id: string | null;
  students:
    | {
        id: string;
        full_name: string | null;
        organization_id: string | null;
      }[]
    | {
        id: string;
        full_name: string | null;
        organization_id: string | null;
      }
    | null;
  programs:
    | {
        id: string;
        title: string | null;
        monthly_price: number | string | null;
        age_band: string | null;
      }[]
    | {
        id: string;
        title: string | null;
        monthly_price: number | string | null;
        age_band: string | null;
      }
    | null;
  session_series:
    | {
        id: string;
        title: string | null;
        start_time: string | null;
        weekdays: number[] | null;
      }[]
    | {
        id: string;
        title: string | null;
        start_time: string | null;
        weekdays: number[] | null;
      }
    | null;
};

type ChargePaymentsRow = {
  id: string;
  enrollment_id: string;
  amount: number | string | null;
  due_date: string | null;
  status: string | null;
  created_at: string | null;
  billing_period: string | null;
  payments:
    | Array<{
        id: string;
        amount: number | string | null;
        payment_method: string | null;
        created_at: string | null;
        paid_at: string | null;
        reference_no: string | null;
        note: string | null;
      }>
    | null;
};

type ParentLinkRow = {
  student_id: string;
  parent_profile_id: string;
  profiles:
    | {
        id: string;
        full_name: string | null;
        phone: string | null;
      }[]
    | {
        id: string;
        full_name: string | null;
        phone: string | null;
      }
    | null;
};

type RecentPaymentRecord = PaymentHistoryEntry & {
  studentName: string;
  programName: string;
  billingPeriodLabel: string;
};

type BillingDashboardData = {
  charges: BillingChargeRecord[];
  pendingCharges: BillingChargeRecord[];
  overdueCharges: BillingChargeRecord[];
  completedCharges: BillingChargeRecord[];
  recentPayments: RecentPaymentRecord[];
  summary: {
    todayCollected: number;
    openBalance: number;
    collectionRate: number;
    highestOpen: number;
    openCount: number;
    overdueCount: number;
  };
};

function getRelatedRecord<T>(value: T[] | T | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toIsoDate(value: string | Date) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "yyyy-MM-dd");
}

function formatDateLabel(value: string | null | undefined) {
  if (!value) {
    return "--";
  }

  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function formatBillingPeriodLabel(value: string | null | undefined) {
  if (!value) {
    return "--";
  }

  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function buildAuditDetail(payload: Record<string, unknown> | null | undefined) {
  const safePayload = payload ?? {};
  const amountValue = safePayload.amount;
  const countValue = safePayload.count;
  const paymentMethod = safePayload.paymentMethod;

  if (typeof amountValue === "number") {
    return `${formatTry(amountValue)} · ${typeof paymentMethod === "string" ? paymentMethod : "manuel kayit"}`;
  }

  if (typeof countValue === "number") {
    return `${countValue} kayit`;
  }

  if (typeof safePayload.chargeId === "string") {
    return "Tahakkuk bazli operasyon";
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

function formatWeekdayShort(index: number) {
  return ["Pzt", "Sal", "Car", "Per", "Cum", "Cts", "Paz"][index] ?? "";
}

function formatSessionSeriesLabel(input: {
  title: string | null | undefined;
  startTime: string | null | undefined;
  weekdays: number[] | null | undefined;
}) {
  const weekdayLabel = Array.isArray(input.weekdays)
    ? input.weekdays.map((weekday) => formatWeekdayShort(weekday)).filter(Boolean).join("-")
    : "";

  return [input.title ?? "Grup", weekdayLabel, input.startTime ?? ""].filter(Boolean).join(" / ");
}

function getPaymentMethodLabel(method: string | null | undefined): string {
  switch ((method ?? "").toLowerCase()) {
    case "cash":
    case "nakit":
      return "Nakit";
    case "card":
    case "credit_card":
    case "kredi karti":
      return "Kart";
    case "havale":
    case "eft":
    case "transfer":
      return "Havale";
    default:
      return "Manuel";
  }
}

function normalizePaymentMethod(value: string | null | undefined): PaymentMethod {
  switch ((value ?? "").toLowerCase()) {
    case "cash":
    case "nakit":
      return "cash";
    case "card":
    case "credit_card":
    case "kredi karti":
      return "card";
    case "havale":
    case "eft":
    case "transfer":
      return "transfer";
    default:
      return "manual";
  }
}

function resolveMonthDueDate(startsOn: string, billingPeriod: Date) {
  const enrollmentDate = parseISO(startsOn);
  const anchorDay = enrollmentDate.getDate();
  const monthEnd = endOfMonth(billingPeriod).getDate();
  const dueDate = new Date(billingPeriod);
  dueDate.setDate(Math.min(anchorDay, monthEnd));
  return dueDate;
}

function resolveBillingPeriods(startsOn: string, now = new Date()) {
  const periods: Date[] = [];
  let cursor = startOfMonth(parseISO(startsOn));
  const lastMonth = startOfMonth(now);

  while (!isAfter(cursor, lastMonth)) {
    periods.push(new Date(cursor));
    cursor = addMonths(cursor, 1);
  }

  return periods;
}

export async function ensureMonthlyChargesForOrganization(organizationId: string, now = new Date()) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return;
  }

  const { data: enrollments } = await adminClient
    .from("enrollments")
    .select(
      "id, student_id, starts_on, status, program_id, session_series_id, students!inner(id, organization_id), programs(id, monthly_price)",
    )
    .eq("students.organization_id", organizationId)
    .eq("status", "active");

  const activeEnrollments = (enrollments ?? []).filter((enrollment) => {
    const program = getRelatedRecord(enrollment.programs);
    return Boolean(enrollment.id && enrollment.starts_on && toNumber(program?.monthly_price) > 0);
  });

  if (!activeEnrollments.length) {
    return;
  }

  const enrollmentIds = activeEnrollments.map((enrollment) => enrollment.id);
  const { data: existingCharges } = await adminClient
    .from("charges")
    .select("id, enrollment_id, billing_period")
    .in("enrollment_id", enrollmentIds);

  const existingKeys = new Set(
    (existingCharges ?? [])
      .filter((charge) => charge.billing_period)
      .map((charge) => `${charge.enrollment_id}:${charge.billing_period}`),
  );

  const { data: feePlans } = await adminClient
    .from("fee_plans")
    .select("id, amount")
    .eq("organization_id", organizationId);

  const feePlanByAmount = new Map<string, string>();
  (feePlans ?? []).forEach((plan) => {
    feePlanByAmount.set(String(toNumber(plan.amount)), plan.id);
  });

  const rows = activeEnrollments.flatMap((enrollment) => {
    const program = getRelatedRecord(enrollment.programs);
    const startsOn = enrollment.starts_on;
    const amount = toNumber(program?.monthly_price);

    if (!startsOn || amount <= 0) {
      return [];
    }

    return resolveBillingPeriods(startsOn, now)
      .filter((billingPeriod) => {
        const key = `${enrollment.id}:${toIsoDate(billingPeriod)}`;
        return !existingKeys.has(key);
      })
      .map((billingPeriod) => ({
        enrollment_id: enrollment.id,
        fee_plan_id: feePlanByAmount.get(String(amount)) ?? null,
        amount,
        due_date: toIsoDate(resolveMonthDueDate(startsOn, billingPeriod)),
        status: "pending",
        billing_period: toIsoDate(billingPeriod),
      }));
  });

  if (!rows.length) {
    return;
  }

  await adminClient.from("charges").insert(rows);
}

export async function ensureMonthlyChargeForEnrollment(input: {
  organizationId: string;
  enrollmentId: string;
  startsOn: string;
  amount: number;
}) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return;
  }

  const billingPeriodDate = startOfMonth(parseISO(input.startsOn));
  const billingPeriod = toIsoDate(billingPeriodDate);

  const { data: existingCharge } = await adminClient
    .from("charges")
    .select("id")
    .eq("enrollment_id", input.enrollmentId)
    .eq("billing_period", billingPeriod)
    .maybeSingle();

  if (existingCharge?.id) {
    return;
  }

  const { data: feePlan } = await adminClient
    .from("fee_plans")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("amount", input.amount)
    .maybeSingle();

  await adminClient.from("charges").insert({
    enrollment_id: input.enrollmentId,
    fee_plan_id: feePlan?.id ?? null,
    amount: input.amount,
    due_date: toIsoDate(resolveMonthDueDate(input.startsOn, billingPeriodDate)),
    status: "pending",
    billing_period: billingPeriod,
  });
}

function toPaymentHistoryEntries(
  payments: ChargePaymentsRow["payments"],
): PaymentHistoryEntry[] {
  return (payments ?? [])
    .map((payment) => {
      const paidAt = payment.paid_at ?? payment.created_at ?? null;
      const amountValue = toNumber(payment.amount);

      return {
        id: payment.id,
        amountValue,
        amountLabel: formatTry(amountValue),
        paidAt,
        paidAtLabel: formatDateLabel(paidAt),
        paymentMethod: normalizePaymentMethod(payment.payment_method),
        paymentMethodLabel: getPaymentMethodLabel(payment.payment_method),
        referenceNo: payment.reference_no ?? "",
        note: payment.note ?? "",
      };
    })
    .sort((left, right) => {
      const leftDate = left.paidAt ? new Date(left.paidAt).getTime() : 0;
      const rightDate = right.paidAt ? new Date(right.paidAt).getTime() : 0;
      return rightDate - leftDate;
    });
}

function getMessageSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://elitsanatvesporkulubu.com";
}

async function buildReminderArtifacts(input: {
  organizationId: string;
  studentName: string;
  parentWhatsapp: string | null;
  programName: string;
  sessionSeriesLabel: string;
  amountLabel: string;
  remainingAmountLabel: string;
  billingPeriodLabel: string;
  dueDateLabel: string;
}) {
  const topic = await getMessageTopicByKey(input.organizationId, "payment_reminder_manual");
  const message = renderMessageTemplate(
    topic?.bodyTemplate ??
      "{{student_name}} icin bekleyen odeme bulunuyor.\nProgram: {{program_name}}\nGrup: {{session_series}}\nDonem: {{billing_period}}\nToplam: {{amount}}\nKalan: {{remaining_amount}}\nSon tarih: {{due_date}}\nPanel girisi: {{login_url}}",
    {
      student_name: input.studentName,
      program_name: input.programName,
      session_series: input.sessionSeriesLabel,
      billing_period: input.billingPeriodLabel,
      amount: input.amountLabel,
      remaining_amount: input.remainingAmountLabel,
      due_date: input.dueDateLabel,
      login_url: `${getMessageSiteUrl()}/login`,
    },
  );

  return {
    reminderPreview: message,
    webWhatsAppHref: input.parentWhatsapp
      ? buildWebWhatsAppHref({
          phone: input.parentWhatsapp,
          message,
        })
      : null,
  };
}

async function buildBillingChargeRecords(input: {
  organizationId: string;
  enrollments: EnrollmentBillingRow[];
  charges: ChargePaymentsRow[];
  parentLinks: ParentLinkRow[];
  auditRows?: Array<{
    event_type: string;
    actor_role: string | null;
    entity_id: string | null;
    payload: Record<string, unknown> | null;
    created_at: string | null;
  }>;
}) {
  const enrollmentMap = new Map(input.enrollments.map((enrollment) => [enrollment.id, enrollment]));
  const parentLinkMap = new Map<string, ParentLinkRow[]>();

  input.parentLinks.forEach((link) => {
    const bucket = parentLinkMap.get(link.student_id) ?? [];
    bucket.push(link);
    parentLinkMap.set(link.student_id, bucket);
  });
  const auditMap = new Map<string, AuditLogRow[]>();

  for (const row of input.auditRows ?? []) {
    if (!row.entity_id) {
      continue;
    }

    const bucket = auditMap.get(row.entity_id) ?? [];
    bucket.push({
      event: row.event_type,
      actor: row.actor_role ?? "Sistem",
      scope: "Finans",
      createdAt: formatDateLabel(row.created_at),
      createdAtValue: row.created_at,
      actorRole: row.actor_role ?? null,
      entityId: row.entity_id,
      entityType: "charges",
      detail: buildAuditDetail(row.payload),
    });
    auditMap.set(row.entity_id, bucket);
  }

  const records = await Promise.all(
    input.charges.map(async (charge) => {
      const enrollment = enrollmentMap.get(charge.enrollment_id);
      const student = getRelatedRecord(enrollment?.students);
      const program = getRelatedRecord(enrollment?.programs);
      const sessionSeries = getRelatedRecord(enrollment?.session_series);
      const parentLink = (parentLinkMap.get(student?.id ?? "") ?? [])[0];
      const parentProfile = getRelatedRecord(parentLink?.profiles);
      const history = toPaymentHistoryEntries(charge.payments);
      const totalAmountValue = toNumber(charge.amount);
      const paidAmountValue = history.reduce((sum, payment) => sum + payment.amountValue, 0);
      const remainingAmountValue = Math.max(totalAmountValue - paidAmountValue, 0);
      const paymentStatus = resolvePaymentLifecycleStatus({
        amount: totalAmountValue,
        totalPaid: paidAmountValue,
        anchorDate: charge.due_date ?? charge.created_at ?? enrollment?.starts_on ?? null,
      });
      const statusLabel = getPaymentLifecycleLabel(paymentStatus);
      const dueDateLabel = formatDateLabel(charge.due_date);
      const billingPeriodLabel = formatBillingPeriodLabel(charge.billing_period ?? charge.due_date);
      const sessionSeriesLabel = formatSessionSeriesLabel({
        title: sessionSeries?.title,
        startTime: sessionSeries?.start_time ?? null,
        weekdays: Array.isArray(sessionSeries?.weekdays) ? sessionSeries?.weekdays : [],
      });
      const { reminderPreview, webWhatsAppHref } = await buildReminderArtifacts({
        organizationId: input.organizationId,
        studentName: student?.full_name ?? "Sporcu",
        parentWhatsapp: parentProfile?.phone ?? null,
        programName: program?.title ?? "Program",
        sessionSeriesLabel,
        amountLabel: formatTry(totalAmountValue),
        remainingAmountLabel: formatTry(remainingAmountValue),
        billingPeriodLabel,
        dueDateLabel,
      });

      return {
        id: charge.id,
        enrollmentId: charge.enrollment_id,
        studentId: student?.id ?? "",
        studentName: student?.full_name ?? "Sporcu",
        studentInitials: getStudentInitials(student?.full_name ?? "Sporcu"),
        parentName: parentProfile?.full_name ?? "Veli",
        parentWhatsapp: parentProfile?.phone ?? null,
        programName: program?.title ?? "Program",
        sessionSeriesLabel,
        billingPeriod: charge.billing_period ?? charge.due_date ?? null,
        billingPeriodLabel,
        dueDate: charge.due_date ?? null,
        dueDateLabel,
        totalAmountValue,
        totalAmountLabel: formatTry(totalAmountValue),
        paidAmountValue,
        paidAmountLabel: formatTry(paidAmountValue),
        remainingAmountValue,
        remainingAmountLabel: formatTry(remainingAmountValue),
        lastPaymentAt: history[0]?.paidAt ?? null,
        lastPaymentLabel: history[0]?.paidAtLabel ?? null,
        paymentStatus,
        statusLabel,
        statusTone: getPaymentLifecycleTone(paymentStatus),
        history,
        auditTrail: (auditMap.get(charge.id) ?? []).sort((left, right) => {
          const leftTime = left.createdAtValue ? new Date(left.createdAtValue).getTime() : 0;
          const rightTime = right.createdAtValue ? new Date(right.createdAtValue).getTime() : 0;
          return rightTime - leftTime;
        }),
        reminderPreview,
        webWhatsAppHref,
      } satisfies BillingChargeRecord;
    }),
  );

  return records.sort((left, right) => {
    const leftDate = left.dueDate ? new Date(left.dueDate).getTime() : 0;
    const rightDate = right.dueDate ? new Date(right.dueDate).getTime() : 0;
    return rightDate - leftDate;
  });
}

async function getOrganizationBillingData(organizationId: string): Promise<BillingDashboardData> {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return {
      charges: [],
      pendingCharges: [],
      overdueCharges: [],
      completedCharges: [],
      recentPayments: [],
      summary: {
        todayCollected: 0,
        openBalance: 0,
        collectionRate: 0,
        highestOpen: 0,
        openCount: 0,
        overdueCount: 0,
      },
    };
  }

  await ensureMonthlyChargesForOrganization(organizationId);

  const { data: enrollments } = await adminClient
    .from("enrollments")
    .select(
      "id, student_id, starts_on, status, program_id, session_series_id, students!inner(id, full_name, organization_id), programs(id, title, monthly_price, age_band), session_series(id, title, start_time, weekdays)",
    )
    .eq("students.organization_id", organizationId);

  const enrollmentRows = (enrollments ?? []) as EnrollmentBillingRow[];
  const enrollmentIds = enrollmentRows.map((enrollment) => enrollment.id);
  const studentIds = Array.from(new Set(enrollmentRows.map((enrollment) => enrollment.student_id)));

  const [{ data: charges }, { data: parentLinks }] = await Promise.all([
    adminClient
      .from("charges")
      .select(
        "id, enrollment_id, amount, due_date, status, created_at, billing_period, payments(id, amount, payment_method, created_at, paid_at, reference_no, note)",
      )
      .in("enrollment_id", enrollmentIds.length ? enrollmentIds : ["00000000-0000-0000-0000-000000000000"]),
    adminClient
      .from("parent_student_links")
      .select("student_id, parent_profile_id, profiles(id, full_name, phone)")
      .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]),
  ]);

  const chargeIds = (charges ?? []).map((charge) => charge.id);
  const { data: auditRows } = await adminClient
      .from("audit_logs")
      .select("event_type, actor_role, entity_id, payload, created_at")
      .eq("organization_id", organizationId)
      .eq("scope", "Finans")
      .in("entity_id", chargeIds.length ? chargeIds : ["00000000-0000-0000-0000-000000000000"]);

  const chargeRecords = await buildBillingChargeRecords({
    organizationId,
    enrollments: enrollmentRows,
    charges: (charges ?? []) as ChargePaymentsRow[],
    parentLinks: (parentLinks ?? []) as ParentLinkRow[],
    auditRows: (auditRows ?? []) as Array<{
      event_type: string;
      actor_role: string | null;
      entity_id: string | null;
      payload: Record<string, unknown> | null;
      created_at: string | null;
    }>,
  });

  const pendingCharges = chargeRecords.filter((charge) => charge.paymentStatus === "pending");
  const overdueCharges = chargeRecords.filter((charge) => charge.paymentStatus === "overdue");
  const completedCharges = chargeRecords.filter((charge) => charge.paymentStatus === "completed");
  const currentMonthKey = format(new Date(), "yyyy-MM");
  const currentMonthCharges = chargeRecords.filter((charge) => {
    const sourceDate = charge.billingPeriod ?? charge.dueDate;

    if (!sourceDate) {
      return false;
    }

    const parsed = new Date(sourceDate);
    if (Number.isNaN(parsed.getTime())) {
      return false;
    }

    return format(parsed, "yyyy-MM") === currentMonthKey;
  });
  const currentMonthOpenCharges = currentMonthCharges.filter((charge) => charge.paymentStatus !== "completed");
  const currentMonthOverdueCharges = currentMonthCharges.filter((charge) => charge.paymentStatus === "overdue");

  const recentPayments = chargeRecords
    .flatMap((charge) =>
      charge.history.map((payment) => ({
        ...payment,
        studentName: charge.studentName,
        programName: charge.programName,
        billingPeriodLabel: charge.billingPeriodLabel,
      })),
    )
    .sort((left, right) => {
      const leftDate = left.paidAt ? new Date(left.paidAt).getTime() : 0;
      const rightDate = right.paidAt ? new Date(right.paidAt).getTime() : 0;
      return rightDate - leftDate;
    });

  const today = startOfDay(new Date());
  const todayCollected = recentPayments
    .filter((payment) => {
      if (!payment.paidAt) {
        return false;
      }

      const paidAt = startOfDay(new Date(payment.paidAt));
      return paidAt.getTime() === today.getTime();
    })
    .reduce((sum, payment) => sum + payment.amountValue, 0);

  const openBalance = currentMonthOpenCharges.reduce((sum, charge) => sum + charge.remainingAmountValue, 0);
  const totalAmount = currentMonthCharges.reduce((sum, charge) => sum + charge.totalAmountValue, 0);
  const totalCollected = currentMonthCharges.reduce((sum, charge) => sum + charge.paidAmountValue, 0);
  const highestOpen = currentMonthOpenCharges.reduce((max, charge) => Math.max(max, charge.remainingAmountValue), 0);

  return {
    charges: chargeRecords,
    pendingCharges,
    overdueCharges,
    completedCharges,
    recentPayments,
    summary: {
      todayCollected,
      openBalance,
      collectionRate: totalAmount > 0 ? Math.round((totalCollected / totalAmount) * 100) : 0,
      highestOpen,
      openCount: currentMonthOpenCharges.length,
      overdueCount: currentMonthOverdueCharges.length,
    },
  };
}

export async function getManagerBillingDashboardData() {
  const auth = await getCurrentAuthContext();

  if (!auth?.userId || (auth.role !== "manager" && auth.role !== "admin")) {
    return {
      charges: [],
      pendingCharges: [],
      overdueCharges: [],
      completedCharges: [],
      recentPayments: [],
      summary: {
        todayCollected: 0,
        openBalance: 0,
        collectionRate: 0,
        highestOpen: 0,
        openCount: 0,
        overdueCount: 0,
      },
    } satisfies BillingDashboardData;
  }

  const context = await getOrCreateOrganizationContext(auth.userId);

  if (!context.organizationId) {
    return {
      charges: [],
      pendingCharges: [],
      overdueCharges: [],
      completedCharges: [],
      recentPayments: [],
      summary: {
        todayCollected: 0,
        openBalance: 0,
        collectionRate: 0,
        highestOpen: 0,
        openCount: 0,
        overdueCount: 0,
      },
    } satisfies BillingDashboardData;
  }

  return getOrganizationBillingData(context.organizationId);
}

export async function getParentBillingChargeRecords() {
  const auth = await getCurrentAuthContext();
  const adminClient = createSupabaseAdminClient();

  if (!auth?.userId || auth.role !== "parent" || !adminClient) {
    return [] as BillingChargeRecord[];
  }

  const { data: links } = await adminClient
    .from("parent_student_links")
    .select("student_id")
    .eq("parent_profile_id", auth.userId);

  const studentIds = (links ?? []).map((link) => link.student_id);

  if (!studentIds.length) {
    return [] as BillingChargeRecord[];
  }

  const { data: enrollments } = await adminClient
    .from("enrollments")
    .select(
      "id, student_id, starts_on, status, program_id, session_series_id, students!inner(id, full_name, organization_id), programs(id, title, monthly_price, age_band), session_series(id, title, start_time, weekdays)",
    )
    .in("student_id", studentIds);

  const organizationId = getRelatedRecord((enrollments ?? [])[0]?.students)?.organization_id ?? null;

  if (!organizationId) {
    return [] as BillingChargeRecord[];
  }

  await ensureMonthlyChargesForOrganization(organizationId);

  const enrollmentRows = (enrollments ?? []) as EnrollmentBillingRow[];
  const enrollmentIds = enrollmentRows.map((enrollment) => enrollment.id);
  const { data: charges } = await adminClient
    .from("charges")
    .select(
      "id, enrollment_id, amount, due_date, status, created_at, billing_period, payments(id, amount, payment_method, created_at, paid_at, reference_no, note)",
    )
    .in("enrollment_id", enrollmentIds.length ? enrollmentIds : ["00000000-0000-0000-0000-000000000000"]);
  const chargeIds = (charges ?? []).map((charge) => charge.id);
  const { data: auditRows } = await adminClient
    .from("audit_logs")
    .select("event_type, actor_role, entity_id, payload, created_at")
    .eq("organization_id", organizationId)
    .eq("scope", "Finans")
    .in("entity_id", chargeIds.length ? chargeIds : ["00000000-0000-0000-0000-000000000000"]);

  return buildBillingChargeRecords({
    organizationId,
    enrollments: enrollmentRows,
    charges: (charges ?? []) as ChargePaymentsRow[],
    parentLinks: [],
    auditRows: (auditRows ?? []) as Array<{
      event_type: string;
      actor_role: string | null;
      entity_id: string | null;
      payload: Record<string, unknown> | null;
      created_at: string | null;
    }>,
  });
}

export function buildStudentPaymentSummary(charge: BillingChargeRecord): StudentPaymentSummary {
  return {
    studentId: charge.studentId,
    studentName: charge.studentName,
    programName: charge.programName,
    sessionSeriesLabel: charge.sessionSeriesLabel,
    totalAmountValue: charge.totalAmountValue,
    totalAmountLabel: charge.totalAmountLabel,
    paidAmountValue: charge.paidAmountValue,
    paidAmountLabel: charge.paidAmountLabel,
    remainingAmountValue: charge.remainingAmountValue,
    remainingAmountLabel: charge.remainingAmountLabel,
    paymentStatus: charge.paymentStatus,
    statusLabel: charge.statusLabel,
    dueDateLabel: charge.dueDateLabel,
    billingPeriodLabel: charge.billingPeriodLabel,
  };
}
