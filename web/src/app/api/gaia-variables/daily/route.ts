import { NextResponse } from "next/server";
import { resolveGameDate } from "@/lib/game";
import {
  GAIA_VARIABLES_FALLBACK_SUBJECTS,
  getDailyGaiaVariablesSubject,
  toGaiaVariablesSubject,
  type GaiaVariablesCacheRow,
  type GaiaVariablesSubject,
} from "@/lib/gaia-variables";
import { createClient } from "@/lib/pocketbase/server";

// ---------------------------------------------------------------------------
// Returns today's Gaia Variables subject. Reads the `gaia_variables_daily`
// cache table and falls back to the static GAIA_VARIABLES_FALLBACK_SUBJECTS
// set when the table is empty or the query fails — mirrors the Mars/Rubin
// `/api/*/daily` fallback pattern.
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = resolveGameDate(url.searchParams.get("date"));
  const pocketbase = await createClient();
  const {
    data: { user },
  } = await pocketbase.auth.getUser();

  let pool: GaiaVariablesSubject[] = GAIA_VARIABLES_FALLBACK_SUBJECTS;
  try {
    const { data } = await pocketbase
      .from("gaia_variables_daily")
      .select("game_date,source_id,series_payload,summary,provenance_url,cadence_summary,class_hints,source_metadata")
      .eq("game_date", date);
    const rows = (data ?? []) as GaiaVariablesCacheRow[];
    const mapped = rows
      .map(toGaiaVariablesSubject)
      .filter((subject): subject is GaiaVariablesSubject => subject !== null);
    if (mapped.length > 0) {
      pool = mapped;
    }
  } catch {
    // Cache table unavailable — fall through to the static fallback set.
  }

  const subject = getDailyGaiaVariablesSubject(date, pool);

  return NextResponse.json({
    ok: true,
    date,
    subject,
    user: user ? { id: user.id, email: user.email } : null,
  });
}
