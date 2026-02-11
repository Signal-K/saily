import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/profile";
  const safeNext = next.startsWith("/") ? next : "/profile";
  const fallback = new URL("/auth/sign-in", url.origin);

  if (!code) {
    fallback.searchParams.set("error", "Missing authentication code.");
    return NextResponse.redirect(fallback);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    fallback.searchParams.set("error", error.message);
    return NextResponse.redirect(fallback);
  }

  const destination = new URL(safeNext, url.origin);
  destination.searchParams.set("status", "oauth-linked");
  return NextResponse.redirect(destination);
}
