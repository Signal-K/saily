import { NextResponse } from "next/server";
import { resolveGameDate } from "@/lib/game";
import { getDayAccessForUser } from "@/lib/day-access";
import { createClient } from "@/lib/pocketbase/server";

// Game-agnostic day access + stats endpoint. Used by mission-flow-page.tsx to
// gate access to the day's mission before rendering the active game
// (crossword/dsmr) — it does not fetch any per-game puzzle payload itself;
// each game component fetches its own puzzle from its own route
// (/api/crossword/daily, /api/dsmr/daily).
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const date = resolveGameDate(requestUrl.searchParams.get("date"));

  const pocketbase = await createClient();
  const {
    data: { user },
  } = await pocketbase.auth.getUser();
  const access = await getDayAccessForUser(pocketbase, user?.id, date);

  if (!access.allowed) {
    return NextResponse.json({
      date,
      access,
      user: user ? { id: user.id, email: user.email } : null,
      stats: null,
      play: null,
      badges: [],
    });
  }

  if (!user) {
    return NextResponse.json({ date, access, user: null, stats: null, play: null, badges: [] });
  }

  const [{ data: stats }, { data: play }, { data: badges }] = await Promise.all([
    pocketbase.from("user_stats").select("games_played,wins,current_streak,best_streak,total_score").eq("user_id", user.id).maybeSingle(),
    pocketbase.from("daily_plays").select("attempts,won,score,played_at").eq("user_id", user.id).eq("game_date", date).maybeSingle(),
    pocketbase
      .from("user_badges")
      .select("awarded_at,badges(name,slug,description)")
      .eq("user_id", user.id)
      .order("awarded_at", { ascending: false }),
  ]);

  return NextResponse.json({ date, access, user: { id: user.id, email: user.email }, stats, play, badges: badges ?? [] });
}
