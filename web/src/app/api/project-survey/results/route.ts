import { NextResponse } from "next/server";
import { runHogQLQuery, isPostHogQueryConfigured } from "@/lib/posthog/query";
import { CITIZEN_SCIENCE_SURVEY_ID } from "@/lib/posthog/survey-ids";

export const revalidate = 60;

export async function GET() {
  if (!isPostHogQueryConfigured()) {
    console.warn("[project-survey] PostHog query credentials not configured, returning empty results");
    return NextResponse.json({ votes: {} });
  }

  try {
    const rows = await runHogQLQuery<[string, number]>(
      `SELECT properties.$survey_response AS project, count() AS votes
       FROM events
       WHERE event = 'survey sent'
         AND properties.$survey_id = '${CITIZEN_SCIENCE_SURVEY_ID}'
         AND timestamp >= now() - INTERVAL 2 YEAR
       GROUP BY project`
    );

    const votes: Record<string, number> = {};
    for (const [project, count] of rows) {
      if (typeof project === "string" && project.trim()) {
        votes[project] = Number(count) || 0;
      }
    }

    return NextResponse.json({ votes });
  } catch (error) {
    console.error("[project-survey] PostHog query failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ votes: {} });
  }
}
