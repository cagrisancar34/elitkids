import { format } from "date-fns";

import { getCurrentAuthContext } from "@/lib/auth";
import { getOrCreateOrganizationContext } from "@/lib/organization-context";
import {
  defaultPreRegistrationSettings,
  mergePreRegistrationSettings,
} from "@/lib/pre-registration";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  PreRegistrationNote,
  PreRegistrationOption,
  PreRegistrationRecord,
  PreRegistrationSessionSeriesOption,
  PreRegistrationSettings,
  PreRegistrationStatus,
} from "@/lib/types";

type SettingsRow = {
  form_enabled: boolean;
  kvkk_title: string;
  kvkk_body: string;
  kvkk_checkbox_label: string;
  parent_permission_title: string;
  parent_permission_body: string;
  parent_permission_checkbox_label: string;
  success_message: string;
  helper_note: string;
};

type OptionBundle = {
  branches: PreRegistrationOption[];
  seasons: PreRegistrationOption[];
  programs: PreRegistrationOption[];
  sessionSeries: PreRegistrationSessionSeriesOption[];
};

const PRE_REGISTRATION_ASSET_BUCKET = "pre-registration-assets";

function mapSettings(row: SettingsRow | null | undefined): PreRegistrationSettings {
  if (!row) {
    return defaultPreRegistrationSettings;
  }

  return mergePreRegistrationSettings(defaultPreRegistrationSettings, {
    formEnabled: row.form_enabled,
    kvkkTitle: row.kvkk_title,
    kvkkBody: row.kvkk_body,
    kvkkCheckboxLabel: row.kvkk_checkbox_label,
    parentPermissionTitle: row.parent_permission_title,
    parentPermissionBody: row.parent_permission_body,
    parentPermissionCheckboxLabel: row.parent_permission_checkbox_label,
    successMessage: row.success_message,
    helperNote: row.helper_note,
  });
}

function formatDateLabel(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return format(new Date(value), "dd MMM yyyy");
}

function getRelatedName(value: unknown, field: "name" | "title") {
  if (Array.isArray(value)) {
    const first = value[0];
    if (first && typeof first === "object" && field in first) {
      return typeof first[field] === "string" ? first[field] : null;
    }

    return null;
  }

  if (value && typeof value === "object" && field in value) {
    const record = value as Record<string, unknown>;
    return typeof record[field] === "string" ? record[field] : null;
  }

  return null;
}

function getStatusLabel(status: PreRegistrationStatus) {
  if (status === "reviewing") {
    return "Incelemede";
  }

  if (status === "contacted") {
    return "Iletisime gecildi";
  }

  if (status === "approved") {
    return "Onaylandi";
  }

  if (status === "activated") {
    return "Aktif kayda donustu";
  }

  if (status === "rejected") {
    return "Reddedildi";
  }

  if (status === "archived") {
    return "Arsivlendi";
  }

  return "Yeni";
}

async function getSingleOrganizationId() {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return null;
  }

  const { data } = await adminClient
    .from("organizations")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

export async function getPreRegistrationOptionsForOrganization(
  organizationId: string | null | undefined,
): Promise<OptionBundle> {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient || !organizationId) {
    return {
      branches: [],
      seasons: [],
      programs: [],
      sessionSeries: [],
    };
  }

  const [{ data: branches }, { data: seasons }, { data: programs }, { data: sessionSeries }] = await Promise.all([
    adminClient
      .from("branches")
      .select("id, name")
      .eq("organization_id", organizationId)
      .eq("active", true)
      .is("archived_at", null)
      .order("name"),
    adminClient
      .from("seasons")
      .select("id, title")
      .eq("organization_id", organizationId)
      .order("starts_on", { ascending: false }),
    adminClient
      .from("programs")
      .select("id, title")
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .order("title"),
    adminClient
      .from("session_series")
      .select("id, title, program_id, start_time, weekdays")
      .in("status", ["active", "paused"])
      .order("starts_on", { ascending: true }),
  ]);

  const programLabelMap = new Map((programs ?? []).map((item) => [item.id, item.title]));
  const weekdayLabels: Record<number, string> = {
    1: "Pzt",
    2: "Sal",
    3: "Car",
    4: "Per",
    5: "Cum",
    6: "Cts",
    7: "Paz",
  };

  return {
    branches: (branches ?? []).map((item) => ({ id: item.id, label: item.name })),
    seasons: (seasons ?? []).map((item) => ({ id: item.id, label: item.title })),
    programs: (programs ?? []).map((item) => ({ id: item.id, label: item.title })),
    sessionSeries: (sessionSeries ?? [])
      .filter((item) => Boolean(programLabelMap.get(item.program_id)))
      .map((item) => ({
        id: item.id,
        programId: item.program_id,
        label: [
          item.title,
          Array.isArray(item.weekdays)
            ? item.weekdays.map((day) => weekdayLabels[Number(day)]).filter(Boolean).join(" / ")
            : "",
          item.start_time ?? "",
        ]
          .filter(Boolean)
          .join(" · "),
      })) satisfies PreRegistrationSessionSeriesOption[],
  };
}

export async function getPublicPreRegistrationPayload() {
  const adminClient = createSupabaseAdminClient();
  const organizationId = await getSingleOrganizationId();

  if (!adminClient || !organizationId) {
    return {
      settings: defaultPreRegistrationSettings,
      options: {
        branches: [],
        seasons: [],
        programs: [],
        sessionSeries: [],
      },
    };
  }

  const [{ data: settingsRow }, options] = await Promise.all([
    adminClient
      .from("pre_registration_settings")
      .select(
        "form_enabled, kvkk_title, kvkk_body, kvkk_checkbox_label, parent_permission_title, parent_permission_body, parent_permission_checkbox_label, success_message, helper_note",
      )
      .eq("organization_id", organizationId)
      .maybeSingle(),
    getPreRegistrationOptionsForOrganization(organizationId),
  ]);

  return {
    settings: mapSettings(settingsRow),
    options,
  };
}

export async function getAdminPreRegistrationSettings() {
  const auth = await getCurrentAuthContext();

  if (!auth?.userId) {
    return {
      organizationId: null,
      settings: defaultPreRegistrationSettings,
      error: "Oturum bulunamadi.",
    };
  }

  const context = await getOrCreateOrganizationContext(auth.userId);

  if (context.error || !context.organizationId) {
    return {
      organizationId: null,
      settings: defaultPreRegistrationSettings,
      error: context.error ?? "Kurum baglami cozulmedi.",
    };
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return {
      organizationId: context.organizationId,
      settings: defaultPreRegistrationSettings,
      error: "Supabase admin baglantisi kurulamadi.",
    };
  }

  const { data } = await adminClient
    .from("pre_registration_settings")
    .select(
      "form_enabled, kvkk_title, kvkk_body, kvkk_checkbox_label, parent_permission_title, parent_permission_body, parent_permission_checkbox_label, success_message, helper_note",
    )
    .eq("organization_id", context.organizationId)
    .maybeSingle();

  return {
    organizationId: context.organizationId,
    settings: mapSettings(data),
    error: null,
  };
}

export async function getOperatorPreRegistrations() {
  const auth = await getCurrentAuthContext();

  if (!auth?.userId || (auth.role !== "manager" && auth.role !== "admin")) {
    return {
      records: [] as PreRegistrationRecord[],
      options: {
        branches: [],
        seasons: [],
        programs: [],
        sessionSeries: [],
      },
      error: "Bu alan icin yetkin yok.",
    };
  }

  const context = await getOrCreateOrganizationContext(auth.userId);

  if (context.error || !context.organizationId) {
    return {
      records: [] as PreRegistrationRecord[],
      options: {
        branches: [],
        seasons: [],
        programs: [],
        sessionSeries: [],
      },
      error: context.error ?? "Kurum baglami cozulmedi.",
    };
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return {
      records: [] as PreRegistrationRecord[],
      options: {
        branches: [],
        seasons: [],
        programs: [],
        sessionSeries: [],
      },
      error: "Supabase admin baglantisi kurulamadi.",
    };
  }

  const [{ data: rows, error }, options] = await Promise.all([
    adminClient
      .from("pre_registrations")
      .select(
        "id, student_tc_identity_no, student_full_name, student_birth_date, note, parent_email, parent_whatsapp, emergency_contact, mother_name, mother_phone, mother_occupation, father_name, father_phone, father_occupation, address, branch_id, season_id, program_id, status, submitted_at, reviewed_at, reviewed_by_profile_id, activated_student_id, activated_parent_profile_id, kvkk_accepted_at, parent_permission_accepted_at, submitted_ip, forwarded_ip, user_agent, device_summary, client_platform, client_browser, client_device_type, branches(name), seasons(title), programs(title)",
      )
      .eq("organization_id", context.organizationId)
      .order("submitted_at", { ascending: false }),
    getPreRegistrationOptionsForOrganization(context.organizationId),
  ]);

  if (error || !rows?.length) {
    return {
      records: [] as PreRegistrationRecord[],
      options,
      error: error?.message ?? null,
    };
  }

  const preregIds = rows.map((row) => row.id);
  const reviewerIds = Array.from(
    new Set(rows.map((row) => row.reviewed_by_profile_id).filter((value): value is string => Boolean(value))),
  );

  const [{ data: assets }, { data: notes }, { data: reviewers }] = await Promise.all([
    adminClient
      .from("pre_registration_assets")
      .select("id, pre_registration_id, file_type, storage_path, public_url")
      .in("pre_registration_id", preregIds),
    adminClient
      .from("pre_registration_notes")
      .select("id, pre_registration_id, body, author_profile_id, created_at")
      .in("pre_registration_id", preregIds)
      .order("created_at", { ascending: false }),
    reviewerIds.length
      ? adminClient.from("profiles").select("id, full_name").in("id", reviewerIds)
      : Promise.resolve({ data: [] as Array<{ id: string; full_name: string }> }),
  ]);

  const reviewerMap = new Map((reviewers ?? []).map((item) => [item.id, item.full_name]));
  const assetMap = new Map<string, PreRegistrationRecord["assets"]>();
  const noteMap = new Map<string, PreRegistrationNote[]>();
  const signedAssetUrlMap = new Map<string, string>();

  const assetPaths = (assets ?? [])
    .filter((asset) => typeof asset.storage_path === "string" && asset.storage_path.length > 0)
    .map((asset) => asset.storage_path as string);

  if (assetPaths.length) {
    const signedUrlsResult = await adminClient.storage
      .from(PRE_REGISTRATION_ASSET_BUCKET)
      .createSignedUrls(assetPaths, 60 * 30);

    for (const item of signedUrlsResult.data ?? []) {
      if (item.path && item.signedUrl) {
        signedAssetUrlMap.set(item.path, item.signedUrl);
      }
    }
  }

  for (const asset of assets ?? []) {
    const current = assetMap.get(asset.pre_registration_id) ?? [];
    current.push({
      id: asset.id,
      fileType: asset.file_type,
      url:
        (typeof asset.storage_path === "string" && signedAssetUrlMap.get(asset.storage_path)) ??
        asset.public_url ??
        "",
    });
    assetMap.set(asset.pre_registration_id, current);
  }

  for (const note of notes ?? []) {
    const current = noteMap.get(note.pre_registration_id) ?? [];
    current.push({
      id: note.id,
      body: note.body,
      author: reviewerMap.get(note.author_profile_id ?? "") ?? "Ekip",
      createdAt: formatDateLabel(note.created_at),
    });
    noteMap.set(note.pre_registration_id, current);
  }

  const records = rows.map((row) => ({
    id: row.id,
    studentFullName: row.student_full_name,
    studentBirthDate: formatDateLabel(row.student_birth_date),
    tcIdentityNo: row.student_tc_identity_no ?? "",
    note: row.note ?? "",
    parentEmail: row.parent_email,
    parentWhatsapp: row.parent_whatsapp ?? "",
    emergencyContact: row.emergency_contact ?? "",
    motherName: row.mother_name ?? "",
    motherPhone: row.mother_phone ?? "",
    motherOccupation: row.mother_occupation ?? "",
    fatherName: row.father_name ?? "",
    fatherPhone: row.father_phone ?? "",
    fatherOccupation: row.father_occupation ?? "",
    address: row.address ?? "",
    branchId: row.branch_id,
    branchLabel: getRelatedName(row.branches, "name") ?? "Sube secilmedi",
    seasonId: row.season_id,
    seasonLabel: getRelatedName(row.seasons, "title") ?? "Sezon secilmedi",
    programId: row.program_id,
    programLabel: getRelatedName(row.programs, "title") ?? "Program secilmedi",
    status: row.status,
    statusLabel: getStatusLabel(row.status),
    submittedAt: formatDateLabel(row.submitted_at),
    reviewedAt: row.reviewed_at ? formatDateLabel(row.reviewed_at) : null,
    reviewedBy: row.reviewed_by_profile_id ? reviewerMap.get(row.reviewed_by_profile_id) ?? "Ekip" : null,
    activatedStudentId: row.activated_student_id,
    activatedParentProfileId: row.activated_parent_profile_id,
    kvkkAcceptedAt: row.kvkk_accepted_at,
    parentPermissionAcceptedAt: row.parent_permission_accepted_at,
    submittedIp: row.submitted_ip ?? null,
    forwardedIp: row.forwarded_ip ?? null,
    userAgent: row.user_agent ?? null,
    deviceSummary: row.device_summary ?? null,
    clientPlatform: row.client_platform ?? null,
    clientBrowser: row.client_browser ?? null,
    clientDeviceType: row.client_device_type ?? null,
    sourceLabel: "On kayit",
    assets: assetMap.get(row.id) ?? [],
    notes: noteMap.get(row.id) ?? [],
  })) satisfies PreRegistrationRecord[];

  return {
    records,
    options,
    error: null,
  };
}
