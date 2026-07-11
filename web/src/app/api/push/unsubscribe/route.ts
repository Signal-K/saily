import { NextResponse } from "next/server";
import { RealPocketBaseQuery } from "@/lib/pocketbase/real-query";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as { endpoint?: string };
  const endpoint = payload.endpoint;

  if (!endpoint) {
    return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
  }

  const { error } = await new RealPocketBaseQuery("push_subscriptions").delete().eq("endpoint", endpoint);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
