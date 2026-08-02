function readEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }

  return "";
}

function normalizeSupabaseUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

export function getSupabaseUrl() {
  return normalizeSupabaseUrl(
    readEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"),
  );
}

export function getSupabaseAnonKey() {
  return readEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
  );
}

export function getSupabaseServiceRoleKey() {
  return readEnv("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY");
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}
