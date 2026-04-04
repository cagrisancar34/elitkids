"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAuthContext } from "@/lib/auth";
import {
  createBranchSchema,
  createSeasonSchema,
  toggleBranchArchiveSchema,
  toggleBranchStatusSchema,
  toggleSeasonDefaultSchema,
  toggleSeasonStatusSchema,
  updateBranchSchema,
  updateOrganizationSettingsSchema,
  updateSeasonSchema,
} from "@/lib/schemas/app-forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SettingsActionState = {
  error: string | null;
  success: string | null;
};

async function getOrganizationIdForAdmin(userId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      error: "Supabase baglantisi kurulamadi.",
      organizationId: null,
    };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile?.organization_id) {
    return {
      error: "Kurum baglami cozulmedi.",
      organizationId: null,
    };
  }

  return {
    error: null,
    organizationId: profile.organization_id,
  };
}

async function requireAdminSettingsContext() {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "admin" || !auth.userId) {
    return {
      error: "Bu islem icin admin yetkisi gerekli.",
      auth: null,
      organizationId: null,
      supabase: null,
    };
  }

  const supabase = await createSupabaseServerClient();
  const context = await getOrganizationIdForAdmin(auth.userId);

  if (!supabase || !context.organizationId) {
    return {
      error: context.error ?? "Supabase baglantisi kurulamadi.",
      auth,
      organizationId: null,
      supabase: null,
    };
  }

  return {
    error: null,
    auth,
    organizationId: context.organizationId,
    supabase,
  };
}

function getMissingTableMessage(code: string | undefined, tableName: string) {
  if (code !== "PGRST205") {
    return null;
  }

  return `${tableName} tablosu henuz yok. 0003_settings_expansion.sql migration dosyasini calistir.`;
}

async function clearDefaultSeason(
  organizationId: string,
  currentSeasonId: string | null,
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
) {
  let query = supabase.from("seasons").update({ is_default: false }).eq("organization_id", organizationId);

  if (currentSeasonId) {
    query = query.neq("id", currentSeasonId);
  }

  return query;
}

export async function updateOrganizationSettingsAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "admin" || !auth.userId) {
    return {
      error: "Bu islem icin admin yetkisi gerekli.",
      success: null,
    };
  }

  const parsed = updateOrganizationSettingsSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    locale: formData.get("locale"),
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Kurum ayarlari formu gecersiz.",
      success: null,
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
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

  const { error: updateError } = await supabase
    .from("organizations")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      locale: parsed.data.locale,
      timezone: parsed.data.timezone,
    })
    .eq("id", profile.organization_id);

  if (updateError) {
    return {
      error: updateError.message,
      success: null,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/");

  return {
    error: null,
    success: "Kurum ayarlari guncellendi.",
  };
}

export async function createBranchAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  const parsed = createBranchSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    location: formData.get("location"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Sube formu gecersiz.",
      success: null,
    };
  }

  const { error } = await context.supabase.from("branches").insert({
    organization_id: context.organizationId,
    name: parsed.data.name,
    slug: parsed.data.slug,
    location: parsed.data.location,
    active: true,
  });

  if (error) {
    return {
      error: getMissingTableMessage(error.code, "Branches") ?? error.message,
      success: null,
    };
  }

  revalidatePath("/admin/settings");

  return {
    error: null,
    success: "Sube olusturuldu.",
  };
}

export async function createSeasonAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  const parsed = createSeasonSchema.safeParse({
    title: formData.get("title"),
    startsOn: formData.get("startsOn"),
    endsOn: formData.get("endsOn"),
    makeActive: formData.get("makeActive"),
    makeDefault: formData.get("makeDefault"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Sezon formu gecersiz.",
      success: null,
    };
  }

  if (parsed.data.makeActive === "yes") {
    const deactivateResult = await context.supabase
      .from("seasons")
      .update({ is_active: false })
      .eq("organization_id", context.organizationId);

    if (deactivateResult.error) {
      return {
        error:
          getMissingTableMessage(deactivateResult.error.code, "Seasons") ??
          deactivateResult.error.message,
        success: null,
      };
    }
  }

  if (parsed.data.makeDefault === "yes") {
    const clearDefaultResult = await clearDefaultSeason(
      context.organizationId,
      null,
      context.supabase,
    );

    if (clearDefaultResult.error) {
      return {
        error:
          getMissingTableMessage(clearDefaultResult.error.code, "Seasons") ??
          clearDefaultResult.error.message,
        success: null,
      };
    }
  }

  const { error } = await context.supabase.from("seasons").insert({
    organization_id: context.organizationId,
    title: parsed.data.title,
    starts_on: parsed.data.startsOn,
    ends_on: parsed.data.endsOn,
    is_active: parsed.data.makeActive === "yes",
    is_default: parsed.data.makeDefault === "yes",
  });

  if (error) {
    return {
      error: getMissingTableMessage(error.code, "Seasons") ?? error.message,
      success: null,
    };
  }

  revalidatePath("/admin/settings");

  return {
    error: null,
    success: "Sezon olusturuldu.",
  };
}

export async function updateBranchAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  const parsed = updateBranchSchema.safeParse({
    branchId: formData.get("branchId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    location: formData.get("location"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Sube guncelleme formu gecersiz.",
      success: null,
    };
  }

  const { error } = await context.supabase
    .from("branches")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      location: parsed.data.location,
    })
    .eq("id", parsed.data.branchId)
    .eq("organization_id", context.organizationId);

  if (error) {
    return {
      error: getMissingTableMessage(error.code, "Branches") ?? error.message,
      success: null,
    };
  }

  revalidatePath("/admin/settings");

  return {
    error: null,
    success: "Sube guncellendi.",
  };
}

export async function toggleBranchStatusAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  const parsed = toggleBranchStatusSchema.safeParse({
    branchId: formData.get("branchId"),
    nextState: formData.get("nextState"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Sube durum formu gecersiz.",
      success: null,
    };
  }

  const { error } = await context.supabase
    .from("branches")
    .update({ active: parsed.data.nextState === "active" })
    .eq("id", parsed.data.branchId)
    .eq("organization_id", context.organizationId);

  if (error) {
    return {
      error: getMissingTableMessage(error.code, "Branches") ?? error.message,
      success: null,
    };
  }

  revalidatePath("/admin/settings");

  return {
    error: null,
    success:
      parsed.data.nextState === "active"
        ? "Sube aktif hale getirildi."
        : "Sube pasif hale getirildi.",
  };
}

export async function toggleBranchArchiveAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  const parsed = toggleBranchArchiveSchema.safeParse({
    branchId: formData.get("branchId"),
    nextState: formData.get("nextState"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Sube arsiv formu gecersiz.",
      success: null,
    };
  }

  const payload =
    parsed.data.nextState === "archive"
      ? { archived_at: new Date().toISOString(), active: false }
      : { archived_at: null };

  const { error } = await context.supabase
    .from("branches")
    .update(payload)
    .eq("id", parsed.data.branchId)
    .eq("organization_id", context.organizationId);

  if (error) {
    return {
      error:
        error.code === "PGRST205" || error.code === "42703"
          ? "Branch archive alani henuz yok. 0004_settings_archive_default.sql migration dosyasini calistir."
          : error.message,
      success: null,
    };
  }

  revalidatePath("/admin/settings");

  return {
    error: null,
    success:
      parsed.data.nextState === "archive"
        ? "Sube guvenli bicimde arsive alindi."
        : "Sube arsivden cikarildi.",
  };
}

export async function updateSeasonAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  const parsed = updateSeasonSchema.safeParse({
    seasonId: formData.get("seasonId"),
    title: formData.get("title"),
    startsOn: formData.get("startsOn"),
    endsOn: formData.get("endsOn"),
    makeActive: formData.get("makeActive"),
    makeDefault: formData.get("makeDefault"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Sezon guncelleme formu gecersiz.",
      success: null,
    };
  }

  if (parsed.data.makeActive === "yes") {
    const deactivateResult = await context.supabase
      .from("seasons")
      .update({ is_active: false })
      .eq("organization_id", context.organizationId)
      .neq("id", parsed.data.seasonId);

    if (deactivateResult.error) {
      return {
        error:
          getMissingTableMessage(deactivateResult.error.code, "Seasons") ??
          deactivateResult.error.message,
        success: null,
      };
    }
  }

  if (parsed.data.makeDefault === "yes") {
    const clearDefaultResult = await clearDefaultSeason(
      context.organizationId,
      parsed.data.seasonId,
      context.supabase,
    );

    if (clearDefaultResult.error) {
      return {
        error:
          clearDefaultResult.error.code === "PGRST205" ||
          clearDefaultResult.error.code === "42703"
            ? "Season default alani henuz yok. 0004_settings_archive_default.sql migration dosyasini calistir."
            : clearDefaultResult.error.message,
        success: null,
      };
    }
  }

  const { error } = await context.supabase
    .from("seasons")
    .update({
      title: parsed.data.title,
      starts_on: parsed.data.startsOn,
      ends_on: parsed.data.endsOn,
      is_active: parsed.data.makeActive === "yes",
      is_default: parsed.data.makeDefault === "yes",
    })
    .eq("id", parsed.data.seasonId)
    .eq("organization_id", context.organizationId);

  if (error) {
    return {
      error: getMissingTableMessage(error.code, "Seasons") ?? error.message,
      success: null,
    };
  }

  revalidatePath("/admin/settings");

  return {
    error: null,
    success: "Sezon guncellendi.",
  };
}

export async function toggleSeasonStatusAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  const parsed = toggleSeasonStatusSchema.safeParse({
    seasonId: formData.get("seasonId"),
    nextState: formData.get("nextState"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Sezon durum formu gecersiz.",
      success: null,
    };
  }

  if (parsed.data.nextState === "active") {
    const deactivateResult = await context.supabase
      .from("seasons")
      .update({ is_active: false })
      .eq("organization_id", context.organizationId)
      .neq("id", parsed.data.seasonId);

    if (deactivateResult.error) {
      return {
        error:
          getMissingTableMessage(deactivateResult.error.code, "Seasons") ??
          deactivateResult.error.message,
        success: null,
      };
    }
  }

  const { error } = await context.supabase
    .from("seasons")
    .update({ is_active: parsed.data.nextState === "active" })
    .eq("id", parsed.data.seasonId)
    .eq("organization_id", context.organizationId);

  if (error) {
    return {
      error: getMissingTableMessage(error.code, "Seasons") ?? error.message,
      success: null,
    };
  }

  revalidatePath("/admin/settings");

  return {
    error: null,
    success:
      parsed.data.nextState === "active"
        ? "Sezon aktif hale getirildi."
        : "Sezon planli duruma alindi.",
  };
}

export async function toggleSeasonDefaultAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireAdminSettingsContext();

  if (!context.supabase || !context.organizationId) {
    return { error: context.error, success: null };
  }

  const parsed = toggleSeasonDefaultSchema.safeParse({
    seasonId: formData.get("seasonId"),
    nextState: formData.get("nextState"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Varsayilan sezon formu gecersiz.",
      success: null,
    };
  }

  if (parsed.data.nextState === "default") {
    const clearDefaultResult = await clearDefaultSeason(
      context.organizationId,
      parsed.data.seasonId,
      context.supabase,
    );

    if (clearDefaultResult.error) {
      return {
        error:
          clearDefaultResult.error.code === "PGRST205" ||
          clearDefaultResult.error.code === "42703"
            ? "Season default alani henuz yok. 0004_settings_archive_default.sql migration dosyasini calistir."
            : clearDefaultResult.error.message,
        success: null,
      };
    }
  }

  const { error } = await context.supabase
    .from("seasons")
    .update({ is_default: parsed.data.nextState === "default" })
    .eq("id", parsed.data.seasonId)
    .eq("organization_id", context.organizationId);

  if (error) {
    return {
      error:
        error.code === "PGRST205" || error.code === "42703"
          ? "Season default alani henuz yok. 0004_settings_archive_default.sql migration dosyasini calistir."
          : error.message,
      success: null,
    };
  }

  revalidatePath("/admin/settings");

  return {
    error: null,
    success:
      parsed.data.nextState === "default"
        ? "Varsayilan sezon etiketi guncellendi."
        : "Varsayilan sezon etiketi kaldirildi.",
  };
}
