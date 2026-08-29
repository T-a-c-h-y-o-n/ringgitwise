// Supabase client helper - optional. Works even without env (no-op).
// Env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return { url, anon, service };
}

export function isSupabaseConfigured(): boolean {
  const { url, anon } = getSupabaseEnv();
  return Boolean(url && anon && url.startsWith("http"));
}
