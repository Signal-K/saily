import { NextResponse } from "next/server";
import { runHogQLQuery, isPostHogQueryConfigured } from "@/lib/posthog/query";
import { SUGGESTION_EVENT_KEY } from "@/lib/posthog/survey-ids";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isPostHogQueryConfigured()) {
    console.warn("[suggestions] PostHog query credentials not configured, returning empty results");
    return NextResponse.json({ total: 0 });
  }

  try {
    const rows = await runHogQLQuery<[number]>(
      `SELECT count() AS total
       FROM events
       WHERE event = 'tdt_suggestion_submitted'
         AND properties.$suggestion_key = '${SUGGESTION_EVENT_KEY}'
         AND timestamp >= now() - INTERVAL 2 YEAR`
    );

    const total = rows[0]?.[0] ?? 0;
    return NextResponse.json({ total: Number(total) || 0 });
  } catch (error) {
    console.error("[suggestions] PostHog query failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ total: 0 });
  }
}
