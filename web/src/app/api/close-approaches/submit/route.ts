import { NextResponse } from "next/server";
import { resolveGameDate } from "@/lib/game";
import { getDayAccessForUser } from "@/lib/day-access";
import { createClient } from "@/lib/pocketbase/server";
import {
  CLOSE_APPROACH_MODE,
  scoreCloseApproachSubmission,
  type CloseApproachCacheRow,
} from "@/lib/close-approaches";

type SubmitBody = {
  date?: string;
  orderedRecordIds?: unknown;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SubmitBody;
  const date = resolveGameDate(body.date);
  const orderedRecordIds = Array.isArray(body.orderedRecordIds)
    ? body.orderedRecordIds.map((id) => String(id))
    : [];
  const pocketbase = await createClient();

  const {
    data: { user },
  } = await pocketbase.auth.getUser();
  const access = await getDayAccessForUser(pocketbase, user?.id, date);
  if (!access.allowed) {
    return NextResponse.json({ error: "Unlock this archived mission before playing it." }, { status: 403 });
  }

  const { data, error } = await pocketbase
    .from("close_approach_daily")
    .select(
      "game_date,mode,source_record_id,designation,display_name,orbit_id,close_approach_time,distance_au,distance_ld,distance_min_au,distance_max_au,relative_velocity_km_s,absolute_magnitude_h,diameter_km,diameter_sigma_km,solution_rank,source_url,source_metadata",
    )
    .eq("game_date", date)
    .eq("mode", CLOSE_APPROACH_MODE)
    .order("solution_rank", { ascending: true })
    .limit(6);

  if (error) {
    console.warn("[close-approaches/submit] cache read failed", error);
    return NextResponse.json({ error: "Could not score this close-approach round." }, { status: 503 });
  }

  try {
    return NextResponse.json(
      scoreCloseApproachSubmission(date, (data ?? []) as CloseApproachCacheRow[], orderedRecordIds),
    );
  } catch (submitError) {
    return NextResponse.json(
      { error: submitError instanceof Error ? submitError.message : "Invalid close-approach submission." },
      { status: 400 },
    );
  }
}
