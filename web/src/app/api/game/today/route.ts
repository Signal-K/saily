import { NextResponse } from "next/server";
import { getPuzzleForDate, resolveGameDate } from "@/lib/game";
import { getDateSeed, toDailyAnomaly } from "@/lib/anomaly";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const date = resolveGameDate(requestUrl.searchParams.get("date"));
  const puzzle = getPuzzleForDate(date);

  const supabase = await createClient();
  const { count } = await supabase.from("anomalies").select("id", { count: "exact", head: true });
  let anomaly = null;
  if (count && count > 0) {
    const offset = getDateSeed(date) % count;
    const { data: rows } = await supabase
      .from("anomalies")
      .select('id,content,"ticId",anomalytype,"anomalySet","anomalyConfiguration"')
      .order("id", { ascending: true })
      .range(offset, offset);
    const row = rows?.[0];
    if (row) {
      anomaly = toDailyAnomaly(row);
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ date, puzzle, anomaly, user: null, stats: null, play: null });
  }

  const [{ data: stats }, { data: play }, { data: badges }] = await Promise.all([
    supabase.from("user_stats").select("games_played,wins,current_streak,best_streak,total_score").eq("user_id", user.id).maybeSingle(),
    supabase.from("daily_plays").select("attempts,won,score,played_at").eq("user_id", user.id).eq("game_date", date).maybeSingle(),
    supabase
      .from("user_badges")
      .select("awarded_at,badges(name,slug,description)")
      .eq("user_id", user.id)
      .order("awarded_at", { ascending: false }),
  ]);

  return NextResponse.json({ date, puzzle, anomaly, user: { id: user.id, email: user.email }, stats, play, badges: badges ?? [] });
}
