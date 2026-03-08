import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_COOKIE_NAME, getServerSupabaseUrl, getSupabaseAnonKey } from "./config";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getServerSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookieOptions: { name: SUPABASE_COOKIE_NAME },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}
