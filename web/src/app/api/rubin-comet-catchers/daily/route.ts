import { NextResponse } from "next/server";
import { resolveGameDate } from "@/lib/game";
import {
  RUBIN_COMET_CATCHERS_FALLBACK_SUBJECTS,
  getDailyRubinCometCatchersSubject,
  toRubinCometCatchersSubject,
  type RubinCometCatchersCacheRow,
  type RubinCometCatchersSubject,
} from "@/lib/rubin-comet-catchers";
import { createClient } from "@/lib/pocketbase/server";

// ---------------------------------------------------------------------------
// Returns today's Rubin Comet Catchers subject. Reads the `rubin_comet_catchers_daily`
// cache table (seeded by the ingestion script) and falls back to the static
// RUBIN_COMET_CATCHERS_FALLBACK_SUBJECTS set when the table is empty or the
// query fails — mirrors the Mars `/api/mars/daily` fallback pattern.
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = resolveGameDate(url.searchParams.get("date"));
  const pocketbase = await createClient();
  const {
    data: { user },
  } = await pocketbase.auth.getUser();

  let pool: RubinCometCatchersSubject[] = RUBIN_COMET_CATCHERS_FALLBACK_SUBJECTS;
  try {
    const { data } = await pocketbase
      .from("rubin_comet_catchers_daily")
      .select("game_date,subject_id,image_urls,activity_prompt,object_label,known_training_flag,source_metadata")
      .eq("game_date", date);
    const rows = (data ?? []) as RubinCometCatchersCacheRow[];
    const mapped = rows
      .map(toRubinCometCatchersSubject)
      .filter((subject): subject is RubinCometCatchersSubject => subject !== null);
    if (mapped.length > 0) {
      pool = mapped;
    }
  } catch {
    // Cache table unavailable — fall through to the static fallback set.
  }

  const subject = getDailyRubinCometCatchersSubject(date, pool);

  return NextResponse.json({
    ok: true,
    date,
    subject,
    user: user ? { id: user.id, email: user.email } : null,
  });
}
