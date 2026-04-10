"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { getCurrentAuthContext } from "@/lib/auth";
import {
  createManagedUserSchema,
  updateUserRoleSchema,
} from "@/lib/schemas/app-forms";
import {
  createSupabaseAdminClient,
} from "@/lib/supabase/server";
import { getSupabaseServerConfig } from "@/lib/supabase/server-config";

export type AdminUserActionState = {
  error: string | null;
  success: string | null;
};

async function getCurrentOrganizationContext(userId: string) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return {
      error: "Supabase baglantisi kurulamadi.",
      organizationId: null,
      organizationSlug: null,
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
    };
  }

  if (profile?.organization_id) {
    const { data: organization } = await adminClient
      .from("organizations")
      .select("slug")
      .eq("id", profile.organization_id)
      .maybeSingle();

    return {
      error: null,
      organizationId: profile.organization_id,
      organizationSlug: organization?.slug ?? null,
    };
  }

  const { data: userDataResult, error: userDataError } = await adminClient.auth.admin.getUserById(userId);

  if (userDataError) {
    return {
      error: userDataError.message,
      organizationId: null,
      organizationSlug: null,
    };
  }

  const userData = userDataResult;
  const metadataOrgId =
    typeof userData.user?.app_metadata?.organization_id === "string"
      ? userData.user.app_metadata.organization_id
      : null;
  const metadataOrgSlug =
    typeof userData.user?.app_metadata?.organization_slug === "string"
      ? userData.user.app_metadata.organization_slug
      : null;

  let organizationId = metadataOrgId;
  let organizationSlug = metadataOrgSlug;

  if (!organizationId && metadataOrgSlug) {
    const { data: organizationBySlug, error: organizationBySlugError } = await adminClient
      .from("organizations")
      .select("id, slug")
      .eq("slug", metadataOrgSlug)
      .maybeSingle();

    if (organizationBySlugError) {
      return {
        error: organizationBySlugError.message,
        organizationId: null,
        organizationSlug: null,
      };
    }

    organizationId = organizationBySlug?.id ?? null;
    organizationSlug = organizationBySlug?.slug ?? metadataOrgSlug;
  }

  if (!organizationId) {
    const { data: organizations, error: organizationsError } = await adminClient
      .from("organizations")
      .select("id, slug")
      .limit(2);

    if (organizationsError) {
      return {
        error: organizationsError.message,
        organizationId: null,
        organizationSlug: null,
      };
    }

    if ((organizations?.length ?? 0) === 1) {
      organizationId = organizations?.[0]?.id ?? null;
      organizationSlug = organizations?.[0]?.slug ?? null;
    }
  }

  if (!organizationId) {
    return {
      error: "Kurum baglami cozulmedi.",
      organizationId: null,
      organizationSlug: null,
    };
  }

  const inferredFullName =
    profile?.full_name ??
    (typeof userData.user?.user_metadata?.full_name === "string"
      ? userData.user.user_metadata.full_name
      : null) ??
    (typeof userData.user?.email === "string"
      ? userData.user.email.split("@")[0]
      : null) ??
    "Admin Kullanici";

  const { error: upsertProfileError } = await adminClient.from("profiles").upsert(
    {
      id: userId,
      organization_id: organizationId,
      full_name: inferredFullName,
    },
    { onConflict: "id" },
  );

  if (upsertProfileError) {
    return {
      error: upsertProfileError.message,
      organizationId: null,
      organizationSlug: null,
    };
  }

  return {
    error: null,
    organizationId,
    organizationSlug,
  };
}

export async function createManagedUserAction(
  _previousState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "admin" || !auth.userId) {
    return {
      error: "Bu islem icin admin yetkisi gerekli.",
      success: null,
    };
  }

  const parsed = createManagedUserSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Kullanici bilgileri gecersiz.",
      success: null,
    };
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    const { isAdminConfigured } = getSupabaseServerConfig();

    return {
      error: isAdminConfigured
        ? "Supabase yonetici baglantisi kurulamadi."
        : "Kullanici olusturmak icin deploy ortaminda yonetici yazma secret'i tanimlanmali.",
      success: null,
    };
  }

  const orgContext = await getCurrentOrganizationContext(auth.userId);

  if (!orgContext.organizationId) {
    return {
      error: orgContext.error,
      success: null,
    };
  }

  const { data: userList } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  const existing = userList.users.find(
    (user) => user.email?.toLowerCase() === parsed.data.email.toLowerCase(),
  );

  if (existing) {
    return {
      error: "Bu e-posta ile tanimli bir auth hesabi zaten var.",
      success: null,
    };
  }

  const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    app_metadata: {
      app_role: parsed.data.role,
      organization_id: orgContext.organizationId,
      organization_slug: orgContext.organizationSlug,
    },
    user_metadata: {
      full_name: parsed.data.fullName,
    },
  });

  const userId = createdUser.user?.id;

  if (createUserError || !userId) {
    return {
      error: createUserError?.message ?? "Auth kullanicisi olusturulamadi.",
      success: null,
    };
  }

  const { error: profileError } = await adminClient.from("profiles").insert({
    id: userId,
    organization_id: orgContext.organizationId,
    full_name: parsed.data.fullName,
  });

  if (profileError) {
    await adminClient.auth.admin.deleteUser(userId);

    return {
      error: profileError.message,
      success: null,
    };
  }

  const { error: roleError } = await adminClient.from("user_roles").insert({
    profile_id: userId,
    role: parsed.data.role,
  });

  if (roleError) {
    await adminClient.from("profiles").delete().eq("id", userId);
    await adminClient.auth.admin.deleteUser(userId);

    return {
      error: roleError.message,
      success: null,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");

  await logAuditEvent({
    organizationId: orgContext.organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Yeni kullanici olusturuldu",
    scope: "Kullanici ve roller",
    entityType: "profiles",
    entityId: userId,
    payload: {
      email: parsed.data.email,
      role: parsed.data.role,
      fullName: parsed.data.fullName,
    },
  });

  return {
    error: null,
    success: `${parsed.data.fullName} kullanicisi ${parsed.data.role} rolu ile olusturuldu.`,
  };
}

export async function updateUserRoleAction(
  _previousState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "admin" || !auth.userId) {
    return {
      error: "Bu islem icin admin yetkisi gerekli.",
      success: null,
    };
  }

  const parsed = updateUserRoleSchema.safeParse({
    profileId: formData.get("profileId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Rol guncelleme formu gecersiz.",
      success: null,
    };
  }

  if (parsed.data.profileId === auth.userId && parsed.data.role !== "admin") {
    return {
      error: "Kendi admin rolunu dusuremezsin.",
      success: null,
    };
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    const { isAdminConfigured } = getSupabaseServerConfig();

    return {
      error: isAdminConfigured
        ? "Supabase baglantisi kurulamadi."
        : "Rol guncellemek icin deploy ortaminda yonetici yazma secret'i tanimlanmali.",
      success: null,
    };
  }

  const orgContext = await getCurrentOrganizationContext(auth.userId);

  const { error: deleteError } = await adminClient
    .from("user_roles")
    .delete()
    .eq("profile_id", parsed.data.profileId);

  if (deleteError) {
    return {
      error: deleteError.message,
      success: null,
    };
  }

  const { error: insertError } = await adminClient.from("user_roles").insert({
    profile_id: parsed.data.profileId,
    role: parsed.data.role,
  });

  if (insertError) {
    return {
      error: insertError.message,
      success: null,
    };
  }

  await adminClient.auth.admin.updateUserById(parsed.data.profileId, {
    app_metadata: {
      app_role: parsed.data.role,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");

  await logAuditEvent({
    organizationId: orgContext.organizationId,
    actorProfileId: auth.userId,
    actorRole: auth.role,
    eventType: "Kullanici rolu guncellendi",
    scope: "Kullanici ve roller",
    entityType: "user_roles",
    entityId: parsed.data.profileId,
    payload: {
      nextRole: parsed.data.role,
    },
  });
  revalidatePath("/manager");
  revalidatePath("/coach");
  revalidatePath("/parent");

  return {
    error: null,
    success: "Kullanici rolu guncellendi.",
  };
}
