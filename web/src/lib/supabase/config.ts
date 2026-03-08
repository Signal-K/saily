export const SUPABASE_COOKIE_NAME = "sb-local-auth-token";

export function getServerSupabaseUrl() {
  return process.env.SUPABASE_URL_INTERNAL ?? process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

export function getSupabaseAnonKey() {
  return process.env.SUPABASE_ANON ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

export function resolveBrowserSupabaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (configuredUrl.includes("host.docker.internal")) {
    return configuredUrl.replace("host.docker.internal", "localhost");
  }
  return configuredUrl;
}

export function isLocalSupabaseUrl(url: string) {
  return url.includes("127.0.0.1") || url.includes("localhost");
}
