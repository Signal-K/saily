import { NextResponse } from "next/server";
import { resolveGameDate } from "@/lib/game";
import { createClient } from "@/lib/pocketbase/server";

type TransitSpotterRow = {
  subject_id: string;
  image_url: string;
  caption: string | null;
  source_metadata: { sourceName?: string; sourceUrl?: string; prompt?: string } | null;
};

const ROUND_COUNT = 5;

// Bite-sized "spot the transit" round backed by real Planet Hunters TESS
// subjects (see scripts/ingest-planet-hunters-tess.mjs). No correctness is
// scored against a fabricated ground-truth answer — this is a genuine
// citizen-science classification, not a quiz, matching the retired mars
// mission's participation-based scoring rather than inventing right/wrong.
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const date = resolveGameDate(requestUrl.searchParams.get("date"));
  const pocketbase = await createClient();

  const { data: rows } = await pocketbase
    .from("planet_hunters_tess_daily")
    .select("subject_id,image_url,caption,source_metadata")
    .eq("game_date", date)
    .limit(ROUND_COUNT);

  const subjects = ((rows ?? []) as TransitSpotterRow[]).map((row) => ({
    subjectId: row.subject_id,
    imageUrl: row.image_url,
    caption: row.caption,
    sourceName: row.source_metadata?.sourceName ?? "Zooniverse / Planet Hunters TESS",
    sourceUrl: row.source_metadata?.sourceUrl ?? null,
    prompt: row.source_metadata?.prompt ?? "Does this real TESS light curve show a transit dip?",
  }));

  return NextResponse.json({ date, subjects });
}
