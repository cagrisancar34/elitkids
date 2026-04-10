import { addMonths, format, isWithinInterval, parseISO, startOfMonth, subDays } from "date-fns";

import type { AttendanceStatus } from "@/lib/types";

type SessionSeriesInput = {
  startsOn: string;
  endsOn: string;
  startTime: string;
  endTime: string;
  weekdays: number[];
};

type LessonCycleInput = {
  organizationId: string;
  studentId: string;
  enrollmentId: string;
  programId: string;
  startsOn: string;
  quota: number;
};

export function getLocalDayNumber(date: Date) {
  const native = date.getDay();
  return native === 0 ? 7 : native;
}

export function buildSessionOccurrences(input: SessionSeriesInput) {
  const occurrences: Array<{ startsAt: string; endsAt: string; dateLabel: string }> = [];
  const weekdays = new Set(input.weekdays);
  const cursor = new Date(`${input.startsOn}T00:00:00`);
  const end = new Date(`${input.endsOn}T00:00:00`);

  while (cursor <= end) {
    if (weekdays.has(getLocalDayNumber(cursor))) {
      const dateLabel = format(cursor, "yyyy-MM-dd");
      const startsAt = new Date(`${dateLabel}T${input.startTime}:00`);
      const endsAt = new Date(`${dateLabel}T${input.endTime}:00`);
      occurrences.push({
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        dateLabel,
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return occurrences;
}

export function buildMonthlyLessonCycle(input: LessonCycleInput) {
  const cycleStart = startOfMonth(parseISO(input.startsOn));
  const cycleEnd = subDays(addMonths(cycleStart, 1), 1);

  return {
    organization_id: input.organizationId,
    student_id: input.studentId,
    enrollment_id: input.enrollmentId,
    program_id: input.programId,
    cycle_start: format(cycleStart, "yyyy-MM-dd"),
    cycle_end: format(cycleEnd, "yyyy-MM-dd"),
    total_lessons: input.quota,
    used_lessons: 0,
    status: "active" as const,
  };
}

export function normalizeAttendanceStatusUi(status: AttendanceStatus) {
  if (status === "present") {
    return "Geldi";
  }

  if (status === "excused") {
    return "Izinli";
  }

  return "Gelmedi";
}

export function resolveAttendanceStatus(value: string): AttendanceStatus | null {
  if (value === "present" || value === "absent" || value === "excused") {
    return value;
  }

  return null;
}

export function cycleContainsSessionDate(cycleStart: string, cycleEnd: string, sessionDate: string) {
  return isWithinInterval(parseISO(sessionDate), {
    start: parseISO(cycleStart),
    end: parseISO(cycleEnd),
  });
}
