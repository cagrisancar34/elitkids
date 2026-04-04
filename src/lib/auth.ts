import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { roleHomeRoutes } from "@/lib/navigation";
import type { AppRole } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export const DEMO_ROLE_COOKIE = "elitkids-demo-role";

export type AuthContext = {
  role: AppRole;
  userId: string | null;
  mode: "demo" | "supabase";
};

export function isAppRole(value: string | null | undefined): value is AppRole {
  return value === "admin" || value === "manager" || value === "coach" || value === "parent";
}

export async function getDemoRole() {
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
          return {
            role,
            userId,
            mode: "supabase",
          };
        }

        const { data: userData } = await supabase.auth.getUser();
        const roleFromUser =
          getRoleFromMetadata(userData.user?.app_metadata) ??
          getRoleFromMetadata(userData.user?.user_metadata);

        if (roleFromUser) {
          return {
            role: roleFromUser,
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
    role: demoRole,
    userId: null,
    mode: "demo",
  };
}

export async function requireRole(role: AppRole) {
  const auth = await getCurrentAuthContext();

  if (!auth) {
    redirect("/login");
  }

  if (auth.role !== role) {
    redirect(getRoleHome(auth.role));
  }

  return auth;
}

export async function redirectIfAuthenticated() {
  const auth = await getCurrentAuthContext();

  if (auth) {
    redirect(getRoleHome(auth.role));
  }
}
