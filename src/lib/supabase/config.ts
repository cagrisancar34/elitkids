function readEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];

    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

export function getSupabaseConfig() {
  const url = readEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
  const publishableKey = readEnv(
    "SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  return {
    url,
    publishableKey,
    serviceRoleKey,
    isConfigured: Boolean(url && publishableKey),
  };
}
