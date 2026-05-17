import { addDays, format, isAfter, parseISO, startOfDay } from "date-fns";

import type { PaymentLifecycleStatus } from "@/lib/types";

function toSafeNumber(value: number | string | null | undefined) {
  const normalized =
    typeof value === "string"
      ? Number(value.replace(/[^\d.-]/g, ""))
      : Number(value ?? 0);

  return Number.isFinite(normalized) ? normalized : 0;
}

function parseDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function resolveChargeAnchorDate(input: {
  enrollmentStartsOn?: string | null;
  chargeCreatedAt?: string | null;
  dueDate?: string | null;
}) {
  const enrollmentStartsOn = parseDate(input.enrollmentStartsOn);
  const chargeCreatedAt = parseDate(input.chargeCreatedAt);
  const dueDate = parseDate(input.dueDate);

  if (dueDate) {
    return dueDate.toISOString();
  }

  if (enrollmentStartsOn) {
    return enrollmentStartsOn.toISOString();
  }

  return chargeCreatedAt?.toISOString() ?? null;
}

export function resolvePaymentLifecycleStatus(input: {
  amount: number | string | null | undefined;
  totalPaid: number | string | null | undefined;
  anchorDate?: string | null;
  now?: Date;
}): PaymentLifecycleStatus {
  const amount = toSafeNumber(input.amount);
  const totalPaid = toSafeNumber(input.totalPaid);

  if (amount <= 0 || totalPaid >= amount) {
    return "completed";
  }

  const now = startOfDay(input.now ?? new Date());
  const anchor = startOfDay(parseDate(input.anchorDate) ?? now);
  const overdueStartsAt = addDays(anchor, 7);

  return isAfter(now, overdueStartsAt) ? "overdue" : "pending";
}

export function getPaymentLifecycleLabel(status: PaymentLifecycleStatus) {
  switch (status) {
    case "completed":
      return "Odeme Tamamlandi";
    case "overdue":
      return "Odeme Yapilmadi";
    default:
      return "Odeme Bekleniyor";
  }
}

export function getPaymentLifecycleTone(status: PaymentLifecycleStatus) {
  switch (status) {
    case "completed":
      return "emerald";
    case "overdue":
      return "rose";
    default:
      return "amber";
  }
}

export function resolveAggregatePaymentLifecycleStatus(
  statuses: PaymentLifecycleStatus[],
): PaymentLifecycleStatus {
  if (statuses.includes("overdue")) {
    return "overdue";
  }

  if (statuses.includes("pending")) {
    return "pending";
  }

  return "completed";
}

export function formatPaymentAnchorLabel(value: string | null | undefined) {
  const parsed = parseDate(value);

  if (!parsed) {
    return "Tarih bekleniyor";
  }

  return format(parsed, "dd MMM yyyy");
}
