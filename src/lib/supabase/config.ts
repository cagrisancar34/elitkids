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

  return {
    url,
    publishableKey,
    isConfigured: Boolean(url && publishableKey),
  };
}

export function isDemoAuthEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.ENABLE_DEMO_AUTH !== "false";
}
