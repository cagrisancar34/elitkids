import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { roleHomeRoutes } from "@/lib/navigation";
import type { AppRole, SecurityRole } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig, isDemoAuthEnabled } from "@/lib/supabase/config";

export const DEMO_ROLE_COOKIE = "elitkids-demo-role";

export type AuthContext = {
  appRole: AppRole;
  role: AppRole;
  securityRole: SecurityRole;
  userId: string | null;
  mode: "demo" | "supabase";
};

const securityRoleOrder: Record<SecurityRole, number> = {
  user: 0,
  staff: 1,
  manager: 2,
  admin: 3,
  super_admin: 4,
};

export function isAppRole(value: string | null | undefined): value is AppRole {
  return value === "admin" || value === "manager" || value === "coach" || value === "parent";
}

export function isSecurityRole(value: string | null | undefined): value is SecurityRole {
  return (
    value === "super_admin" ||
    value === "admin" ||
    value === "manager" ||
    value === "staff" ||
    value === "user"
  );
}

export function mapAppRoleToSecurityRole(role: AppRole): SecurityRole {
  if (role === "admin") {
    return "admin";
  }

  if (role === "manager") {
    return "manager";
  }

  if (role === "coach") {
    return "staff";
  }

  return "user";
}

export async function getDemoRole() {
  if (!isDemoAuthEnabled()) {
    return null;
  }

  const cookieStore = await cookies();
  const role = cookieStore.get(DEMO_ROLE_COOKIE)?.value;
  return isAppRole(role) ? role : null;
}

export function getRoleHome(role: AppRole) {
  return roleHomeRoutes[role];
}

function getRoleFromMetadata(metadata: unknown) {
  if (metadata && typeof metadata === "object" && "app_role" in metadata) {
    const candidate = metadata.app_role;
    return typeof candidate === "string" && isAppRole(candidate) ? candidate : null;
  }

  return null;
}

function getSecurityRoleFromMetadata(metadata: unknown) {
  if (metadata && typeof metadata === "object" && "security_role" in metadata) {
    const candidate = metadata.security_role;
    return typeof candidate === "string" && isSecurityRole(candidate) ? candidate : null;
  }

  return null;
}

export async function resolveUserRole(userId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("profile_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return isAppRole(data?.role) ? data.role : null;
}

function resolveSecurityRole(input: {
  appRole: AppRole;
  appMetadata?: unknown;
  userMetadata?: unknown;
}) {
  return (
    getSecurityRoleFromMetadata(input.appMetadata) ??
    getSecurityRoleFromMetadata(input.userMetadata) ??
    mapAppRoleToSecurityRole(input.appRole)
  );
}

export async function getCurrentAuthContext(): Promise<AuthContext | null> {
  const { isConfigured } = getSupabaseConfig();

  if (isConfigured) {
    const supabase = await createSupabaseServerClient();

    if (supabase) {
      const { data } = await supabase.auth.getClaims();
      const claims = data?.claims;
      const userId = typeof claims?.sub === "string" ? claims.sub : null;

      if (userId) {
        const roleFromClaims = getRoleFromMetadata(claims?.app_metadata);
        const role = roleFromClaims ?? (await resolveUserRole(userId));

        if (role) {
          const securityRole = resolveSecurityRole({
            appRole: role,
            appMetadata: claims?.app_metadata,
          });

          return {
            appRole: role,
            role,
            securityRole,
            userId,
            mode: "supabase",
          };
        }

        const { data: userData } = await supabase.auth.getUser();
        const roleFromUser =
          getRoleFromMetadata(userData.user?.app_metadata) ??
          getRoleFromMetadata(userData.user?.user_metadata);

        if (roleFromUser) {
          const securityRole = resolveSecurityRole({
            appRole: roleFromUser,
            appMetadata: userData.user?.app_metadata,
            userMetadata: userData.user?.user_metadata,
          });

          return {
            appRole: roleFromUser,
            role: roleFromUser,
            securityRole,
            userId,
            mode: "supabase",
          };
        }
      }
    }
  }

  const demoRole = await getDemoRole();

  if (!demoRole) {
    return null;
  }

  return {
    appRole: demoRole,
    role: demoRole,
    securityRole: mapAppRoleToSecurityRole(demoRole),
    userId: null,
    mode: "demo",
  };
}

export function hasSecurityRole(
  candidate: SecurityRole,
  required: SecurityRole,
) {
  return securityRoleOrder[candidate] >= securityRoleOrder[required];
}

export async function requireRole(role: AppRole) {
  const auth = await getCurrentAuthContext();

  if (!auth) {
    redirect("/login");
  }

  if (auth.role !== role && auth.role !== "admin") {
    redirect(getRoleHome(auth.role));
  }

  return auth;
}

export async function requireSecurityRole(role: SecurityRole) {
  const auth = await getCurrentAuthContext();

  if (!auth) {
    redirect("/login");
  }

  if (!hasSecurityRole(auth.securityRole, role)) {
    redirect(getRoleHome(auth.role));
  }

  return auth;
}

export async function requireOrganizationAccess(
  actorOrganizationId: string | null | undefined,
  targetOrganizationId: string | null | undefined,
) {
  const auth = await getCurrentAuthContext();

  if (!auth) {
    redirect("/login");
  }

  if (!targetOrganizationId || !actorOrganizationId) {
    throw new Error("Kurum baglami cozulmedi.");
  }

  if (auth.securityRole === "super_admin") {
    return auth;
  }

  if (actorOrganizationId !== targetOrganizationId) {
    throw new Error("Bu kayda erisim iznin yok.");
  }

  return auth;
}

export async function requireEntityAccess(input: {
  actorOrganizationId: string | null | undefined;
  targetOrganizationId: string | null | undefined;
  minimumSecurityRole?: SecurityRole;
}) {
  const auth = await requireOrganizationAccess(
    input.actorOrganizationId,
    input.targetOrganizationId,
  );

  if (input.minimumSecurityRole && !hasSecurityRole(auth.securityRole, input.minimumSecurityRole)) {
    throw new Error("Bu kayda erisim iznin yok.");
  }

  return auth;
}

export async function redirectIfAuthenticated() {
  const auth = await getCurrentAuthContext();

  if (auth) {
    redirect(getRoleHome(auth.role));
  }
}
