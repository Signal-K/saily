import { NextRequest, NextResponse } from "next/server";
import { sendPushToAllSubscribers } from "@/lib/pocketbase/push";

type NotifyPublishBody = {
  slug?: string;
  title?: string;
  summary?: string;
};

// Called by the Saily Go backend (internal/extensions/cms.go,
// notifyArticlePublished) right after a cms_articles row transitions into
// "published" for the first time. Push-subscription storage and web-push
// sending both live in this Next.js app, not the Go backend, so this is a
// small cross-service webhook rather than a public-facing endpoint.
export async function POST(request: NextRequest) {
  const secret = process.env.PUSH_NOTIFY_SECRET?.trim();
  const provided = request.headers.get("x-push-notify-secret")?.trim();
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as NotifyPublishBody;
  const slug = payload.slug?.trim();
  const title = payload.title?.trim();
  if (!slug || !title) {
    return NextResponse.json({ error: "slug and title are required" }, { status: 400 });
  }

  const result = await sendPushToAllSubscribers({
    title: "New on Daily Transit",
    body: title,
    url: `/articles/${slug}`,
  });

  return NextResponse.json({ ok: true, ...result });
}
