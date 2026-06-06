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

function maskEmail(email: string) {
  if (!email) return "";
  const [local = "", domain = ""] = email.split("@");
  const maskedLocal = local.length <= 2 ? `${local.slice(0, 1)}*` : `${local.slice(0, 2)}***${local.slice(-1)}`;
  return domain ? `${maskedLocal}@${domain}` : maskedLocal;
}

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

function getLandingInterestDebug(requestId: string, record?: { email?: string; kind?: string }) {
  const hasServerToken = Boolean(process.env.POSTHOG_PROJECT_TOKEN?.trim());
  const hasPublicToken = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim());
  const hasCaptureHost = Boolean(process.env.POSTHOG_CAPTURE_HOST?.trim());
  const hasPublicHost = Boolean(process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim());

  return {
    requestId,
    kind: record?.kind ?? "",
    emailMasked: maskEmail(record?.email ?? ""),
    env: {
      POSTHOG_PROJECT_TOKEN: hasServerToken,
      NEXT_PUBLIC_POSTHOG_KEY: hasPublicToken,
      POSTHOG_CAPTURE_HOST: hasCaptureHost,
      NEXT_PUBLIC_POSTHOG_HOST: hasPublicHost,
      VERCEL: Boolean(process.env.VERCEL),
      VERCEL_ENV: process.env.VERCEL_ENV ?? "",
      VERCEL_REGION: process.env.VERCEL_REGION ?? "",
    },
    resolved: {
      posthogHost: getPosthogHost(),
      tokenSource: hasServerToken ? "POSTHOG_PROJECT_TOKEN" : hasPublicToken ? "NEXT_PUBLIC_POSTHOG_KEY" : "missing",
    },
  };
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
    throw new Error("PostHog capture failed: API key (POSTHOG_PROJECT_TOKEN or NEXT_PUBLIC_POSTHOG_KEY) is not configured");
  }

  const distinctId = getDistinctId(record as { email: string; kind: string }, request);
  const response = await fetch(`${host.replace(/\/$/, "")}/capture/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      event: posthogEventName,
      distinct_id: distinctId,
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

  return { captured: true, status: response.status };
}

export async function POST(request: NextRequest) {
  let payload: LandingInterestPayload;
  const requestId = crypto.randomUUID();

  try {
    payload = (await request.json()) as LandingInterestPayload;
  } catch {
    const debug = getLandingInterestDebug(requestId);
    console.error("[landing-interest] invalid JSON", debug);
    return NextResponse.json({ error: "invalid_json", debug }, { status: 400 });
  }

  const kind = typeof payload.kind === "string" ? payload.kind : "";
  if (!allowedKinds.has(kind)) {
    const debug = getLandingInterestDebug(requestId, { kind });
    console.error("[landing-interest] invalid kind", debug);
    return NextResponse.json({ error: "invalid_kind", debug }, { status: 400 });
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
  const debug = getLandingInterestDebug(requestId, record);

  console.info("[landing-interest] email form submit received", {
    ...debug,
    request: {
      referer: record.referer,
      hasUserAgent: Boolean(record.user_agent),
      forwardedHost: request.headers.get("x-forwarded-host") ?? "",
      forwardedProto: request.headers.get("x-forwarded-proto") ?? "",
    },
  });

  if (kind === "notify" && !record.email) {
    console.error("[landing-interest] notify email missing", debug);
    return NextResponse.json({ error: "email_required", debug }, { status: 400 });
  }

  try {
    const result = await capturePosthogEvent(record, request);
    console.info("[landing-interest] PostHog capture succeeded", { ...debug, posthogStatus: result.status });
    return NextResponse.json({ ok: true, ...result, debug });
  } catch (error) {
    console.error("[landing-interest] PostHog capture failed", {
      ...debug,
      error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
    });
    return NextResponse.json({ error: "capture_failed", debug }, { status: 502 });
  }
}
