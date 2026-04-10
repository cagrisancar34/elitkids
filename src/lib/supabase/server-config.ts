import "server-only";

function readEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];

    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

export function getSupabaseServerConfig() {
  const url = readEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  return {
    url,
    serviceRoleKey,
    isAdminConfigured: Boolean(url && serviceRoleKey),
  };
}
