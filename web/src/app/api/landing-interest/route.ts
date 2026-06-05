import { NextRequest, NextResponse } from "next/server";

type LandingInterestPayload = {
  kind?: unknown;
  email?: unknown;
  puzzles?: unknown;
  storyHooks?: unknown;
  returnDrivers?: unknown;
  note?: unknown;
};

const allowedKinds = new Set(["briefing", "notify"]);
const posthogEventName = "daily_transit_landing_interest";

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").slice(0, 20);
}

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 240);
}

function normalizeNote(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 2000);
}

function getPosthogHost() {
  return process.env.POSTHOG_CAPTURE_HOST?.trim() || process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";
}

function getPosthogProjectToken() {
  return process.env.POSTHOG_PROJECT_TOKEN?.trim() || process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() || "";
}

function getDistinctId(record: { email: string; kind: string }, request: NextRequest) {
  if (record.email) return record.email.toLowerCase();
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
  const userAgent = request.headers.get("user-agent") ?? "";
  return `anonymous:${record.kind}:${Buffer.from(`${forwardedFor}|${userAgent}`).toString("base64url").slice(0, 32)}`;
}

async function capturePosthogEvent(record: Record<string, unknown>, request: NextRequest) {
  const apiKey = getPosthogProjectToken();
  const host = getPosthogHost();

  if (!apiKey) {
    return { captured: false, reason: "posthog_not_configured" };
  }

  const response = await fetch(`${host.replace(/\/$/, "")}/capture/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      event: posthogEventName,
      distinct_id: getDistinctId(record as { email: string; kind: string }, request),
      properties: {
        ...record,
        $set: record.email ? { email: record.email } : undefined,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`PostHog capture failed (${response.status}): ${errorText}`);
  }

  return { captured: true };
}

export async function POST(request: NextRequest) {
  let payload: LandingInterestPayload;

  try {
    payload = (await request.json()) as LandingInterestPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const kind = typeof payload.kind === "string" ? payload.kind : "";
  if (!allowedKinds.has(kind)) {
    return NextResponse.json({ error: "invalid_kind" }, { status: 400 });
  }

  const record = {
    kind,
    email: normalizeEmail(payload.email),
    puzzles: asStringArray(payload.puzzles),
    story_hooks: asStringArray(payload.storyHooks),
    return_drivers: asStringArray(payload.returnDrivers),
    note: normalizeNote(payload.note),
    source: "saily_landing",
    user_agent: request.headers.get("user-agent") ?? "",
    referer: request.headers.get("referer") ?? "",
  };

  if (kind === "notify" && !record.email) {
    return NextResponse.json({ error: "email_required" }, { status: 400 });
  }

  try {
    const result = await capturePosthogEvent(record, request);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[landing-interest] PostHog capture failed", error);
    return NextResponse.json({ error: "capture_failed" }, { status: 502 });
  }
}
