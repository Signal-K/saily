import { NextResponse } from "next/server";
import { runHogQLQuery, isPostHogQueryConfigured } from "@/lib/posthog/query";
import { ASSET_REVIEW_VOTE_KEY } from "@/lib/posthog/survey-ids";

export const dynamic = "force-dynamic";

type AssetStats = { count: number; average: number };

export async function GET() {
  if (!isPostHogQueryConfigured()) {
    console.warn("[asset-review] PostHog query credentials not configured, returning empty results");
    return NextResponse.json({ assets: {} });
  }

  try {
    // $survey_response is stored as "<assetSlug>:<rating 1-5>"
    const rows = await runHogQLQuery<[string, number]>(
      `SELECT properties.$survey_response AS response, count() AS votes
       FROM events
       WHERE event = 'survey sent'
         AND properties.$survey_id = '${ASSET_REVIEW_VOTE_KEY}'
         AND timestamp >= now() - INTERVAL 2 YEAR
       GROUP BY response`
    );

    const assets: Record<string, AssetStats> = {};
    for (const [response, votes] of rows) {
      if (typeof response !== "string") continue;
      const [slug, ratingStr] = response.split(":");
      const rating = Number(ratingStr);
      if (!slug || !Number.isFinite(rating)) continue;
      const existing = assets[slug] ?? { count: 0, average: 0 };
      const totalScore = existing.average * existing.count + rating * Number(votes);
      const totalCount = existing.count + Number(votes);
      assets[slug] = { count: totalCount, average: totalCount > 0 ? totalScore / totalCount : 0 };
    }

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("[asset-review] PostHog query failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ assets: {} });
  }
}
