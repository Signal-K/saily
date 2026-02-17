import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_COOKIE_NAME = "sb-local-auth-token";

function getServerSupabaseUrl() {
  return process.env.SUPABASE_URL_INTERNAL ?? process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

function getSupabaseAnonKey() {
  return process.env.SUPABASE_ANON ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabaseUrl = getServerSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  // Never fail the entire request pipeline if env vars are missing in edge runtime.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookieOptions: { name: SUPABASE_COOKIE_NAME },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    await supabase.auth.getUser();
  } catch {
    // Avoid edge middleware hard-fail; continue request without session refresh.
    return response;
  }

  return response;
}
