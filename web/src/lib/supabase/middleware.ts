import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_COOKIE_NAME, getServerSupabaseUrl, getSupabaseAnonKey, isLocalSupabaseUrl } from "./config";

function shouldSkipEdgeAuthRefresh(supabaseUrl: string) {
  if (process.env.NODE_ENV === "production") return false;
  return isLocalSupabaseUrl(supabaseUrl);
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabaseUrl = getServerSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  // Never fail the entire request pipeline if env vars are missing in edge runtime.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }
  if (shouldSkipEdgeAuthRefresh(supabaseUrl)) {
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
