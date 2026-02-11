import { NextResponse } from "next/server";
import { getDateKey, getPuzzleForDate } from "@/lib/game";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const date = getDateKey();
  const puzzle = getPuzzleForDate(date);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ date, puzzle, user: null, stats: null, play: null });
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

  return NextResponse.json({ date, puzzle, user: { id: user.id, email: user.email }, stats, play, badges: badges ?? [] });
}
