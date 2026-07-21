import { NextResponse } from "next/server";
import { resolveGameDate } from "@/lib/game";
import { getDayAccessForUser } from "@/lib/day-access";
import { createClient } from "@/lib/pocketbase/server";

type DailyPlayRow = { game: string | null; score: number | null; attempts: number | null; played_at: string | null };

// Game-agnostic day access + stats endpoint, used by the /games hub and each
// standalone game page. Games are independent — `completedGames` lists which
// of today's games this user has already finished (each one earns its own
// Data Chip); it does not fetch any per-game puzzle payload itself, each game
// component fetches its own puzzle from its own route (/api/crossword/daily,
// /api/dsmr/daily, etc).
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
      completedGames: [],
      badges: [],
    });
  }

  if (!user) {
    return NextResponse.json({ date, access, user: null, stats: null, completedGames: [], badges: [] });
  }

  const [{ data: stats }, { data: plays }, { data: badges }] = await Promise.all([
    pocketbase.from("user_stats").select("games_played,wins,current_streak,best_streak,total_score").eq("user_id", user.id).maybeSingle(),
    pocketbase.from("daily_plays").select("game,score,attempts,played_at").eq("user_id", user.id).eq("game_date", date),
    pocketbase
      .from("user_badges")
      .select("awarded_at,badges(name,slug,description)")
      .eq("user_id", user.id)
      .order("awarded_at", { ascending: false }),
  ]);

  const completedGames = ((plays ?? []) as DailyPlayRow[])
    .filter((row): row is DailyPlayRow & { game: string } => Boolean(row.game))
    .map((row) => ({ game: row.game, score: row.score ?? 0 }));

  return NextResponse.json({
    date,
    access,
    user: { id: user.id, email: user.email },
    stats,
    completedGames,
    badges: badges ?? [],
  });
}
