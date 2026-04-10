import "server-only";

import { getCurrentAuthContext } from "@/lib/auth";
import { getOrCreateOrganizationContext } from "@/lib/organization-context";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  AppRole,
  MessageCampaign,
  MessageDeliveryStatus,
  MessageDispatch,
  RecipientSegment,
  WhatsAppCampaignOverview,
  WhatsAppSettingsOverview,
  WhatsAppTemplateDefinition,
  WhatsAppTemplateEventKey,
  WhatsAppSettingsStatus,
  WhatsAppOptInStatus,
} from "@/lib/types";
import { getWhatsAppServerConfig } from "@/lib/whatsapp-config";
import {
  DEFAULT_WHATSAPP_TEMPLATE_DEFINITIONS,
  WHATSAPP_EVENT_KEYS,
} from "@/lib/whatsapp";

type DispatchPayload = {
  variables: string[];
  meta?: Record<string, unknown>;
};

type QueueDispatchInput = {
  organizationId: string;
  eventKey: WhatsAppTemplateEventKey;
  recipientType: "profile" | "lead" | "pre_registration";
  recipientName: string;
  phone: string | null | undefined;
  payload: DispatchPayload;
  profileId?: string | null;
  leadSubmissionId?: string | null;
  preRegistrationId?: string | null;
  optInStatus?: WhatsAppOptInStatus;
  optInSource?: string | null;
  lastOptInAt?: string | null;
  campaignId?: string | null;
};

type CampaignFilters = {
  programId?: string | null;
  branchId?: string | null;
};

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function getNow() {
  return new Date();
}

function getIstanbulParts(date = getNow()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: Number(read("hour")),
    minute: Number(read("minute")),
    second: Number(read("second")),
  };
}

export function normalizeWhatsAppPhone(phone: string | null | undefined) {
  if (!phone) {
    return null;
  }

  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+90${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return `+9${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("90")) {
    return `+${digits}`;
  }

  if (digits.length === 13 && digits.startsWith("090")) {
    return `+9${digits.slice(1)}`;
  }

  return digits.startsWith("+") ? digits : null;
}

function toMetaPhoneNumber(phone: string) {
  return phone.replace(/\D/g, "");
}

function resolveScheduledFor(date = getNow()) {
  const parts = getIstanbulParts(date);

  if (parts.hour < 9) {
    return new Date(`${parts.year}-${parts.month}-${parts.day}T09:00:00+03:00`);
  }

  if (parts.hour >= 20) {
    const nextDay = new Date(`${parts.year}-${parts.month}-${parts.day}T09:00:00+03:00`);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    return nextDay;
  }

  return date;
}

function isImmediate(schedule: Date) {
  return schedule.getTime() <= getNow().getTime();
}

function getMissingConfigStatus(): WhatsAppSettingsStatus {
  const config = getWhatsAppServerConfig();

  return {
    configured: config.configured,
    missingKeys: config.missingKeys,
    phoneNumberId: config.phoneNumberId ?? null,
    businessAccountId: config.businessAccountId ?? null,
  };
}

async function requireOrgContext(roles: AppRole[]) {
  const auth = await getCurrentAuthContext();

  if (!auth?.userId || !roles.includes(auth.role)) {
    return {
      error: "Bu alan icin yetkin yok.",
      auth: null,
      organizationId: null,
      adminClient: null,
    };
  }

  const adminClient = createSupabaseAdminClient();
  const context = await getOrCreateOrganizationContext(auth.userId);

  if (!adminClient || !context.organizationId) {
    return {
      error: context.error ?? "Supabase baglantisi kurulamadi.",
      auth,
      organizationId: null,
      adminClient: null,
    };
  }

  return {
    error: null,
    auth,
    organizationId: context.organizationId,
    adminClient,
  };
}

export async function ensureWhatsAppTemplates(organizationId: string) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return;
  }

  const now = new Date().toISOString();
  await adminClient.from("whatsapp_templates").upsert(
    DEFAULT_WHATSAPP_TEMPLATE_DEFINITIONS.map((template) => ({
      organization_id: organizationId,
      event_key: template.eventKey,
      locale: template.locale,
      meta_template_name: template.metaTemplateName,
      enabled: template.enabled,
      variable_schema: template.variableSchema,
      updated_at: now,
    })),
    { onConflict: "organization_id,event_key,locale" },
  );
}

async function getTemplate(
  organizationId: string,
  eventKey: WhatsAppTemplateEventKey,
): Promise<WhatsAppTemplateDefinition | null> {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return null;
  }

  await ensureWhatsAppTemplates(organizationId);

  const { data } = await adminClient
    .from("whatsapp_templates")
    .select("id, event_key, locale, meta_template_name, enabled, variable_schema")
    .eq("organization_id", organizationId)
    .eq("event_key", eventKey)
    .eq("locale", "tr")
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    eventKey: data.event_key,
    locale: data.locale,
    metaTemplateName: data.meta_template_name ?? "",
    enabled: Boolean(data.enabled),
    variableSchema: toStringArray(data.variable_schema),
  };
}

async function upsertContact(
  input: QueueDispatchInput & { normalizedPhone: string | null },
) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient || !input.normalizedPhone) {
    return null;
  }

  const now = new Date().toISOString();
  const { data } = await adminClient
    .from("whatsapp_contacts")
    .upsert(
      {
        organization_id: input.organizationId,
        profile_id: input.profileId ?? null,
        lead_submission_id: input.leadSubmissionId ?? null,
        pre_registration_id: input.preRegistrationId ?? null,
        full_name: input.recipientName || null,
        phone: input.phone ?? null,
        normalized_phone: input.normalizedPhone,
        recipient_type: input.recipientType,
        opt_in_status: input.optInStatus ?? "unknown",
        opt_in_source: input.optInSource ?? null,
        last_opt_in_at: input.lastOptInAt ?? null,
        updated_at: now,
      },
      { onConflict: "organization_id,normalized_phone" },
    )
    .select("id")
    .maybeSingle();

  return data?.id ?? null;
}

async function updateDispatchStatus(
  dispatchId: string,
  input: {
    status: MessageDeliveryStatus;
    lastError?: string | null;
    providerMessageId?: string | null;
    sentAt?: string | null;
    deliveredAt?: string | null;
    readAt?: string | null;
    processedAt?: string | null;
  },
) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return;
  }

  await adminClient
    .from("message_dispatches")
    .update({
      status: input.status,
      last_error: input.lastError ?? null,
      provider_message_id: input.providerMessageId ?? null,
      sent_at: input.sentAt ?? null,
      delivered_at: input.deliveredAt ?? null,
      read_at: input.readAt ?? null,
      processed_at: input.processedAt ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dispatchId);
}

async function logDispatchEvent(
  dispatchId: string,
  providerStatus: string,
  providerPayload: Record<string, unknown>,
) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return;
  }

  await adminClient.from("message_logs").insert({
    dispatch_id: dispatchId,
    provider_status: providerStatus,
    provider_payload: providerPayload,
    delivered_at:
      providerStatus === "delivered" || providerStatus === "read" ? new Date().toISOString() : null,
    failed_at: providerStatus === "failed" ? new Date().toISOString() : null,
  });
}

async function sendTemplateMessage(
  template: WhatsAppTemplateDefinition,
  phone: string,
  variables: string[],
) {
  const config = getWhatsAppServerConfig();

  if (!config.configured || !config.accessToken || !config.phoneNumberId) {
    return {
      ok: false,
      error: config.missingKeys.join(", ") || "WhatsApp baglantisi eksik.",
    };
  }

  const response = await fetch(
    `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toMetaPhoneNumber(phone),
        type: "template",
        template: {
          name: template.metaTemplateName,
          language: { code: template.locale },
          components: variables.length
            ? [
                {
                  type: "body",
                  parameters: variables.map((text) => ({
                    type: "text",
                    text,
                  })),
                },
              ]
            : [],
        },
      }),
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | {
        error?: { message?: string };
        messages?: Array<{ id?: string }>;
      }
    | null;

  if (!response.ok) {
    return {
      ok: false,
      error: payload?.error?.message ?? "WhatsApp API istegi basarisiz.",
      payload,
    };
  }

  return {
    ok: true,
    providerMessageId: payload?.messages?.[0]?.id ?? null,
    payload,
  };
}

export async function processMessageDispatch(dispatchId: string) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return false;
  }

  const { data: dispatch } = await adminClient
    .from("message_dispatches")
    .select(
      "id, organization_id, event_key, recipient_phone, normalized_phone, payload_json, scheduled_for, status",
    )
    .eq("id", dispatchId)
    .maybeSingle();

  if (!dispatch?.id || dispatch.status !== "queued") {
    return false;
  }

  const scheduledFor = new Date(dispatch.scheduled_for);
  if (!isImmediate(scheduledFor)) {
    return false;
  }

  const template = await getTemplate(dispatch.organization_id, dispatch.event_key);
  if (!template || !template.enabled || !template.metaTemplateName) {
    await updateDispatchStatus(dispatch.id, {
      status: "blocked",
      lastError: "Etkin WhatsApp template eslesmesi bulunamadi.",
      processedAt: new Date().toISOString(),
    });
    return false;
  }

  if (!dispatch.normalized_phone) {
    await updateDispatchStatus(dispatch.id, {
      status: "blocked",
      lastError: "Gecerli WhatsApp numarasi bulunamadi.",
      processedAt: new Date().toISOString(),
    });
    return false;
  }

  const variables =
    dispatch.payload_json && typeof dispatch.payload_json === "object" && "variables" in dispatch.payload_json
      ? toStringArray((dispatch.payload_json as { variables?: unknown }).variables)
      : [];

  await updateDispatchStatus(dispatch.id, {
    status: "processing",
    processedAt: new Date().toISOString(),
  });

  const result = await sendTemplateMessage(template, dispatch.normalized_phone, variables);

  if (!result.ok) {
    await updateDispatchStatus(dispatch.id, {
      status: "failed",
      lastError: result.error,
      processedAt: new Date().toISOString(),
    });
    await logDispatchEvent(dispatch.id, "failed", {
      error: result.error,
      payload: result.payload ?? {},
    });
    return false;
  }

  await updateDispatchStatus(dispatch.id, {
    status: "sent",
    providerMessageId: result.providerMessageId ?? null,
    sentAt: new Date().toISOString(),
    processedAt: new Date().toISOString(),
  });
  await logDispatchEvent(dispatch.id, "sent", {
    provider_message_id: result.providerMessageId,
    payload: result.payload ?? {},
  });

  return true;
}

export async function processDueWhatsAppDispatches(limit = 25) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return 0;
  }

  const { data: rows } = await adminClient
    .from("message_dispatches")
    .select("id")
    .eq("status", "queued")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(limit);

  let processed = 0;

  for (const row of rows ?? []) {
    const ok = await processMessageDispatch(row.id);
    if (ok) {
      processed += 1;
    }
  }

  return processed;
}

export async function queueWhatsAppDispatch(input: QueueDispatchInput) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    throw new Error("Supabase admin baglantisi kurulamadi.");
  }

  const normalizedPhone = normalizeWhatsAppPhone(input.phone);
  const scheduledFor = resolveScheduledFor();
  const shouldBlockForOptIn = (input.optInStatus ?? "unknown") !== "opted_in";
  const contactId = await upsertContact({ ...input, normalizedPhone });
  const now = new Date().toISOString();

  const status: MessageDeliveryStatus = !normalizedPhone
    ? "blocked"
    : shouldBlockForOptIn
      ? "blocked"
      : "queued";

  const lastError = !normalizedPhone
    ? "Gecerli WhatsApp numarasi bulunamadi."
    : shouldBlockForOptIn
      ? "WhatsApp izin kaydi bulunmuyor."
      : null;

  const { data: dispatch, error } = await adminClient
    .from("message_dispatches")
    .insert({
      organization_id: input.organizationId,
      campaign_id: input.campaignId ?? null,
      channel: "whatsapp",
      event_key: input.eventKey,
      recipient_ref: {
        contactId,
        profileId: input.profileId ?? null,
        leadSubmissionId: input.leadSubmissionId ?? null,
        preRegistrationId: input.preRegistrationId ?? null,
      },
      recipient_name: input.recipientName || null,
      recipient_phone: input.phone ?? null,
      normalized_phone: normalizedPhone,
      payload_json: input.payload,
      status,
      scheduled_for: scheduledFor.toISOString(),
      last_error: lastError,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error || !dispatch?.id) {
    throw new Error(error?.message ?? "WhatsApp dispatch kuyruga yazilamadi.");
  }

  if (status === "queued" && isImmediate(scheduledFor)) {
    await processMessageDispatch(dispatch.id);
  }

  return dispatch.id;
}

async function getProfilePhoneMap(profileIds: string[]) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient || !profileIds.length) {
    return new Map<string, { name: string; phone: string | null }>();
  }

  const [{ data: profiles }, { data: contacts }] = await Promise.all([
    adminClient.from("profiles").select("id, full_name, phone").in("id", profileIds),
    adminClient
      .from("whatsapp_contacts")
      .select("profile_id, phone, normalized_phone, opt_in_status")
      .in("profile_id", profileIds),
  ]);

  const contactMap = new Map(
    (contacts ?? []).map((contact) => [
      contact.profile_id as string,
      {
        phone: (contact.phone as string | null) ?? (contact.normalized_phone as string | null),
      },
    ]),
  );

  return new Map(
    (profiles ?? []).map((profile) => [
      profile.id,
      {
        name: profile.full_name,
        phone: profile.phone ?? contactMap.get(profile.id)?.phone ?? null,
      },
    ]),
  );
}

export async function queueParentDispatchesForStudent(
  input: Omit<QueueDispatchInput, "recipientType" | "recipientName" | "phone" | "profileId" | "optInStatus"> & {
    studentId: string;
    optInSource?: string | null;
  },
) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return [];
  }

  const { data: links } = await adminClient
    .from("parent_student_links")
    .select("parent_profile_id")
    .eq("student_id", input.studentId);

  const parentIds = Array.from(new Set((links ?? []).map((link) => link.parent_profile_id)));
  const phoneMap = await getProfilePhoneMap(parentIds);
  const dispatchIds: string[] = [];

  for (const parentId of parentIds) {
    const target = phoneMap.get(parentId);
    const dispatchId = await queueWhatsAppDispatch({
      organizationId: input.organizationId,
      eventKey: input.eventKey,
      recipientType: "profile",
      recipientName: target?.name ?? "Veli",
      phone: target?.phone,
      profileId: parentId,
      optInStatus: target?.phone ? "opted_in" : "unknown",
      optInSource: input.optInSource ?? "panel",
      payload: input.payload,
      campaignId: input.campaignId,
    });
    dispatchIds.push(dispatchId);
  }

  return dispatchIds;
}

export async function queueReportCardUpdatedDispatch(input: {
  organizationId: string;
  studentId: string;
  studentName: string;
}) {
  const config = getWhatsAppServerConfig();
  return queueParentDispatchesForStudent({
    organizationId: input.organizationId,
    studentId: input.studentId,
    eventKey: "report_card_updated",
    payload: {
      variables: [input.studentName, `${config.appUrl}/login`],
      meta: {
        studentId: input.studentId,
      },
    },
    optInSource: "report_card_update",
  });
}

export async function queueAttendanceAbsentDispatch(input: {
  organizationId: string;
  sessionId: string;
  sessionTitle: string;
  sessionDate: string;
  studentId: string;
  studentName: string;
}) {
  return queueParentDispatchesForStudent({
    organizationId: input.organizationId,
    studentId: input.studentId,
    eventKey: "attendance_absent_manual",
    payload: {
      variables: [input.studentName, input.sessionTitle, input.sessionDate],
      meta: {
        sessionId: input.sessionId,
        studentId: input.studentId,
      },
    },
    optInSource: "attendance_absent_manual",
  });
}

export async function queuePaymentReminderDispatch(input: {
  organizationId: string;
  studentId: string;
  studentName: string;
  amount: string;
  dueDate: string;
}) {
  const config = getWhatsAppServerConfig();
  return queueParentDispatchesForStudent({
    organizationId: input.organizationId,
    studentId: input.studentId,
    eventKey: "payment_reminder_manual",
    payload: {
      variables: [input.studentName, input.amount, input.dueDate, `${config.appUrl}/login`],
      meta: {
        studentId: input.studentId,
      },
    },
    optInSource: "payment_reminder_manual",
  });
}

export async function queueRegistrationCompletedDispatch(input: {
  organizationId: string;
  recipientName: string;
  recipientPhone: string | null;
  recipientEmail: string;
  setupLink: string | null;
  profileId?: string | null;
  preRegistrationId?: string | null;
}) {
  const config = getWhatsAppServerConfig();

  return queueWhatsAppDispatch({
    organizationId: input.organizationId,
    eventKey: "registration_completed",
    recipientType: input.profileId ? "profile" : "pre_registration",
    recipientName: input.recipientName,
    phone: input.recipientPhone,
    profileId: input.profileId ?? null,
    preRegistrationId: input.preRegistrationId ?? null,
    optInStatus: input.recipientPhone ? "opted_in" : "unknown",
    optInSource: "registration_completed",
    payload: {
      variables: [
        `${config.appUrl}/login`,
        input.recipientEmail,
        input.setupLink ?? `${config.appUrl}/login`,
      ],
    },
  });
}

async function fetchProfilesByRole(
  organizationId: string,
  roles: Array<"parent" | "manager" | "coach" | "admin">,
) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return [] as Array<{ profileId: string; fullName: string; phone: string | null }>;
  }

  const { data: roleRows } = await adminClient
    .from("user_roles")
    .select("profile_id, role")
    .in("role", roles);

  const profileIds = Array.from(new Set((roleRows ?? []).map((row) => row.profile_id)));
  if (!profileIds.length) {
    return [];
  }

  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, full_name, phone")
    .eq("organization_id", organizationId)
    .in("id", profileIds);

  return (profiles ?? []).map((profile) => ({
    profileId: profile.id,
    fullName: profile.full_name,
    phone: profile.phone ?? null,
  }));
}

async function resolveCampaignRecipients(
  organizationId: string,
  audienceType: RecipientSegment,
  filters: CampaignFilters,
) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return [] as Array<{ profileId: string; fullName: string; phone: string | null }>;
  }

  if (audienceType === "all_staff") {
    return fetchProfilesByRole(organizationId, ["admin", "manager", "coach"]);
  }

  if (audienceType === "all_users") {
    return fetchProfilesByRole(organizationId, ["admin", "manager", "coach", "parent"]);
  }

  if (audienceType === "coaches") {
    return fetchProfilesByRole(organizationId, ["coach"]);
  }

  if (audienceType === "managers") {
    return fetchProfilesByRole(organizationId, ["manager", "admin"]);
  }

  if (audienceType === "all_parents") {
    return fetchProfilesByRole(organizationId, ["parent"]);
  }

  let studentIds: string[] = [];

  if (audienceType === "debt_parents") {
    const { data: charges } = await adminClient
      .from("charges")
      .select("status, enrollments(student_id, program_id)")
      .neq("status", "paid");

    studentIds = Array.from(
      new Set(
        (charges ?? [])
          .filter((charge) => {
            const enrollment = Array.isArray(charge.enrollments) ? charge.enrollments[0] : charge.enrollments;
            return filters.programId ? enrollment?.program_id === filters.programId : true;
          })
          .map((charge) => {
            const enrollment = Array.isArray(charge.enrollments) ? charge.enrollments[0] : charge.enrollments;
            return enrollment?.student_id ?? "";
          })
          .filter(Boolean),
      ),
    );
  }

  if (audienceType === "program_parents" && filters.programId) {
    const { data: enrollments } = await adminClient
      .from("enrollments")
      .select("student_id")
      .eq("program_id", filters.programId);
    studentIds = Array.from(new Set((enrollments ?? []).map((row) => row.student_id)));
  }

  if (audienceType === "branch_parents" && filters.branchId) {
    const { data: programs } = await adminClient
      .from("programs")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("branch_id", filters.branchId);
    const programIds = (programs ?? []).map((row) => row.id);
    const { data: enrollments } = await adminClient
      .from("enrollments")
      .select("student_id")
      .in("program_id", programIds.length ? programIds : ["00000000-0000-0000-0000-000000000000"]);
    studentIds = Array.from(new Set((enrollments ?? []).map((row) => row.student_id)));
  }

  if (!studentIds.length) {
    return [];
  }

  const { data: links } = await adminClient
    .from("parent_student_links")
    .select("parent_profile_id")
    .in("student_id", studentIds);
  const parentIds = Array.from(new Set((links ?? []).map((row) => row.parent_profile_id)));
  const phoneMap = await getProfilePhoneMap(parentIds);

  return parentIds.map((profileId) => ({
    profileId,
    fullName: phoneMap.get(profileId)?.name ?? "Veli",
    phone: phoneMap.get(profileId)?.phone ?? null,
  }));
}

export async function createWhatsAppCampaign(input: {
  organizationId: string;
  createdByProfileId: string;
  title: string;
  audienceType: RecipientSegment;
  message: string;
  filters: CampaignFilters;
}) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    throw new Error("Supabase admin baglantisi kurulamadi.");
  }

  const { data: campaign, error } = await adminClient
    .from("message_campaigns")
    .insert({
      organization_id: input.organizationId,
      title: input.title,
      audience_type: input.audienceType,
      filters_json: input.filters,
      template_or_freeform: input.message,
      created_by_profile_id: input.createdByProfileId,
      status: "queued",
    })
    .select("id")
    .single();

  if (error || !campaign?.id) {
    throw new Error(error?.message ?? "Kampanya olusturulamadi.");
  }

  const recipients = await resolveCampaignRecipients(
    input.organizationId,
    input.audienceType,
    input.filters,
  );

  for (const recipient of recipients) {
    await queueWhatsAppDispatch({
      organizationId: input.organizationId,
      eventKey: "bulk_broadcast",
      recipientType: "profile",
      recipientName: recipient.fullName,
      phone: recipient.phone,
      profileId: recipient.profileId,
      optInStatus: recipient.phone ? "opted_in" : "unknown",
      optInSource: "bulk_broadcast",
      campaignId: campaign.id,
      payload: {
        variables: [input.message],
        meta: {
          audienceType: input.audienceType,
        },
      },
    });
  }

  await adminClient
    .from("message_campaigns")
    .update({
      status: recipients.length ? "processing" : "failed",
      sent_at: recipients.length ? new Date().toISOString() : null,
    })
    .eq("id", campaign.id);

  return campaign.id;
}

export async function createRecoveryLinkForEmail(email: string, _fullName?: string | null) {
  const adminClient = createSupabaseAdminClient();
  const config = getWhatsAppServerConfig();

  if (!adminClient) {
    return null;
  }

  const { data } = await adminClient.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${config.appUrl}/login`,
    },
  });

  return data.properties?.action_link ?? null;
}

export async function createInviteLinkForEmail(email: string, _fullName?: string | null) {
  const adminClient = createSupabaseAdminClient();
  const config = getWhatsAppServerConfig();

  if (!adminClient) {
    return { actionLink: null, userId: null };
  }

  const { data } = await adminClient.auth.admin.generateLink({
    type: "invite",
    email,
    options: {
      redirectTo: `${config.appUrl}/login`,
    },
  });

  return {
    actionLink: data.properties?.action_link ?? null,
    userId: data.user?.id ?? null,
  };
}

export async function getWhatsAppSettingsOverview(): Promise<WhatsAppSettingsOverview | null> {
  const context = await requireOrgContext(["admin"]);

  if (!context.organizationId || !context.adminClient) {
    return null;
  }

  await ensureWhatsAppTemplates(context.organizationId);

  const [{ data: templates }, { data: dispatches }] = await Promise.all([
    context.adminClient
      .from("whatsapp_templates")
      .select("id, event_key, locale, meta_template_name, enabled, variable_schema")
      .eq("organization_id", context.organizationId)
      .order("event_key"),
    context.adminClient
      .from("message_dispatches")
      .select(
        "id, event_key, recipient_name, recipient_phone, status, scheduled_for, sent_at, delivered_at, read_at, last_error",
      )
      .eq("organization_id", context.organizationId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const mappedTemplates = (templates ?? []).map((template) => ({
    id: template.id,
    eventKey: template.event_key,
    locale: template.locale,
    metaTemplateName: template.meta_template_name ?? "",
    enabled: Boolean(template.enabled),
    variableSchema: toStringArray(template.variable_schema),
  })) satisfies WhatsAppTemplateDefinition[];

  const mappedDispatches = (dispatches ?? []).map((dispatch) => ({
    id: dispatch.id,
    eventKey: dispatch.event_key,
    recipientName: dispatch.recipient_name ?? "Alici",
    recipientPhone: dispatch.recipient_phone ?? "-",
    status: dispatch.status,
    scheduledFor: dispatch.scheduled_for,
    sentAt: dispatch.sent_at ?? null,
    deliveredAt: dispatch.delivered_at ?? null,
    readAt: dispatch.read_at ?? null,
    lastError: dispatch.last_error ?? null,
  })) satisfies MessageDispatch[];

  return {
    status: getMissingConfigStatus(),
    templates: mappedTemplates,
    dispatches: mappedDispatches,
    queueCount: mappedDispatches.filter((item) => item.status === "queued").length,
    blockedCount: mappedDispatches.filter((item) => item.status === "blocked").length,
  };
}

export async function getWhatsAppCampaignOverview(): Promise<WhatsAppCampaignOverview | null> {
  const context = await requireOrgContext(["admin", "manager"]);

  if (!context.organizationId || !context.adminClient) {
    return null;
  }

  await ensureWhatsAppTemplates(context.organizationId);

  const [{ data: templates }, { data: campaigns }, { data: dispatches }] = await Promise.all([
    context.adminClient
      .from("whatsapp_templates")
      .select("id, event_key, locale, meta_template_name, enabled, variable_schema")
      .eq("organization_id", context.organizationId)
      .order("event_key"),
    context.adminClient
      .from("message_campaigns")
      .select("id, title, audience_type, status, created_at, sent_at")
      .eq("organization_id", context.organizationId)
      .order("created_at", { ascending: false })
      .limit(8),
    context.adminClient
      .from("message_dispatches")
      .select(
        "id, event_key, recipient_name, recipient_phone, status, scheduled_for, sent_at, delivered_at, read_at, last_error",
      )
      .eq("organization_id", context.organizationId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return {
    templates: (templates ?? []).map((template) => ({
      id: template.id,
      eventKey: template.event_key,
      locale: template.locale,
      metaTemplateName: template.meta_template_name ?? "",
      enabled: Boolean(template.enabled),
      variableSchema: toStringArray(template.variable_schema),
    })) satisfies WhatsAppTemplateDefinition[],
    campaigns: (campaigns ?? []).map((campaign) => ({
      id: campaign.id,
      title: campaign.title,
      audienceType: campaign.audience_type,
      status: campaign.status,
      createdAt: campaign.created_at,
      sentAt: campaign.sent_at ?? null,
    })) satisfies MessageCampaign[],
    dispatches: (dispatches ?? []).map((dispatch) => ({
      id: dispatch.id,
      eventKey: dispatch.event_key,
      recipientName: dispatch.recipient_name ?? "Alici",
      recipientPhone: dispatch.recipient_phone ?? "-",
      status: dispatch.status,
      scheduledFor: dispatch.scheduled_for,
      sentAt: dispatch.sent_at ?? null,
      deliveredAt: dispatch.delivered_at ?? null,
      readAt: dispatch.read_at ?? null,
      lastError: dispatch.last_error ?? null,
    })) satisfies MessageDispatch[],
  };
}

export async function updateDispatchFromWebhook(input: {
  providerMessageId: string;
  status: "sent" | "delivered" | "read" | "failed";
  payload: Record<string, unknown>;
}) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return;
  }

  const { data: dispatch } = await adminClient
    .from("message_dispatches")
    .select("id")
    .eq("provider_message_id", input.providerMessageId)
    .maybeSingle();

  if (!dispatch?.id) {
    return;
  }

  const now = new Date().toISOString();
  await updateDispatchStatus(dispatch.id, {
    status: input.status,
    sentAt: input.status === "sent" ? now : undefined,
    deliveredAt: input.status === "delivered" ? now : undefined,
    readAt: input.status === "read" ? now : undefined,
    lastError: input.status === "failed" ? "Provider tarafindan basarisiz dondu." : undefined,
  });
  await logDispatchEvent(dispatch.id, input.status, input.payload);
}

export function getWhatsAppEventKeys() {
  return WHATSAPP_EVENT_KEYS;
}
