import { createSupabaseAdminClient } from "@/lib/supabase/server";

type CreateOrganizationInput = {
  name: string;
  slug: string;
  locale: string;
  timezone: string;
};

export type OrganizationContext = {
  error: string | null;
  organizationId: string | null;
  organizationSlug: string | null;
  organization:
    | {
        id: string;
        name: string;
        slug: string;
        locale: string;
        timezone: string;
      }
    | null;
};

function inferFullName(input: { fullName?: string | null; email?: string | null }) {
  if (input.fullName) {
    return input.fullName;
  }

  if (input.email) {
    return input.email.split("@")[0] ?? "Admin Kullanici";
  }

  return "Admin Kullanici";
}

export async function getOrCreateOrganizationContext(
  userId: string,
  options?: {
    createIfMissing?: CreateOrganizationInput;
  },
): Promise<OrganizationContext> {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return {
      error: "Supabase yonetici baglantisi kurulamadi.",
      organizationId: null,
      organizationSlug: null,
      organization: null,
    };
  }

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("organization_id, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    return {
      error: profileError.message,
      organizationId: null,
      organizationSlug: null,
      organization: null,
    };
  }

  const { data: userDataResult, error: userDataError } = await adminClient.auth.admin.getUserById(userId);

  if (userDataError) {
    return {
      error: userDataError.message,
      organizationId: null,
      organizationSlug: null,
      organization: null,
    };
  }

  const user = userDataResult.user;
  const metadataOrgId =
    typeof user?.app_metadata?.organization_id === "string" ? user.app_metadata.organization_id : null;
  const metadataOrgSlug =
    typeof user?.app_metadata?.organization_slug === "string" ? user.app_metadata.organization_slug : null;

  let organization =
    profile?.organization_id
      ? (
          await adminClient
            .from("organizations")
            .select("id, name, slug, locale, timezone")
            .eq("id", profile.organization_id)
            .maybeSingle()
        ).data ?? null
      : null;

  if (!organization && metadataOrgId) {
    organization =
      (
        await adminClient
          .from("organizations")
          .select("id, name, slug, locale, timezone")
          .eq("id", metadataOrgId)
          .maybeSingle()
      ).data ?? null;
  }

  if (!organization && metadataOrgSlug) {
    organization =
      (
        await adminClient
          .from("organizations")
          .select("id, name, slug, locale, timezone")
          .eq("slug", metadataOrgSlug)
          .maybeSingle()
      ).data ?? null;
  }

  if (!organization) {
    const { data: organizations, error: organizationsError } = await adminClient
      .from("organizations")
      .select("id, name, slug, locale, timezone")
      .limit(2);

    if (organizationsError) {
      return {
        error: organizationsError.message,
        organizationId: null,
        organizationSlug: null,
        organization: null,
      };
    }

    if ((organizations?.length ?? 0) === 1) {
      organization = organizations?.[0] ?? null;
    }
  }

  if (!organization && options?.createIfMissing) {
    const created = await adminClient
      .from("organizations")
      .insert({
        name: options.createIfMissing.name,
        slug: options.createIfMissing.slug,
        locale: options.createIfMissing.locale,
        timezone: options.createIfMissing.timezone,
      })
      .select("id, name, slug, locale, timezone")
      .single();

    if (created.error || !created.data) {
      return {
        error: created.error?.message ?? "Kurum olusturulamadi.",
        organizationId: null,
        organizationSlug: null,
        organization: null,
      };
    }

    organization = created.data;
  }

  if (!organization) {
    return {
      error: "Kurum baglami cozulmedi.",
      organizationId: null,
      organizationSlug: null,
      organization: null,
    };
  }

  const fullName = inferFullName({
    fullName:
      profile?.full_name ??
      (typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null),
    email: typeof user?.email === "string" ? user.email : null,
  });

  const { error: upsertProfileError } = await adminClient.from("profiles").upsert(
    {
      id: userId,
      organization_id: organization.id,
      full_name: fullName,
    },
    { onConflict: "id" },
  );

  if (upsertProfileError) {
    return {
      error: upsertProfileError.message,
      organizationId: null,
      organizationSlug: null,
      organization: null,
    };
  }

  return {
    error: null,
    organizationId: organization.id,
    organizationSlug: organization.slug,
    organization,
  };
}
