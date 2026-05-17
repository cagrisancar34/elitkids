import { NextResponse } from "next/server";

import { logAuditEvent } from "@/lib/audit";
import { buildRateLimitHeaders, consumeRateLimit } from "@/lib/rate-limit";
import { extractClientSecurityContext } from "@/lib/request-security";
import { createPreRegistrationSchema } from "@/lib/schemas/app-forms";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const securityContext = extractClientSecurityContext(request);
  const rateLimit = consumeRateLimit({
    bucket: "public:pre-registration-submit",
    key: securityContext.submittedIp ?? securityContext.userAgent ?? "anonymous",
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Cok fazla basvuru denemesi yapildi. Lutfen ${rateLimit.retryAfterSeconds} saniye sonra tekrar dene.` },
      { status: 429, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return NextResponse.json(
      { error: "Supabase admin baglantisi kurulamadi." },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  const parsed = createPreRegistrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Form verileri gecersiz." },
      { status: 400, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  const { data: organization } = await adminClient
    .from("organizations")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!organization?.id) {
    return NextResponse.json(
      { error: "Aktif kurum baglami bulunamadi." },
      { status: 400, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  const now = new Date().toISOString();
  const { data: preRegistration, error: insertError } = await adminClient
    .from("pre_registrations")
    .insert({
      organization_id: organization.id,
      branch_id: parsed.data.branchId || null,
      season_id: parsed.data.seasonId || null,
      program_id: parsed.data.programId || null,
      student_tc_identity_no: parsed.data.studentTcIdentityNo || null,
      student_full_name: parsed.data.studentFullName,
      student_birth_date: parsed.data.studentBirthDate,
      student_gender: parsed.data.studentGender,
      note: parsed.data.note,
      mother_name: parsed.data.motherName,
      mother_phone: parsed.data.motherPhone,
      mother_occupation: parsed.data.motherOccupation,
      father_name: parsed.data.fatherName,
      father_phone: parsed.data.fatherPhone,
      father_occupation: parsed.data.fatherOccupation,
      parent_email: parsed.data.parentEmail,
      parent_whatsapp: parsed.data.parentWhatsapp,
      address: parsed.data.address,
      emergency_contact: parsed.data.emergencyContact,
      custom_answers: parsed.data.customAnswers,
      kvkk_accepted_at: now,
      parent_permission_accepted_at: now,
      submitted_ip: securityContext.submittedIp,
      forwarded_ip: securityContext.forwardedIp,
      user_agent: securityContext.userAgent,
      device_summary: securityContext.deviceSummary,
      client_platform: securityContext.clientPlatform,
      client_browser: securityContext.clientBrowser,
      client_device_type: securityContext.clientDeviceType,
      submitted_at: now,
    })
    .select("id")
    .single();

  if (insertError || !preRegistration?.id) {
    return NextResponse.json(
      { error: insertError?.message ?? "On kayit olusturulamadi." },
      { status: 500, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  if (parsed.data.studentPhotoPath) {
    await adminClient.from("pre_registration_assets").insert({
      pre_registration_id: preRegistration.id,
      file_type: "student_photo",
      storage_path: parsed.data.studentPhotoPath,
      public_url: parsed.data.studentPhotoUrl || null,
    });
  }

  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id")
    .eq("organization_id", organization.id);

  const profileIds = (profiles ?? []).map((profile) => profile.id);

  if (profileIds.length) {
    const { data: roleRows } = await adminClient
      .from("user_roles")
      .select("profile_id, role")
      .in("profile_id", profileIds)
      .in("role", ["admin", "manager"]);

    const targetProfileIds = Array.from(new Set((roleRows ?? []).map((item) => item.profile_id)));

    if (targetProfileIds.length) {
      await adminClient.from("notifications").insert(
        targetProfileIds.map((profileId) => ({
          profile_id: profileId,
          title: "Yeni on kayit basvurusu",
          body: `${parsed.data.studentFullName} icin yeni on kayit basvurusu alindi.`,
          channel: "in_app",
        })),
      );
    }
  }

  await logAuditEvent({
    organizationId: organization.id,
    actorProfileId: null,
    actorRole: "public",
    eventType: "On kayit basvurusu olusturuldu",
    scope: "On kayit",
    entityType: "pre_registrations",
    entityId: preRegistration.id,
    payload: {
      studentFullName: parsed.data.studentFullName,
      studentGender: parsed.data.studentGender,
      parentEmail: parsed.data.parentEmail,
      programId: parsed.data.programId || null,
      branchId: parsed.data.branchId || null,
      security: {
        submittedIp: securityContext.submittedIp,
        forwardedIp: securityContext.forwardedIp,
        deviceSummary: securityContext.deviceSummary,
        clientPlatform: securityContext.clientPlatform,
        clientBrowser: securityContext.clientBrowser,
        clientDeviceType: securityContext.clientDeviceType,
      },
    },
  });

  return NextResponse.json({
    ok: true,
    id: preRegistration.id,
  }, {
    headers: buildRateLimitHeaders(rateLimit),
  });
}
