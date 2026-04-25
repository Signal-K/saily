import { NextResponse } from "next/server";
import { resolveGameDate } from "@/lib/game";
import {
  CLOUDSPOTTING_MARS_FALLBACK_SUBJECTS,
  getDailyCloudspottingMarsSubject,
  toCloudspottingMarsSubject,
  type CloudspottingMarsCacheRow,
} from "@/lib/cloudspotting-mars";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = resolveGameDate(url.searchParams.get("date"));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let source: "cache" | "fallback" = "fallback";
  let subject = getDailyCloudspottingMarsSubject(date);

  try {
    const { data, error } = await supabase
      .from("cloudspotting_mars_daily")
      .select("game_date,subject_id,image_url,caption,season_or_context,workflow_version,source_metadata")
      .eq("game_date", date)
      .limit(20);

    if (!error) {
      const normalized = ((data ?? []) as CloudspottingMarsCacheRow[])
        .map(toCloudspottingMarsSubject)
        .filter((row): row is NonNullable<typeof row> => row !== null);

      if (normalized.length > 0) {
        subject = getDailyCloudspottingMarsSubject(date, normalized);
        source = "cache";
      }
    }
  } catch {
    // Table may not exist yet during rollout; fallback path is expected.
  }

  return NextResponse.json({
    ok: true,
    date,
    source,
    subject,
    fallbackCount: CLOUDSPOTTING_MARS_FALLBACK_SUBJECTS.length,
    user: user ? { id: user.id, email: user.email } : null,
  });
}
