import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getRequestCorrelationId } from "@/lib/request-security";
import { getSupabaseConfig } from "@/lib/supabase/config";

type RouteAuthState = {
  appRole: "admin" | "manager" | "coach" | "parent" | null;
};

function isAppRole(value: string | null | undefined): value is RouteAuthState["appRole"] {
  return value === "admin" || value === "manager" || value === "coach" || value === "parent";
}

function getRoleHome(role: NonNullable<RouteAuthState["appRole"]>) {
  if (role === "admin") {
    return "/admin";
  }

  if (role === "manager") {
    return "/manager";
  }

  if (role === "coach") {
    return "/coach";
  }

  return "/parent";
}

function resolveAppRoleFromClaims(claims: unknown) {
  if (!claims || typeof claims !== "object") {
    return null;
  }

  const appMetadata =
    "app_metadata" in claims && claims.app_metadata && typeof claims.app_metadata === "object"
      ? claims.app_metadata
      : null;

  const userMetadata =
    "user_metadata" in claims && claims.user_metadata && typeof claims.user_metadata === "object"
      ? claims.user_metadata
      : null;

  const appRoleCandidate =
    appMetadata && "app_role" in appMetadata ? appMetadata.app_role : null;
  const userRoleCandidate =
    userMetadata && "app_role" in userMetadata ? userMetadata.app_role : null;

  if (typeof appRoleCandidate === "string" && isAppRole(appRoleCandidate)) {
    return appRoleCandidate;
  }

  if (typeof userRoleCandidate === "string" && isAppRole(userRoleCandidate)) {
    return userRoleCandidate;
  }

  return null;
}

function canAccessAppRoute(pathname: string, role: NonNullable<RouteAuthState["appRole"]>) {
  if (role === "admin") {
    return pathname.startsWith("/admin") ||
      pathname.startsWith("/manager") ||
      pathname.startsWith("/coach") ||
      pathname.startsWith("/parent");
  }

  if (role === "manager") {
    return pathname.startsWith("/manager");
  }

  if (role === "coach") {
    return pathname.startsWith("/coach");
  }

  return pathname.startsWith("/parent");
}

async function resolveSessionRole(request: NextRequest) {
  const { url, publishableKey } = getSupabaseConfig();

  if (!url || !publishableKey) {
    return {
      response: NextResponse.next({ request }),
      role: null,
    };
  }

  const requestHeaders = new Headers(request.headers);
  const correlationId = getRequestCorrelationId(request.headers);
  requestHeaders.set("x-request-id", correlationId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("x-request-id", correlationId);

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: claimsData } = await supabase.auth.getClaims();
  let role = resolveAppRoleFromClaims(claimsData?.claims);

  if (!role) {
    const { data: userData } = await supabase.auth.getUser();
    role = resolveAppRoleFromClaims(userData.user);
  }

  return {
    response,
    role,
  };
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPanelRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/manager") ||
    pathname.startsWith("/coach") ||
    pathname.startsWith("/parent");
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/invite";
  const isSensitiveRoute = isPanelRoute || pathname.startsWith("/api/") || pathname.startsWith("/auth/");

  const { response, role } = await resolveSessionRole(request);

  if (isSensitiveRoute) {
    response.headers.set("cache-control", "private, no-store, max-age=0");
  }

  if (isPanelRoute && !role) {
    return redirectToLogin(request);
  }

  if (isPanelRoute && role && !canAccessAppRoute(pathname, role)) {
    return NextResponse.redirect(new URL(getRoleHome(role), request.url), {
      headers: response.headers,
    });
  }

  if (isAuthRoute && role) {
    return NextResponse.redirect(new URL(getRoleHome(role), request.url), {
      headers: response.headers,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)"],
};
