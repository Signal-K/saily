import { NextRequest, NextResponse } from "next/server";
import { isResendEmailConfigured, sendEmail } from "@/lib/resend";
import { getSailyPocketBaseUrl } from "@/lib/pocketbase/config";

const NOTIFY_TO = process.env.LANDING_VOTE_NOTIFY_EMAIL ?? "liam@skinetics.tech";

const VARIANT_LABELS: Record<string, string> = {
  editorial: "📰 Editorial",
  "deep-space": "🌌 Cosmic",
  terminal: "⌨️ Terminal",
  solar: "☀️ Solar",
  minimal: "◻ Minimal",
};

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

export async function POST(request: NextRequest) {
  let body: { ranking?: unknown; positions?: unknown; active_variant?: unknown };
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const ranking = Array.isArray(body.ranking) ? body.ranking.filter((x): x is string => typeof x === "string") : [];
  const positions = (body.positions && typeof body.positions === "object" && !Array.isArray(body.positions))
    ? body.positions as Record<string, number>
    : {};
  const activeVariant = typeof body.active_variant === "string" ? body.active_variant : "";

  if (ranking.length === 0) {
    return NextResponse.json({ error: "ranking_required" }, { status: 400 });
  }

  try {
    await persistLandingVote({
      ranking,
      positions,
      active_variant: activeVariant,
      user_agent: request.headers.get("user-agent") ?? "",
      referer: request.headers.get("referer") ?? "",
    });
  } catch (error) {
    console.error("[landing-vote] PocketBase persist failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "persist_failed" }, { status: 502 });
  }

  if (!isResendEmailConfigured()) {
    console.warn("[landing-vote] Resend not configured, skipping email");
    return NextResponse.json({ ok: true, emailed: false });
  }

  try {
    await sendEmail({
      to: NOTIFY_TO,
      subject: `Landing page vote: #1 pick is ${VARIANT_LABELS[ranking[0] ?? ""] ?? ranking[0]}`,
      html: buildEmailHtml(ranking, positions, activeVariant),
    });
    return NextResponse.json({ ok: true, emailed: true });
  } catch (error) {
    console.error("[landing-vote] Resend send failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "email_failed" }, { status: 502 });
  }
}
