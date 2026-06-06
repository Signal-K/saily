import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/pocketbase/middleware";

const retiredPagePrefixes = [
  "/games",
  "/calendar",
  "/chips",
  "/leaderboard",
  "/discuss",
  "/profile",
  "/postcards",
  "/source",
];

function isRetiredPage(pathname: string) {
  return retiredPagePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  if (isRetiredPage(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
