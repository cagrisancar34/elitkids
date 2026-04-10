import { createSupabaseAdminClient } from "@/lib/supabase/server";

type LogAuditEventInput = {
  organizationId?: string | null;
  actorProfileId?: string | null;
  actorRole?: string | null;
  eventType: string;
  scope: string;
  entityType?: string | null;
  entityId?: string | null;
  payload?: Record<string, unknown>;
};

type FailedAuthEventInput = {
  email?: string | null;
  route: string;
  reason: string;
  submittedIp?: string | null;
  forwardedIp?: string | null;
  userAgent?: string | null;
  deviceSummary?: string | null;
};

export async function logAuditEvent(input: LogAuditEventInput) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return;
  }

  const { error } = await adminClient.from("audit_logs").insert({
    organization_id: input.organizationId ?? null,
    actor_profile_id: input.actorProfileId ?? null,
    actor_role: input.actorRole ?? null,
    event_type: input.eventType,
    scope: input.scope,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    payload: input.payload ?? {},
  });

  if (error) {
    console.error("audit_log_failed", error.message);
  }
}

export async function getActorOrganizationId(actorProfileId: string | null | undefined) {
  if (!actorProfileId) {
    return null;
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return null;
  }

  const { data } = await adminClient
    .from("profiles")
    .select("organization_id")
    .eq("id", actorProfileId)
    .maybeSingle();

  return data?.organization_id ?? null;
}

export async function logFailedAuthEvent(input: FailedAuthEventInput) {
  await logAuditEvent({
    organizationId: null,
    actorProfileId: null,
    actorRole: "anonymous",
    eventType: "Auth denemesi basarisiz",
    scope: "Auth",
    entityType: "auth_attempt",
    entityId: null,
    payload: {
      email: input.email ?? null,
      route: input.route,
      reason: input.reason,
      submittedIp: input.submittedIp ?? null,
      forwardedIp: input.forwardedIp ?? null,
      userAgent: input.userAgent ?? null,
      deviceSummary: input.deviceSummary ?? null,
    },
  });
}
