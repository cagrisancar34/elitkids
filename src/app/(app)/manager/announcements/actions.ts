"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import { createAnnouncementSchema } from "@/lib/schemas/app-forms";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

export type AnnouncementActionState = {
  error: string | null;
  success: string | null;
};

export async function createAnnouncementAction(
  _previousState: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "manager" && auth.role !== "admin")) {
    return {
      error: "Bu islem icin yetkin yok.",
      success: null,
    };
  }

  const parsed = createAnnouncementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    audienceRole: formData.get("audienceRole"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Duyuru bilgileri gecersiz.",
      success: null,
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase || !auth.userId) {
    return {
      error: "Supabase baglantisi kurulamadi.",
      success: null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", auth.userId)
    .maybeSingle();

  if (profileError || !profile?.organization_id) {
    return {
      error: "Kurum baglami cozulmedi.",
      success: null,
    };
  }

  const audienceRole =
    parsed.data.audienceRole === "all" ? null : parsed.data.audienceRole;

  const { error: insertError } = await supabase.from("announcements").insert({
    organization_id: profile.organization_id,
    title: parsed.data.title,
    body: parsed.data.body,
    audience_role: audienceRole,
    published_at: new Date().toISOString(),
  });

  if (insertError) {
    return {
      error: insertError.message,
      success: null,
    };
  }

  const adminClient = createSupabaseAdminClient();

  if (adminClient) {
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id, organization_id")
      .eq("organization_id", profile.organization_id);

    const profileIds = (profiles ?? []).map((item) => item.id);

    if (profileIds.length) {
      const rolesQuery = adminClient
        .from("user_roles")
        .select("profile_id, role")
        .in("profile_id", profileIds);

      const { data: roleRows } =
        audienceRole !== null
          ? await rolesQuery.eq("role", audienceRole)
          : await rolesQuery;

      const targetIds = Array.from(new Set((roleRows ?? []).map((row) => row.profile_id)));

      if (targetIds.length) {
        await adminClient.from("notifications").insert(
          targetIds.map((profileId) => ({
            profile_id: profileId,
            title: parsed.data.title,
            body: parsed.data.body,
            channel: "in_app",
          })),
        );
      }
    }
  }

  revalidatePath("/manager");
  revalidatePath("/manager/announcements");
  revalidatePath("/parent");
  revalidatePath("/coach");

  await logAuditEvent({
    organizationId: profile.organization_id,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Duyuru yayinlandi",
    scope: "Duyuru ve bildirim",
    entityType: "announcements",
    payload: {
      title: parsed.data.title,
      audienceRole: audienceRole ?? "all",
    },
  });

  return {
    error: null,
    success: "Duyuru yayinlandi ve bildirim kuyruguna eklendi.",
  };
}
