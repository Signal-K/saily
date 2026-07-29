import { NextResponse } from "next/server";
import { resolveGameDate } from "@/lib/game";
import { getDayAccessForUser } from "@/lib/day-access";
import { createClient } from "@/lib/pocketbase/server";
import {
  CLOSE_APPROACH_MODE,
  toPublicCloseApproachRound,
  type CloseApproachCacheRow,
} from "@/lib/close-approaches";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const date = resolveGameDate(requestUrl.searchParams.get("date"));
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
    .order("source_record_id", { ascending: true })
    .limit(6);

  if (error) {
    console.warn("[close-approaches/daily] cache read failed", error);
    return NextResponse.json(toPublicCloseApproachRound(date, []));
  }

  return NextResponse.json(toPublicCloseApproachRound(date, (data ?? []) as CloseApproachCacheRow[]));
}
