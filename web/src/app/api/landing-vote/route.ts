import { NextRequest, NextResponse } from "next/server";
import { isResendEmailConfigured, sendEmail } from "@/lib/resend";
import { getSailyPocketBaseUrl } from "@/lib/pocketbase/config";
import { VARIANT_LABELS, VARIANT_OPTIONS, type VariantId } from "@/components/landing/design-vote-data";

const NOTIFY_TO = process.env.LANDING_VOTE_NOTIFY_EMAIL ?? "liam@skinetics.tech";
const VALID_VARIANT_IDS = new Set<string>(VARIANT_OPTIONS.map((variant) => variant.id));
const posthogPersistFailureEvent = "daily_transit_landing_vote_persist_failed";

function getPosthogHost() {
  return process.env.POSTHOG_CAPTURE_HOST?.trim() || process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";
}

function getPosthogProjectToken() {
  return process.env.POSTHOG_PROJECT_TOKEN?.trim() || process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() || "";
}

// Best-effort: makes a PocketBase persist failure visible in PostHog so a
// misconfigured/missing SAILY_PB_URL doesn't silently degrade until someone
// notices a 500 or greps Vercel logs (see STS-157).
async function capturePersistFailureEvent(debug: ReturnType<typeof getPocketBaseDebug>, errorMessage: string) {
  const apiKey = getPosthogProjectToken();
  if (!apiKey) return;

  try {
    await fetch(`${getPosthogHost().replace(/\/$/, "")}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        event: posthogPersistFailureEvent,
        distinct_id: `landing-vote-persist-failure:${debug.pocketbaseHost}`,
        properties: { ...debug, errorMessage },
      }),
      cache: "no-store",
    });
  } catch (captureError) {
    console.error("[landing-vote] PostHog failure capture itself failed", captureError instanceof Error ? captureError.message : captureError);
  }
}

function isVariantId(value: unknown): value is VariantId {
  return typeof value === "string" && VALID_VARIANT_IDS.has(value);
}

function buildEmailHtml(ranking: string[], positions: Record<string, number>, activeVariant: string) {
  const rows = ranking
    .map((id, i) => {
      const label = VARIANT_LABELS[id] ?? id;
      const active = id === activeVariant ? " ★" : "";
      return `<tr><td style="padding:6px 12px;font-size:14px;">${i + 1}</td><td style="padding:6px 12px;font-size:14px;">${label}${active}</td></tr>`;
    })
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="margin:0 0 8px;">New landing page ranking</h2>
      <p style="color:#666;margin:0 0 16px;">Someone just submitted their preferred order. Currently viewing: <strong>${VARIANT_LABELS[activeVariant] ?? activeVariant}</strong></p>
      <table style="border-collapse:collapse;width:100%;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">Rank</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">Variant</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="color:#9ca3af;font-size:12px;margin:16px 0 0;">★ = the variant they were viewing when they submitted</p>
    </div>
  `;
}

async function persistLandingVote(record: {
  ranking: string[];
  positions: Record<string, number>;
  active_variant: string;
  user_agent: string;
  referer: string;
}) {
  const baseUrl = getSailyPocketBaseUrl().replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/api/collections/landing_votes/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`PocketBase landing_votes insert failed (${response.status}): ${errorText}`);
  }

  return { stored: true };
}

export async function GET() {
  const baseUrl = getSailyPocketBaseUrl().replace(/\/$/, "");

  try {
    const response = await fetch(
      `${baseUrl}/api/collections/landing_votes/records?sort=-created&perPage=20`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`PocketBase landing_votes list failed (${response.status})`);
    }

    const data = await response.json() as { items?: Array<Record<string, unknown>> };
    const votes = (data.items ?? []).map((item) => ({
      id: item.id,
      ranking: item.ranking,
      positions: item.positions,
      active_variant: item.active_variant,
      created: item.created,
    }));

    return NextResponse.json({ votes });
  } catch (error) {
    console.error("[landing-vote] PocketBase list failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ votes: [] });
  }
}

function getPocketBaseDebug() {
  const rawUrl = getSailyPocketBaseUrl();
  let host = "invalid-url";

  try {
    host = new URL(rawUrl).host;
  } catch {
    host = rawUrl ? "invalid-url" : "empty";
  }

  return {
    pocketbaseHost: host,
    hasSailyPbUrl: Boolean(process.env.SAILY_PB_URL?.trim()),
    hasNextPublicSailyPbUrl: Boolean(process.env.NEXT_PUBLIC_SAILY_PB_URL?.trim()),
  };
}

export async function POST(request: NextRequest) {
  let body: { ranking?: unknown; positions?: unknown; active_variant?: unknown };
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const ranking = Array.isArray(body.ranking) ? body.ranking : [];
  const activeVariant = isVariantId(body.active_variant) ? body.active_variant : "editorial";

  if (
    ranking.length !== VARIANT_OPTIONS.length ||
    !ranking.every(isVariantId) ||
    new Set(ranking).size !== VARIANT_OPTIONS.length
  ) {
    return NextResponse.json({ error: "invalid_ranking" }, { status: 400 });
  }

  const positions = Object.fromEntries(ranking.map((id, index) => [id, index + 1])) as Record<string, number>;

  let stored = false;

  try {
    await persistLandingVote({
      ranking,
      positions,
      active_variant: activeVariant,
      user_agent: request.headers.get("user-agent") ?? "",
      referer: request.headers.get("referer") ?? "",
    });
    stored = true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const debug = getPocketBaseDebug();
    console.error("[landing-vote] PocketBase persist failed", { error: errorMessage, ...debug });
    await capturePersistFailureEvent(debug, errorMessage);
  }

  if (!stored) {
    // Keep notification delivery independent from analytics persistence.
    console.warn("[landing-vote] continuing to email despite PocketBase persist failure");
  }

  if (!isResendEmailConfigured()) {
    console.warn("[landing-vote] Resend not configured, skipping email");
    if (!stored) {
      return NextResponse.json({ error: "vote_not_recorded", stored: false, emailed: false }, { status: 502 });
    }
    return NextResponse.json({ ok: true, stored, emailed: false });
  }

  try {
    await sendEmail({
      to: NOTIFY_TO,
      subject: `Landing page vote: #1 pick is ${VARIANT_LABELS[ranking[0] ?? ""] ?? ranking[0]}`,
      html: buildEmailHtml(ranking, positions, activeVariant),
    });
    return NextResponse.json({ ok: true, stored, emailed: true });
  } catch (error) {
    console.error("[landing-vote] Resend send failed", error instanceof Error ? error.message : error);
    if (stored) {
      return NextResponse.json({ ok: true, stored, emailed: false, emailError: "email_failed" });
    }
    return NextResponse.json({ error: "email_failed", stored: false, emailed: false }, { status: 502 });
  }
}
