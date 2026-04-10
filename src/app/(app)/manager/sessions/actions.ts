"use server";

import { revalidatePath } from "next/cache";

import { getActorOrganizationId, logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import { buildSessionOccurrences } from "@/lib/program-workspace";
import {
  cancelSessionSeriesSchema,
  createSessionSeriesSchema,
  updateSessionSeriesSchema,
} from "@/lib/schemas/app-forms";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type SessionActionState = {
  error: string | null;
  success: string | null;
};

async function resolveSessionActionContext() {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "manager" && auth.role !== "admin") || !auth.userId) {
    return {
      auth: null,
      organizationId: null,
      adminClient: null,
      error: "Bu islem icin yetkin yok.",
    };
  }

  const organizationId = await getActorOrganizationId(auth.userId);
  const adminClient = createSupabaseAdminClient();

  if (!organizationId || !adminClient) {
    return {
      auth: null,
      organizationId: null,
      adminClient: null,
      error: "Kurum baglami cozulmedi.",
    };
  }

  return { auth, organizationId, adminClient, error: null };
}

async function validateSessionReferences(
  adminClient: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  organizationId: string,
  input: { programId: string; coachId: string; areaId: string },
) {
  const [program, coach, area] = await Promise.all([
    adminClient.from("programs").select("id, branch_id, title").eq("id", input.programId).eq("organization_id", organizationId).is("archived_at", null).maybeSingle(),
    adminClient.from("profiles").select("id, organization_id").eq("id", input.coachId).eq("organization_id", organizationId).maybeSingle(),
    adminClient.from("areas").select("id, name").eq("id", input.areaId).eq("organization_id", organizationId).maybeSingle(),
  ]);

  if (!program.data?.id) return { error: "Program bulunamadi.", programTitle: null, areaName: null };
  if (!coach.data?.id) return { error: "Egitmen bulunamadi.", programTitle: null, areaName: null };
  if (!area.data?.id) return { error: "Alan / Pist bulunamadi.", programTitle: null, areaName: null };
  return { error: null, programTitle: program.data.title ?? null, areaName: area.data.name ?? null };
}

function refreshSessionViews() {
  revalidatePath("/manager");
  revalidatePath("/manager/sessions");
  revalidatePath("/manager/attendance");
  revalidatePath("/coach");
  revalidatePath("/coach/sessions");
  revalidatePath("/parent");
  revalidatePath("/parent/schedule");
}

export async function createSessionSeriesAction(
  _previousState: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const context = await resolveSessionActionContext();

  if (context.error || !context.auth || !context.organizationId || !context.adminClient) {
    return {
      error: context.error ?? "Seans serisi icin gerekli baglam kurulamadi.",
      success: null,
    };
  }

  const parsed = createSessionSeriesSchema.safeParse({
    title: formData.get("title"),
    programId: formData.get("programId"),
    coachId: formData.get("coachId"),
    areaId: formData.get("areaId"),
    startsOn: formData.get("startsOn"),
    endsOn: formData.get("endsOn"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    weekdays: formData.getAll("weekdays"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Seans serisi formu gecersiz.",
      success: null,
    };
  }

  const referenceResult = await validateSessionReferences(context.adminClient, context.organizationId, parsed.data);
  if (referenceResult.error) {
    return {
      error: referenceResult.error,
      success: null,
    };
  }

  const title = parsed.data.title || referenceResult.programTitle || "Yeni Seans Serisi";
  const occurrences = buildSessionOccurrences(parsed.data);

  if (!occurrences.length) {
    return {
      error: "Secilen tarih araliginda seans uretilemedi.",
      success: null,
    };
  }

  const { data: createdSeries, error: seriesError } = await context.adminClient
    .from("session_series")
    .insert({
      organization_id: context.organizationId,
      program_id: parsed.data.programId,
      coach_profile_id: parsed.data.coachId,
      area_id: parsed.data.areaId,
      title,
      starts_on: parsed.data.startsOn,
      ends_on: parsed.data.endsOn,
      start_time: parsed.data.startTime,
      end_time: parsed.data.endTime,
      weekdays: parsed.data.weekdays,
      notes: parsed.data.notes,
    })
    .select("id")
    .single();

  if (seriesError || !createdSeries?.id) {
    return {
      error: seriesError?.message ?? "Seans serisi olusturulamadi.",
      success: null,
    };
  }

  const { error: sessionsError } = await context.adminClient.from("sessions").insert(
    occurrences.map((occurrence) => ({
      session_series_id: createdSeries.id,
      program_id: parsed.data.programId,
      coach_profile_id: parsed.data.coachId,
      title,
      starts_at: occurrence.startsAt,
      ends_at: occurrence.endsAt,
      location: referenceResult.areaName ?? "Alan belirtilmedi",
      area_id: parsed.data.areaId,
      notes: parsed.data.notes,
    })),
  );

  if (sessionsError) {
    return {
      error: sessionsError.message,
      success: null,
    };
  }

  refreshSessionViews();

  await logAuditEvent({
    organizationId: context.organizationId,
    actorProfileId: context.auth.userId,
    actorRole: context.auth.role,
    eventType: "Yeni seans serisi olusturuldu",
    scope: "Seanslar",
    entityType: "session_series",
    entityId: createdSeries.id,
    payload: {
      ...parsed.data,
      occurrenceCount: occurrences.length,
    },
  });

  return {
    error: null,
    success: `${occurrences.length} seanslik seri olusturuldu.`,
  };
}

export async function updateSessionAction(
  _previousState: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const context = await resolveSessionActionContext();

  if (context.error || !context.auth || !context.organizationId || !context.adminClient) {
    return {
      error: context.error ?? "Seans guncelleme baglami kurulamadi.",
      success: null,
    };
  }

  const parsed = updateSessionSeriesSchema.safeParse({
    sessionId: formData.get("sessionId"),
    scope: formData.get("scope"),
    title: formData.get("title"),
    programId: formData.get("programId"),
    coachId: formData.get("coachId"),
    areaId: formData.get("areaId"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Seans guncelleme formu gecersiz.",
      success: null,
    };
  }

  const { data: session, error: sessionError } = await context.adminClient
    .from("sessions")
    .select("id, session_series_id, program_id, starts_at")
    .eq("id", parsed.data.sessionId)
    .maybeSingle();

  if (sessionError || !session?.id) {
    return {
      error: "Seans bulunamadi.",
      success: null,
    };
  }

  const referenceResult = await validateSessionReferences(context.adminClient, context.organizationId, parsed.data);
  if (referenceResult.error) {
    return {
      error: referenceResult.error,
      success: null,
    };
  }

  const basePayload = {
    title: parsed.data.title,
    program_id: parsed.data.programId,
    coach_profile_id: parsed.data.coachId,
    starts_at: new Date(parsed.data.startsAt).toISOString(),
    ends_at: new Date(parsed.data.endsAt).toISOString(),
    area_id: parsed.data.areaId,
    notes: parsed.data.notes,
  };

  if (!session.session_series_id || parsed.data.scope === "single") {
    const { error } = await context.adminClient.from("sessions").update(basePayload).eq("id", parsed.data.sessionId);
    if (error) {
      return { error: error.message, success: null };
    }
  } else if (parsed.data.scope === "following") {
    const { error } = await context.adminClient
      .from("sessions")
      .update(basePayload)
      .eq("session_series_id", session.session_series_id)
      .gte("starts_at", session.starts_at);

    if (error) {
      return { error: error.message, success: null };
    }
  } else {
    const startsDate = new Date(parsed.data.startsAt);
    const endsDate = new Date(parsed.data.endsAt);
    const startTime = startsDate.toISOString().slice(11, 16);
    const endTime = endsDate.toISOString().slice(11, 16);

    const [sessionUpdate, seriesUpdate] = await Promise.all([
      context.adminClient.from("sessions").update(basePayload).eq("session_series_id", session.session_series_id),
      context.adminClient
        .from("session_series")
        .update({
          title: parsed.data.title,
          program_id: parsed.data.programId,
          coach_profile_id: parsed.data.coachId,
          area_id: parsed.data.areaId,
          start_time: startTime,
          end_time: endTime,
          notes: parsed.data.notes,
        })
        .eq("id", session.session_series_id),
    ]);

    if (sessionUpdate.error || seriesUpdate.error) {
      return {
        error: sessionUpdate.error?.message ?? seriesUpdate.error?.message ?? "Seri guncellenemedi.",
        success: null,
      };
    }
  }

  refreshSessionViews();

  await logAuditEvent({
    organizationId: context.organizationId,
    actorProfileId: context.auth.userId,
    actorRole: context.auth.role,
    eventType: "Seans guncellendi",
    scope: "Seanslar",
    entityType: "sessions",
    entityId: parsed.data.sessionId,
    payload: parsed.data,
  });

  return {
    error: null,
    success: "Seans kaydi guncellendi.",
  };
}

export async function cancelSessionAction(
  _previousState: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const context = await resolveSessionActionContext();

  if (context.error || !context.auth || !context.organizationId || !context.adminClient) {
    return {
      error: context.error ?? "Seans iptal baglami kurulamadi.",
      success: null,
    };
  }

  const parsed = cancelSessionSeriesSchema.safeParse({
    sessionId: formData.get("sessionId"),
    scope: formData.get("scope"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Seans secimi gecersiz.",
      success: null,
    };
  }

  const { data: session, error: sessionError } = await context.adminClient
    .from("sessions")
    .select("id, session_series_id, starts_at")
    .eq("id", parsed.data.sessionId)
    .maybeSingle();

  if (sessionError || !session?.id) {
    return {
      error: "Seans bulunamadi.",
      success: null,
    };
  }

  const cancelledAt = new Date().toISOString();

  if (!session.session_series_id || parsed.data.scope === "single") {
    const { error } = await context.adminClient.from("sessions").update({ cancelled_at: cancelledAt }).eq("id", parsed.data.sessionId);
    if (error) {
      return { error: error.message, success: null };
    }
  } else if (parsed.data.scope === "following") {
    const { error } = await context.adminClient
      .from("sessions")
      .update({ cancelled_at: cancelledAt })
      .eq("session_series_id", session.session_series_id)
      .gte("starts_at", session.starts_at);
    if (error) {
      return { error: error.message, success: null };
    }
  } else {
    const [sessionUpdate, seriesUpdate] = await Promise.all([
      context.adminClient.from("sessions").update({ cancelled_at: cancelledAt }).eq("session_series_id", session.session_series_id),
      context.adminClient.from("session_series").update({ status: "cancelled" }).eq("id", session.session_series_id),
    ]);

    if (sessionUpdate.error || seriesUpdate.error) {
      return {
        error: sessionUpdate.error?.message ?? seriesUpdate.error?.message ?? "Seri iptal edilemedi.",
        success: null,
      };
    }
  }

  refreshSessionViews();

  await logAuditEvent({
    organizationId: context.organizationId,
    actorProfileId: context.auth.userId,
    actorRole: context.auth.role,
    eventType: "Seans iptal edildi",
    scope: "Seanslar",
    entityType: "sessions",
    entityId: parsed.data.sessionId,
    payload: parsed.data,
  });

  return {
    error: null,
    success: "Seans kaydi iptal edildi.",
  };
}
