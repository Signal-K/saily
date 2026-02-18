import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_COOKIE_NAME = "sb-local-auth-token";

function getServerSupabaseUrl() {
  return process.env.SUPABASE_URL_INTERNAL ?? process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
}

function getServerSupabaseAnonKey() {
  return process.env.SUPABASE_ANON ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getServerSupabaseUrl(),
    getServerSupabaseAnonKey(),
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
