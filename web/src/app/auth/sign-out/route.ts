import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const supabase = await createClient();
  await supabase.auth.signOut();

  const destination = new URL("/auth/sign-in", url.origin);
  destination.searchParams.set("status", "signed-out");
  return NextResponse.redirect(destination, 303);
}
