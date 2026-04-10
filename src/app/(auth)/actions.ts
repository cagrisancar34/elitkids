"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { logFailedAuthEvent } from "@/lib/audit";
import { getRoleHome, isAppRole, resolveUserRole } from "@/lib/auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { extractClientSecurityContextFromHeaders } from "@/lib/request-security";
import { emailOnlySchema, passwordResetSchema } from "@/lib/schemas/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export type AuthFlowState = {
  error: string | null;
  success: string | null;
};

function getOriginFromHeaders(value: string | null) {
  if (!value) {
    return "http://localhost:3000";
  }

  return value;
}

export async function requestMagicLinkAction(
  _previousState: AuthFlowState,
  formData: FormData,
): Promise<AuthFlowState> {
  const headerStore = await headers();
  const securityContext = extractClientSecurityContextFromHeaders(headerStore);
  const rateLimit = consumeRateLimit({
    bucket: "auth:magic-link",
    key: securityContext.submittedIp ?? securityContext.userAgent ?? "anonymous",
    limit: 6,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return {
      error: `Cok fazla baglanti denemesi yapildi. Lutfen ${rateLimit.retryAfterSeconds} saniye sonra tekrar dene.`,
      success: null,
    };
  }

  const parsed = emailOnlySchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    await logFailedAuthEvent({
      email: typeof formData.get("email") === "string" ? String(formData.get("email")) : null,
      route: "/login/magic-link",
      reason: parsed.error.issues[0]?.message ?? "Gecersiz e-posta",
      submittedIp: securityContext.submittedIp,
      forwardedIp: securityContext.forwardedIp,
      userAgent: securityContext.userAgent,
      deviceSummary: securityContext.deviceSummary,
    });

    return { error: parsed.error.issues[0]?.message ?? "E-posta gecersiz.", success: null };
  }

  if (!getSupabaseConfig().isConfigured) {
    return { error: "Supabase auth henuz aktif degil.", success: null };
  }

  const supabase = await createSupabaseServerClient({ writeCookies: true });

  if (!supabase) {
    return { error: "Supabase baglantisi kurulamadi.", success: null };
  }

  const origin = getOriginFromHeaders(headerStore.get("origin"));

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/login`,
    },
  });

  if (error) {
    await logFailedAuthEvent({
      email: parsed.data.email,
      route: "/login/magic-link",
      reason: error.message,
      submittedIp: securityContext.submittedIp,
      forwardedIp: securityContext.forwardedIp,
      userAgent: securityContext.userAgent,
      deviceSummary: securityContext.deviceSummary,
    });

    return { error: error.message, success: null };
  }

  return {
    error: null,
    success: "Magic link gonderildi. E-postani kontrol et.",
  };
}

export async function requestPasswordResetAction(
  _previousState: AuthFlowState,
  formData: FormData,
): Promise<AuthFlowState> {
  const headerStore = await headers();
  const securityContext = extractClientSecurityContextFromHeaders(headerStore);
  const rateLimit = consumeRateLimit({
    bucket: "auth:password-reset",
    key: securityContext.submittedIp ?? securityContext.userAgent ?? "anonymous",
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return {
      error: `Cok fazla sifre yenileme denemesi yapildi. Lutfen ${rateLimit.retryAfterSeconds} saniye sonra tekrar dene.`,
      success: null,
    };
  }

  const parsed = emailOnlySchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    await logFailedAuthEvent({
      email: typeof formData.get("email") === "string" ? String(formData.get("email")) : null,
      route: "/forgot-password",
      reason: parsed.error.issues[0]?.message ?? "Gecersiz e-posta",
      submittedIp: securityContext.submittedIp,
      forwardedIp: securityContext.forwardedIp,
      userAgent: securityContext.userAgent,
      deviceSummary: securityContext.deviceSummary,
    });

    return { error: parsed.error.issues[0]?.message ?? "E-posta gecersiz.", success: null };
  }

  if (!getSupabaseConfig().isConfigured) {
    return { error: "Supabase auth henuz aktif degil.", success: null };
  }

  const supabase = await createSupabaseServerClient({ writeCookies: true });

  if (!supabase) {
    return { error: "Supabase baglantisi kurulamadi.", success: null };
  }

  const origin = getOriginFromHeaders(headerStore.get("origin"));

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    await logFailedAuthEvent({
      email: parsed.data.email,
      route: "/forgot-password",
      reason: error.message,
      submittedIp: securityContext.submittedIp,
      forwardedIp: securityContext.forwardedIp,
      userAgent: securityContext.userAgent,
      deviceSummary: securityContext.deviceSummary,
    });

    return { error: error.message, success: null };
  }

  return {
    error: null,
    success: "Sifre yenileme baglantisi gonderildi.",
  };
}

export async function completePasswordSetupAction(
  _previousState: AuthFlowState,
  formData: FormData,
): Promise<AuthFlowState> {
  const headerStore = await headers();
  const securityContext = extractClientSecurityContextFromHeaders(headerStore);
  const parsed = passwordResetSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    await logFailedAuthEvent({
      route: "/reset-password",
      reason: parsed.error.issues[0]?.message ?? "Gecersiz sifre",
      submittedIp: securityContext.submittedIp,
      forwardedIp: securityContext.forwardedIp,
      userAgent: securityContext.userAgent,
      deviceSummary: securityContext.deviceSummary,
    });

    return { error: parsed.error.issues[0]?.message ?? "Sifre gecersiz.", success: null };
  }

  const tokenHash = formData.get("token_hash");
  const type = formData.get("type");

  if (typeof tokenHash !== "string" || typeof type !== "string") {
    await logFailedAuthEvent({
      route: "/reset-password",
      reason: "Eksik verify parametresi",
      submittedIp: securityContext.submittedIp,
      forwardedIp: securityContext.forwardedIp,
      userAgent: securityContext.userAgent,
      deviceSummary: securityContext.deviceSummary,
    });

    return { error: "Baglanti dogrulanamadi.", success: null };
  }

  const supabase = await createSupabaseServerClient({ writeCookies: true });

  if (!supabase) {
    return { error: "Supabase baglantisi kurulamadi.", success: null };
  }

  const verifyResult = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as "invite" | "recovery" | "magiclink",
  });

  if (verifyResult.error || !verifyResult.data.user) {
    await logFailedAuthEvent({
      route: "/reset-password",
      reason: verifyResult.error?.message ?? "OTP dogrulamasi basarisiz",
      submittedIp: securityContext.submittedIp,
      forwardedIp: securityContext.forwardedIp,
      userAgent: securityContext.userAgent,
      deviceSummary: securityContext.deviceSummary,
    });

    return { error: verifyResult.error?.message ?? "Baglanti gecersiz.", success: null };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (updateError) {
    await logFailedAuthEvent({
      email: verifyResult.data.user.email ?? null,
      route: "/reset-password",
      reason: updateError.message,
      submittedIp: securityContext.submittedIp,
      forwardedIp: securityContext.forwardedIp,
      userAgent: securityContext.userAgent,
      deviceSummary: securityContext.deviceSummary,
    });

    return { error: updateError.message, success: null };
  }

  const role = await resolveUserRole(verifyResult.data.user.id);
  const metadataRole =
    typeof verifyResult.data.user.app_metadata?.app_role === "string" &&
    isAppRole(verifyResult.data.user.app_metadata.app_role)
      ? verifyResult.data.user.app_metadata.app_role
      : null;

  redirect(getRoleHome(role ?? metadataRole ?? "parent"));
}
