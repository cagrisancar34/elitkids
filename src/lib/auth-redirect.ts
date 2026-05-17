import { siteUrl } from "@/lib/seo-metadata";

function normalizeOrigin(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getFallbackAuthRedirectOrigin() {
  return (
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeOrigin(siteUrl) ??
    siteUrl
  );
}

function isLocalDevelopmentOrigin(origin: string) {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  const hostname = new URL(origin).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function resolveTrustedAuthRedirectOrigin(value: string | null) {
  const fallback = getFallbackAuthRedirectOrigin();
  const candidate = normalizeOrigin(value);

  if (!candidate) {
    return fallback;
  }

  const trustedOrigins = new Set(
    [process.env.NEXT_PUBLIC_SITE_URL, process.env.NEXT_PUBLIC_APP_URL, siteUrl]
      .map(normalizeOrigin)
      .filter((origin): origin is string => Boolean(origin)),
  );

  if (trustedOrigins.has(candidate) || isLocalDevelopmentOrigin(candidate)) {
    return candidate;
  }

  return fallback;
}
