"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  DEMO_ROLE_COOKIE,
  getRoleHome,
  isAppRole,
  resolveUserRole,
} from "@/lib/auth";
import { credentialsSchema } from "@/lib/schemas/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export type AuthActionState = {
  error: string | null;
};

export async function signInWithDemoRole(formData: FormData) {
  const candidateRole = formData.get("role");
  const demoRole = typeof candidateRole === "string" ? candidateRole : null;

  if (!isAppRole(demoRole)) {
    redirect("/login");
  }

  const { isConfigured } = getSupabaseConfig();
  const cookieStore = await cookies();

  if (isConfigured) {
    const supabase = await createSupabaseServerClient({ writeCookies: true });
    await supabase?.auth.signOut();
  }

  cookieStore.set(DEMO_ROLE_COOKIE, demoRole, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  redirect(getRoleHome(demoRole));
}

export async function signInWithPassword(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Bilgileri kontrol et.",
    };
  }

  const { isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return {
      error:
        "Supabase ortam degiskenleri eksik. .env.local dosyasina URL ve publishable key eklenmeli.",
    };
  }

  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient({ writeCookies: true });

  if (!supabase) {
    return {
      error: "Supabase istemcisi olusturulamadi.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return {
      error: error?.message ?? "Giris yapilamadi.",
    };
  }

  cookieStore.delete(DEMO_ROLE_COOKIE);

  const role = await resolveUserRole(data.user.id);
  const metadataRole =
    (typeof data.user.app_metadata?.app_role === "string" &&
    isAppRole(data.user.app_metadata.app_role)
      ? data.user.app_metadata.app_role
      : null) ??
    (typeof data.user.user_metadata?.app_role === "string" &&
    isAppRole(data.user.user_metadata.app_role)
      ? data.user.user_metadata.app_role
      : null);

  const resolvedRole = role ?? metadataRole;

  if (!resolvedRole) {
    await supabase.auth.signOut();
    return {
      error: "Bu hesap icin uygulama rolu tanimli degil.",
    };
  }

  redirect(getRoleHome(resolvedRole));
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_ROLE_COOKIE);

  const { isConfigured } = getSupabaseConfig();

  if (isConfigured) {
    const supabase = await createSupabaseServerClient({ writeCookies: true });
    await supabase?.auth.signOut();
  }

  redirect("/login");
}
