"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_COOKIE_NAME, getSupabaseAnonKey, resolveBrowserSupabaseUrl } from "./config";

export function createClient() {
  return createBrowserClient(
    resolveBrowserSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookieOptions: { name: SUPABASE_COOKIE_NAME },
    },
  );
}
