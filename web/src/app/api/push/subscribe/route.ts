import { NextResponse } from "next/server";
import { RealPocketBaseQuery } from "@/lib/pocketbase/real-query";

type SubscribeBody = {
  subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as SubscribeBody;
  const endpoint = payload.subscription?.endpoint;
  const keys = payload.subscription?.keys;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const { error } = await new RealPocketBaseQuery("push_subscriptions").upsert(
    { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } },
    { onConflict: "endpoint" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
