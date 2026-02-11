import { NextResponse } from "next/server";
import { isPastGameDate, resolveGameDate } from "@/lib/game";
import { createClient } from "@/lib/supabase/server";

type CompleteBody = {
  completedPuzzles?: number;
  confidence?: number;
  note?: string;
  date?: string;
};

function normalizeNumber(value: unknown, fallback: number, min: number, max: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.min(max, Math.round(numeric)));
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as CompleteBody;
  const completedPuzzles = normalizeNumber(payload.completedPuzzles, 3, 1, 3);
  const confidence = normalizeNumber(payload.confidence, 70, 0, 100);
  const date = resolveGameDate(payload.date);
  const xpMultiplier = isPastGameDate(date) ? 0.5 : 1;

  const attempts = Math.max(1, 4 - completedPuzzles);
  const baseScore = Math.round((completedPuzzles / 3) * (60 + confidence * 0.4));
  const score = Math.max(1, Math.round(baseScore * xpMultiplier));

  const { data, error } = await supabase.rpc("submit_daily_result", {
    p_game_date: date,
    p_attempts: attempts,
    p_won: true,
    p_score: score,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Keep note payload for future analytics, if provided.
  void payload.note;

  return NextResponse.json({
    ok: true,
    stats: data?.stats ?? null,
    badgesAwarded: data?.badges_awarded ?? 0,
    score,
    xpMultiplier,
    gameDate: date,
  });
}
