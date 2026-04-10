"use server";

import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  DEMO_ROLE_COOKIE,
  getRoleHome,
  isAppRole,
  resolveUserRole,
} from "@/lib/auth";
import { logFailedAuthEvent } from "@/lib/audit";
import { consumeRateLimit } from "@/lib/rate-limit";
import { extractClientSecurityContextFromHeaders } from "@/lib/request-security";
import { credentialsSchema } from "@/lib/schemas/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig, isDemoAuthEnabled } from "@/lib/supabase/config";

export type AuthActionState = {
  error: string | null;
};

export async function signInWithDemoRole(formData: FormData) {
  if (!isDemoAuthEnabled()) {
    redirect("/login");
  }

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
  const headerStore = await headers();
  const securityContext = extractClientSecurityContextFromHeaders(headerStore);
  const rateLimit = consumeRateLimit({
    bucket: "auth:password-login",
    key: securityContext.submittedIp ?? securityContext.userAgent ?? "anonymous",
    limit: 10,
    windowMs: 5 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return {
      error: `Cok fazla giris denemesi yapildi. Lutfen ${rateLimit.retryAfterSeconds} saniye sonra tekrar dene.`,
    };
  }

  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    await logFailedAuthEvent({
      email: typeof formData.get("email") === "string" ? String(formData.get("email")) : null,
      route: "/login",
      reason: parsed.error.issues[0]?.message ?? "Gecersiz giris verisi",
      submittedIp: securityContext.submittedIp,
      forwardedIp: securityContext.forwardedIp,
      userAgent: securityContext.userAgent,
      deviceSummary: securityContext.deviceSummary,
    });

    return {
      error: parsed.error.issues[0]?.message ?? "Bilgileri kontrol et.",
    };
  }

  const { isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return {
      error:
        "Supabase ortam degiskenleri eksik. Runtime ortaminda URL ve publishable key tanimlanmali.",
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
    await logFailedAuthEvent({
      email: parsed.data.email,
      route: "/login",
      reason: error?.message ?? "Supabase giris hatasi",
      submittedIp: securityContext.submittedIp,
      forwardedIp: securityContext.forwardedIp,
      userAgent: securityContext.userAgent,
      deviceSummary: securityContext.deviceSummary,
    });

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
    await logFailedAuthEvent({
      email: parsed.data.email,
      route: "/login",
      reason: "Uygulama rolu tanimli degil",
      submittedIp: securityContext.submittedIp,
      forwardedIp: securityContext.forwardedIp,
      userAgent: securityContext.userAgent,
      deviceSummary: securityContext.deviceSummary,
    });
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
