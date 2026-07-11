import webpush from "web-push";
import { RealPocketBaseQuery } from "@/lib/pocketbase/real-query";

type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

function vapidConfigured() {
  return Boolean(
    process.env.VAPID_SUBJECT && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
  );
}

// Sends a web-push notification to every stored subscription. Best-effort:
// individual failures (expired/unsubscribed devices) don't fail the batch —
// see cleanup of 404/410 responses below, which is the standard signal a
// subscription is dead and should be dropped.
export async function sendPushToAllSubscribers(payload: { title: string; body: string; url?: string }) {
  if (!vapidConfigured()) {
    console.warn("[push] VAPID keys are not configured — skipping push send.");
    return { sent: 0, failed: 0 };
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  const { data } = await new RealPocketBaseQuery("push_subscriptions").select("id,endpoint,keys");
  const subscriptions = (data ?? []) as PushSubscriptionRow[];

  const body = JSON.stringify({ title: payload.title, body: payload.body, url: payload.url ?? "/games/today" });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, body);
      } catch (error) {
        const statusCode = (error as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await new RealPocketBaseQuery("push_subscriptions").delete().eq("id", sub.id);
        }
        throw error;
      }
    }),
  );

  const failed = results.filter((result) => result.status === "rejected").length;
  return { sent: subscriptions.length - failed, failed };
}
