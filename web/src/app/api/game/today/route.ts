import { NextResponse } from "next/server";
import { getPuzzleForDate, resolveGameDate } from "@/lib/game";
import { getDateSeed, toDailyAnomaly } from "@/lib/anomaly";
import { createClient } from "@/lib/supabase/server";

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function estimateSignalStrength(lightcurve: Array<{ y: number }>) {
  if (lightcurve.length < 8) return 0;
  const ys = lightcurve.map((point) => point.y);
  const baseline = median(ys);
  const negatives = ys.map((y) => baseline - y).filter((value) => value > 0);
  const dipDepth = negatives.length ? Math.max(...negatives) : 0;

  const deltas: number[] = [];
  for (let i = 1; i < ys.length; i += 1) {
    deltas.push(Math.abs(ys[i] - ys[i - 1]));
  }
  const noiseFloor = Math.max(median(deltas), 1e-6);
  return dipDepth / noiseFloor;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const date = resolveGameDate(requestUrl.searchParams.get("date"));
  const puzzle = getPuzzleForDate(date);

  const supabase = await createClient();
  const { count } = await supabase.from("anomalies").select("id", { count: "exact", head: true });
  let anomaly = null;
  let anomalies: ReturnType<typeof toDailyAnomaly>[] = [];
  if (count && count > 0) {
    const offset = getDateSeed(date) % count;
    const sampleSize = Math.min(count, 24);
    const end = Math.min(count - 1, offset + sampleSize - 1);
    const { data: rows } = await supabase
      .from("anomalies")
      .select('id,content,"ticId",anomalytype,"anomalySet","anomalyConfiguration"')
      .order("id", { ascending: true })
      .range(offset, end);

    const selectedRows = rows ?? [];
    if (selectedRows.length > 0) {
      const expandedRows = [...selectedRows];
      if (expandedRows.length < 3) {
        const missing = 3 - expandedRows.length;
        const { data: headRows } = await supabase
          .from("anomalies")
          .select('id,content,"ticId",anomalytype,"anomalySet","anomalyConfiguration"')
          .order("id", { ascending: true })
          .range(0, Math.max(0, missing - 1));
        expandedRows.push(...(headRows ?? []));
      }

      const ranked = expandedRows
        .map((row) => {
          const parsed = toDailyAnomaly(row);
          return { parsed, signalStrength: estimateSignalStrength(parsed.lightcurve) };
        })
        .sort((a, b) => b.signalStrength - a.signalStrength)
        .slice(0, 3)
        .map((item) => item.parsed);

      anomalies = ranked;
      anomaly = ranked[0] ?? null;
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ date, puzzle, anomaly, anomalies, user: null, stats: null, play: null });
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

  return NextResponse.json({ date, puzzle, anomaly, anomalies, user: { id: user.id, email: user.email }, stats, play, badges: badges ?? [] });
}
