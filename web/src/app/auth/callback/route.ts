import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const fallback = new URL("/auth/sign-in", url.origin);

  fallback.searchParams.set("error", "OAuth callback is not wired for shared PocketBase auth yet.");
  return NextResponse.redirect(fallback);
}
