import { format } from "date-fns";

import { createRoleScopedTopicNotifications } from "@/lib/message-topics-server";
import { buildMonthlyLessonCycle, cycleContainsSessionDate } from "@/lib/program-workspace";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type SupabaseAdminClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;

type AllocationSource = "initial" | "bonus" | "renewal";
type AllocationStatus = "planned" | "consumed" | "cancelled";

type AllocationSummary = {
  allocatedLessons: number;
  consumedLessons: number;
  remainingLessons: number;
  nextAllocatedSessionAt: string | null;
  lastAllocatedSessionAt: string | null;
};

type SessionAllocationRow = {
  id: string;
  enrollment_id: string;
  student_id: string;
  session_id: string;
  session_series_id: string | null;
  sequence_no: number;
  source: AllocationSource;
  status: AllocationStatus;
  consumed_at: string | null;
};

type SessionTimeRow = {
  id: string;
  starts_at: string;
};

function resolveRelatedStudentName(
  studentRelation:
    | { full_name?: string | null }
    | Array<{ full_name?: string | null }>
    | null
    | undefined,
) {
  if (Array.isArray(studentRelation)) {
    return studentRelation[0]?.full_name ?? "Ogrenci";
  }

  return studentRelation?.full_name ?? "Ogrenci";
}

function resolveRelatedQuota(
  programRelation:
    | { monthly_lesson_quota?: number | null }
    | Array<{ monthly_lesson_quota?: number | null }>
    | null
    | undefined,
) {
  if (Array.isArray(programRelation)) {
    return Number(programRelation[0]?.monthly_lesson_quota ?? 8);
  }

  return Number(programRelation?.monthly_lesson_quota ?? 8);
}

function sessionDateKey(startsAt: string) {
  return startsAt.slice(0, 10);
}

function formatTodayKey() {
  return format(new Date(), "yyyy-MM-dd");
}

async function listEnrollmentAllocations(
  adminClient: SupabaseAdminClient,
  enrollmentId: string,
) {
  const { data } = await adminClient
    .from("enrollment_session_allocations")
    .select("id, enrollment_id, student_id, session_id, session_series_id, sequence_no, source, status, consumed_at")
    .eq("enrollment_id", enrollmentId)
    .order("sequence_no", { ascending: true });

  return (data ?? []) as SessionAllocationRow[];
}

async function listSessionTimes(
  adminClient: SupabaseAdminClient,
  sessionIds: string[],
) {
  if (!sessionIds.length) {
    return new Map<string, string>();
  }

  const { data } = await adminClient
    .from("sessions")
    .select("id, starts_at")
    .in("id", sessionIds);

  return new Map((data ?? []).map((session) => [session.id, session.starts_at]));
}

async function listEligibleSeriesSessions(
  adminClient: SupabaseAdminClient,
  input: {
    sessionSeriesId: string;
    startsOn: string;
    excludeSessionIds?: string[];
  },
) {
  const { data } = await adminClient
    .from("sessions")
    .select("id, starts_at")
    .eq("session_series_id", input.sessionSeriesId)
    .is("cancelled_at", null)
    .order("starts_at", { ascending: true });

  const excluded = new Set(input.excludeSessionIds ?? []);

  return ((data ?? []) as SessionTimeRow[]).filter(
    (session) =>
      sessionDateKey(session.starts_at) >= input.startsOn && !excluded.has(session.id),
  );
}

async function syncCycleUsageForEnrollment(
  adminClient: SupabaseAdminClient,
  input: {
    organizationId: string;
    studentId: string;
    enrollmentId: string;
    programId: string;
    startsOn: string;
  },
) {
  const allocations = await listEnrollmentAllocations(adminClient, input.enrollmentId);

  const { data: existingCycle } = await adminClient
    .from("student_package_cycles")
    .select("id, cycle_start, cycle_end")
    .eq("enrollment_id", input.enrollmentId)
    .eq("status", "active")
    .order("cycle_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sessionTimes = await listSessionTimes(
    adminClient,
    allocations.map((item) => item.session_id),
  );

  const deriveCycleUsage = (cycleStart: string, cycleEnd: string) => {
    const cycleAllocations = allocations.filter((allocation) => {
      const startsAt = sessionTimes.get(allocation.session_id);

      if (!startsAt || allocation.status === "cancelled") {
        return false;
      }

      return cycleContainsSessionDate(cycleStart, cycleEnd, sessionDateKey(startsAt));
    });

    return {
      totalLessons: cycleAllocations.length,
      consumedLessons: cycleAllocations.filter((allocation) => allocation.status === "consumed").length,
    };
  };

  if (existingCycle?.id) {
    const { totalLessons, consumedLessons } = deriveCycleUsage(
      existingCycle.cycle_start,
      existingCycle.cycle_end,
    );
    const nextPayload: { total_lessons?: number; used_lessons: number } = {
      used_lessons: Math.max(consumedLessons, 0),
    };

    if (totalLessons > 0) {
      nextPayload.total_lessons = totalLessons;
    }

    await adminClient.from("student_package_cycles").update(nextPayload).eq("id", existingCycle.id);
    return;
  }

  const draftCycle = buildMonthlyLessonCycle({
    organizationId: input.organizationId,
    studentId: input.studentId,
    enrollmentId: input.enrollmentId,
    programId: input.programId,
    startsOn: input.startsOn,
    quota: allocations.filter((item) => item.status !== "cancelled").length,
  });
  const { totalLessons, consumedLessons } = deriveCycleUsage(
    draftCycle.cycle_start,
    draftCycle.cycle_end,
  );

  if (totalLessons <= 0) {
    return;
  }

  await adminClient.from("student_package_cycles").insert(
    {
      ...draftCycle,
      total_lessons: totalLessons,
    },
  );

  await adminClient
    .from("student_package_cycles")
    .update({ used_lessons: Math.max(consumedLessons, 0) })
    .eq("enrollment_id", input.enrollmentId)
    .eq("status", "active");
}

async function createLessonStateNotifications(
  adminClient: SupabaseAdminClient,
  input: {
    organizationId: string;
    enrollmentId: string;
    studentName: string;
    remainingLessons: number;
  },
) {
  const notificationFlavor =
    input.remainingLessons === 0 ? "exhausted" : input.remainingLessons === 1 ? "warning" : null;

  if (!notificationFlavor) {
    return;
  }

  const channel = `lesson_rights:${input.enrollmentId}:${notificationFlavor}`;
  await createRoleScopedTopicNotifications({
    organizationId: input.organizationId,
    topicKey: "panel_notice_lesson_rights_expiring",
    channelKey: channel,
    variables: {
      student_name: input.studentName,
      remaining_lessons: input.remainingLessons,
    },
  });
}

async function syncEnrollmentDerivedState(
  adminClient: SupabaseAdminClient,
  input: {
    organizationId: string;
    enrollmentId: string;
    studentId: string;
    studentName: string;
    programId: string;
    startsOn: string;
  },
) {
  await syncPastAllocationsForEnrollment(adminClient, input.enrollmentId);
  await syncCycleUsageForEnrollment(adminClient, input);
  const summary = await getEnrollmentAllocationSummary(adminClient, input.enrollmentId);
  await createLessonStateNotifications(adminClient, {
    organizationId: input.organizationId,
    enrollmentId: input.enrollmentId,
    studentName: input.studentName,
    remainingLessons: summary.remainingLessons,
  });
}

export async function syncPastAllocationsForEnrollment(
  adminClient: SupabaseAdminClient,
  enrollmentId: string,
) {
  const allocations = await listEnrollmentAllocations(adminClient, enrollmentId);
  const plannedAllocations = allocations.filter((item) => item.status === "planned");

  if (!plannedAllocations.length) {
    return [] as string[];
  }

  const sessionTimes = await listSessionTimes(
    adminClient,
    plannedAllocations.map((item) => item.session_id),
  );
  const now = new Date();

  const expiredIds = plannedAllocations
    .filter((allocation) => {
      const startsAt = sessionTimes.get(allocation.session_id);
      return startsAt ? new Date(startsAt) < now : false;
    })
    .map((allocation) => allocation.id);

  if (!expiredIds.length) {
    return [] as string[];
  }

  await adminClient
    .from("enrollment_session_allocations")
    .update({
      status: "consumed",
      consumed_at: new Date().toISOString(),
    })
    .in("id", expiredIds);

  return expiredIds;
}

export async function syncPastAllocationsForOrganization(
  adminClient: SupabaseAdminClient,
  organizationId: string,
) {
  const { data: allocations } = await adminClient
    .from("enrollment_session_allocations")
    .select("id, enrollment_id, session_id, status")
    .eq("organization_id", organizationId)
    .eq("status", "planned");

  if (!allocations?.length) {
    return;
  }

  const sessionTimes = await listSessionTimes(
    adminClient,
    allocations.map((item) => item.session_id),
  );
  const now = new Date();
  const expiredIds = (allocations as Array<{ id: string; enrollment_id: string; session_id: string; status: string }>)
    .filter((allocation) => {
      const startsAt = sessionTimes.get(allocation.session_id);
      return startsAt ? new Date(startsAt) < now : false;
    })
    .map((allocation) => allocation.id);

  if (!expiredIds.length) {
    return;
  }

  await adminClient
    .from("enrollment_session_allocations")
    .update({
      status: "consumed",
      consumed_at: new Date().toISOString(),
    })
    .in("id", expiredIds);

  const affectedEnrollmentIds = Array.from(
    new Set(
      (allocations as Array<{ id: string; enrollment_id: string; session_id: string; status: string }>)
        .filter((allocation) => expiredIds.includes(allocation.id))
        .map((allocation) => allocation.enrollment_id),
    ),
  );

  if (!affectedEnrollmentIds.length) {
    return;
  }

  const { data: enrollments } = await adminClient
    .from("enrollments")
    .select("id, student_id, program_id, starts_on, students(full_name)")
    .in("id", affectedEnrollmentIds);

  for (const enrollment of enrollments ?? []) {
    await syncCycleUsageForEnrollment(adminClient, {
      organizationId,
      studentId: enrollment.student_id,
      enrollmentId: enrollment.id,
      programId: enrollment.program_id,
      startsOn: enrollment.starts_on ?? formatTodayKey(),
    });

    const summary = await getEnrollmentAllocationSummary(adminClient, enrollment.id);
    await createLessonStateNotifications(adminClient, {
      organizationId,
      enrollmentId: enrollment.id,
      studentName: resolveRelatedStudentName(
        enrollment.students as
          | { full_name?: string | null }
          | Array<{ full_name?: string | null }>
          | null
          | undefined,
      ),
      remainingLessons: summary.remainingLessons,
    });
  }
}

export async function backfillMissingAllocationsForOrganization(
  adminClient: SupabaseAdminClient,
  organizationId: string,
) {
  const { data: programs } = await adminClient
    .from("programs")
    .select("id")
    .eq("organization_id", organizationId);
  const programIds = (programs ?? []).map((program) => program.id);
  const { data: enrollments } = await adminClient
    .from("enrollments")
    .select("id, student_id, program_id, session_series_id, starts_on, programs(monthly_lesson_quota), students(full_name)")
    .eq("status", "active")
    .not("session_series_id", "is", null)
    .in("program_id", programIds.length ? programIds : ["00000000-0000-0000-0000-000000000000"]);

  if (!enrollments?.length) {
    return;
  }

  const enrollmentIds = enrollments.map((enrollment) => enrollment.id);
  const { data: existingAllocations } = await adminClient
    .from("enrollment_session_allocations")
    .select("enrollment_id")
    .in("enrollment_id", enrollmentIds);

  const populatedEnrollmentIds = new Set((existingAllocations ?? []).map((allocation) => allocation.enrollment_id));

  for (const enrollment of enrollments) {
    if (populatedEnrollmentIds.has(enrollment.id) || !enrollment.session_series_id) {
      continue;
    }

    await ensureEnrollmentSessionAllocations(adminClient, {
      organizationId,
      enrollmentId: enrollment.id,
      studentId: enrollment.student_id,
      studentName: resolveRelatedStudentName(
        enrollment.students as
          | { full_name?: string | null }
          | Array<{ full_name?: string | null }>
          | null
          | undefined,
      ),
      programId: enrollment.program_id,
      sessionSeriesId: enrollment.session_series_id,
      startsOn: enrollment.starts_on ?? formatTodayKey(),
      lessonCount: Math.max(
        resolveRelatedQuota(
          enrollment.programs as
            | { monthly_lesson_quota?: number | null }
            | Array<{ monthly_lesson_quota?: number | null }>
            | null
            | undefined,
        ),
        1,
      ),
    });
  }
}

export async function ensureEnrollmentSessionAllocations(
  adminClient: SupabaseAdminClient,
  input: {
    organizationId: string;
    enrollmentId: string;
    studentId: string;
    studentName: string;
    programId: string;
    sessionSeriesId: string;
    startsOn: string;
    lessonCount: number;
    source?: AllocationSource;
  },
) {
  const existingAllocations = await listEnrollmentAllocations(adminClient, input.enrollmentId);
  const existingSessionIds = existingAllocations.map((item) => item.session_id);
  const eligibleSessions = await listEligibleSeriesSessions(adminClient, {
    sessionSeriesId: input.sessionSeriesId,
    startsOn: input.startsOn,
    excludeSessionIds: existingSessionIds,
  });

  const startingSequence = existingAllocations.reduce(
    (maxSequence, allocation) => Math.max(maxSequence, allocation.sequence_no),
    0,
  );

  const inserts = eligibleSessions.slice(0, input.lessonCount).map((session, index) => ({
    organization_id: input.organizationId,
    enrollment_id: input.enrollmentId,
    student_id: input.studentId,
    session_id: session.id,
    session_series_id: input.sessionSeriesId,
    sequence_no: startingSequence + index + 1,
    source: input.source ?? "initial",
    status: "planned" as const,
  }));

  if (inserts.length) {
    await adminClient.from("enrollment_session_allocations").insert(inserts);
  }

  await syncEnrollmentDerivedState(adminClient, input);
  return inserts.length;
}

export async function rebuildUpcomingEnrollmentAllocations(
  adminClient: SupabaseAdminClient,
  input: {
    organizationId: string;
    enrollmentId: string;
    studentId: string;
    studentName: string;
    programId: string;
    sessionSeriesId: string;
    startsOn: string;
    targetTotalLessons: number;
  },
) {
  await syncPastAllocationsForEnrollment(adminClient, input.enrollmentId);
  const allocations = await listEnrollmentAllocations(adminClient, input.enrollmentId);
  const consumedCount = allocations.filter((allocation) => allocation.status === "consumed").length;
  const plannedAllocations = allocations.filter((allocation) => allocation.status === "planned");

  if (plannedAllocations.length) {
    await adminClient
      .from("enrollment_session_allocations")
      .delete()
      .in(
        "id",
        plannedAllocations.map((allocation) => allocation.id),
      );
  }

  const existingConsumeds = allocations.filter((allocation) => allocation.status === "consumed");
  const alreadyUsedSessionIds = existingConsumeds.map((allocation) => allocation.session_id);
  const remainingLessonCount = Math.max(input.targetTotalLessons - consumedCount, 0);
  const fromDate = [input.startsOn, formatTodayKey()].sort((left, right) =>
    left.localeCompare(right, "tr"),
  )[1];
  const eligibleSessions = await listEligibleSeriesSessions(adminClient, {
    sessionSeriesId: input.sessionSeriesId,
    startsOn: fromDate,
    excludeSessionIds: alreadyUsedSessionIds,
  });

  const nextSequenceBase = existingConsumeds.reduce(
    (maxSequence, allocation) => Math.max(maxSequence, allocation.sequence_no),
    0,
  );
  const inserts = eligibleSessions.slice(0, remainingLessonCount).map((session, index) => ({
    organization_id: input.organizationId,
    enrollment_id: input.enrollmentId,
    student_id: input.studentId,
    session_id: session.id,
    session_series_id: input.sessionSeriesId,
    sequence_no: nextSequenceBase + index + 1,
    source: "renewal" as const,
    status: "planned" as const,
  }));

  if (inserts.length) {
    await adminClient.from("enrollment_session_allocations").insert(inserts);
  }

  await syncEnrollmentDerivedState(adminClient, input);
  return inserts.length;
}

export async function renewEnrollmentLessonPackage(
  adminClient: SupabaseAdminClient,
  input: {
    organizationId: string;
    enrollmentId: string;
    studentId: string;
    studentName: string;
    programId: string;
    sessionSeriesId: string;
    startsOn: string;
    lessonCount: number;
  },
) {
  await syncPastAllocationsForEnrollment(adminClient, input.enrollmentId);
  const allocations = await listEnrollmentAllocations(adminClient, input.enrollmentId);
  const consumedAllocations = allocations.filter((allocation) => allocation.status === "consumed");
  const plannedAllocations = allocations.filter((allocation) => allocation.status === "planned");

  const eligibleSessions = await listEligibleSeriesSessions(adminClient, {
    sessionSeriesId: input.sessionSeriesId,
    startsOn: input.startsOn,
    excludeSessionIds: consumedAllocations.map((allocation) => allocation.session_id),
  });

  if (eligibleSessions.length < input.lessonCount) {
    return {
      ok: false as const,
      insertedCount: 0,
      availableCount: eligibleSessions.length,
      lastEligibleSessionAt: eligibleSessions.at(-1)?.starts_at ?? null,
    };
  }

  if (plannedAllocations.length) {
    await adminClient
      .from("enrollment_session_allocations")
      .delete()
      .in(
        "id",
        plannedAllocations.map((allocation) => allocation.id),
      );
  }

  await adminClient
    .from("student_package_cycles")
    .update({ status: "closed" })
    .eq("enrollment_id", input.enrollmentId)
    .eq("status", "active");

  await adminClient.from("student_package_cycles").insert(
    buildMonthlyLessonCycle({
      organizationId: input.organizationId,
      studentId: input.studentId,
      enrollmentId: input.enrollmentId,
      programId: input.programId,
      startsOn: input.startsOn,
      quota: input.lessonCount,
    }),
  );

  const nextSequenceBase = consumedAllocations.reduce(
    (maxSequence, allocation) => Math.max(maxSequence, allocation.sequence_no),
    0,
  );
  const inserts = eligibleSessions.slice(0, input.lessonCount).map((session, index) => ({
    organization_id: input.organizationId,
    enrollment_id: input.enrollmentId,
    student_id: input.studentId,
    session_id: session.id,
    session_series_id: input.sessionSeriesId,
    sequence_no: nextSequenceBase + index + 1,
    source: "renewal" as const,
    status: "planned" as const,
  }));

  if (inserts.length) {
    await adminClient.from("enrollment_session_allocations").insert(inserts);
  }

  await syncEnrollmentDerivedState(adminClient, {
    organizationId: input.organizationId,
    enrollmentId: input.enrollmentId,
    studentId: input.studentId,
    studentName: input.studentName,
    programId: input.programId,
    startsOn: input.startsOn,
  });

  return {
    ok: true as const,
    insertedCount: inserts.length,
    availableCount: eligibleSessions.length,
    lastEligibleSessionAt: eligibleSessions.at(input.lessonCount - 1)?.starts_at ?? null,
  };
}

export async function grantBonusLessonAllocations(
  adminClient: SupabaseAdminClient,
  input: {
    organizationId: string;
    enrollmentId: string;
    studentId: string;
    studentName: string;
    programId: string;
    sessionSeriesId: string;
    startsOn: string;
    lessonCount: number;
  },
) {
  return ensureEnrollmentSessionAllocations(adminClient, {
    ...input,
    lessonCount: input.lessonCount,
    source: "bonus",
  });
}

export async function markSessionAllocationConsumed(
  adminClient: SupabaseAdminClient,
  input: {
    organizationId: string;
    enrollmentId: string;
    studentId: string;
    studentName: string;
    programId: string;
    startsOn: string;
    sessionId: string;
  },
) {
  const { data: allocation } = await adminClient
    .from("enrollment_session_allocations")
    .select("id, status")
    .eq("enrollment_id", input.enrollmentId)
    .eq("student_id", input.studentId)
    .eq("session_id", input.sessionId)
    .maybeSingle();

  if (!allocation?.id || allocation.status === "consumed") {
    await syncEnrollmentDerivedState(adminClient, input);
    return;
  }

  await adminClient
    .from("enrollment_session_allocations")
    .update({
      status: "consumed",
      consumed_at: new Date().toISOString(),
    })
    .eq("id", allocation.id);

  await syncEnrollmentDerivedState(adminClient, input);
}

export async function getEnrollmentAllocationSummary(
  adminClient: SupabaseAdminClient,
  enrollmentId: string,
) {
  const allocations = await listEnrollmentAllocations(adminClient, enrollmentId);
  const activeAllocations = allocations.filter((allocation) => allocation.status !== "cancelled");
  const sessionTimes = await listSessionTimes(
    adminClient,
    activeAllocations.map((allocation) => allocation.session_id),
  );

  const sortedAllocations = activeAllocations.sort((left, right) => {
    const leftStartsAt = sessionTimes.get(left.session_id) ?? "";
    const rightStartsAt = sessionTimes.get(right.session_id) ?? "";
    return leftStartsAt.localeCompare(rightStartsAt, "tr");
  });
  const nextPlanned = sortedAllocations.find((allocation) => allocation.status === "planned");
  const lastAllocated = sortedAllocations.at(-1);
  const consumedLessons = sortedAllocations.filter((allocation) => allocation.status === "consumed").length;
  const allocatedLessons = sortedAllocations.length;

  return {
    allocatedLessons,
    consumedLessons,
    remainingLessons: Math.max(allocatedLessons - consumedLessons, 0),
    nextAllocatedSessionAt: nextPlanned ? sessionTimes.get(nextPlanned.session_id) ?? null : null,
    lastAllocatedSessionAt: lastAllocated ? sessionTimes.get(lastAllocated.session_id) ?? null : null,
  } satisfies AllocationSummary;
}

export async function getFirstAllocatedSessionForEnrollment(
  adminClient: SupabaseAdminClient,
  enrollmentId: string,
) {
  const allocations = await listEnrollmentAllocations(adminClient, enrollmentId);
  const activeAllocations = allocations.filter((allocation) => allocation.status !== "cancelled");

  if (!activeAllocations.length) {
    return null;
  }

  const sessionTimes = await listSessionTimes(
    adminClient,
    activeAllocations.map((allocation) => allocation.session_id),
  );

  const sortedAllocations = activeAllocations
    .map((allocation) => ({
      allocation,
      startsAt: sessionTimes.get(allocation.session_id) ?? null,
    }))
    .filter((entry) => entry.startsAt)
    .sort((left, right) => String(left.startsAt).localeCompare(String(right.startsAt), "tr"));

  return sortedAllocations.find((entry) => entry.allocation.status === "planned") ?? sortedAllocations[0] ?? null;
}

export async function getAllocationSummaryMap(
  adminClient: SupabaseAdminClient,
  enrollmentIds: string[],
) {
  if (!enrollmentIds.length) {
    return new Map<string, AllocationSummary>();
  }

  const { data } = await adminClient
    .from("enrollment_session_allocations")
    .select("id, enrollment_id, session_id, sequence_no, status")
    .in("enrollment_id", enrollmentIds);

  const allocations = data ?? [];
  const sessionIds = allocations.map((allocation) => allocation.session_id);
  const sessionTimes = await listSessionTimes(adminClient, sessionIds);
  const summaryEntries = new Map<string, AllocationSummary>();

  enrollmentIds.forEach((enrollmentId) => {
    const rows = allocations
      .filter((allocation) => allocation.enrollment_id === enrollmentId && allocation.status !== "cancelled")
      .sort((left, right) => {
        const leftStartsAt = sessionTimes.get(left.session_id) ?? "";
        const rightStartsAt = sessionTimes.get(right.session_id) ?? "";
        return leftStartsAt.localeCompare(rightStartsAt, "tr");
      });

    const nextPlanned = rows.find((allocation) => allocation.status === "planned");
    const lastAllocated = rows.at(-1);
    const consumedLessons = rows.filter((allocation) => allocation.status === "consumed").length;
    const allocatedLessons = rows.length;

    summaryEntries.set(enrollmentId, {
      allocatedLessons,
      consumedLessons,
      remainingLessons: Math.max(allocatedLessons - consumedLessons, 0),
      nextAllocatedSessionAt: nextPlanned ? sessionTimes.get(nextPlanned.session_id) ?? null : null,
      lastAllocatedSessionAt: lastAllocated ? sessionTimes.get(lastAllocated.session_id) ?? null : null,
    });
  });

  return summaryEntries;
}
