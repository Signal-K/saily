"use client";

import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_COOKIE_NAME = "sb-local-auth-token";

function resolveBrowserSupabaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // `host.docker.internal` works from containers but can fail in host browsers.
  if (configuredUrl.includes("host.docker.internal")) {
    return configuredUrl.replace("host.docker.internal", "localhost");
  }

  return configuredUrl;
}

export function createClient() {
  return createBrowserClient(
    resolveBrowserSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: SUPABASE_COOKIE_NAME },
    },
  );
}
