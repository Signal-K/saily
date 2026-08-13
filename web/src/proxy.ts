import { type NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { updateSession } from "@/lib/pocketbase/middleware";

export const proxy = clerkMiddleware((_auth, request: NextRequest) => updateSession(request));

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
