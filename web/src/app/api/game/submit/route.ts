import { NextResponse } from "next/server";
import { getDailyWord, normalizeGuess, resolveGameDate, scoreGuess } from "@/lib/game";
import { createClient } from "@/lib/supabase/server";

type SubmitBody = {
  guess?: string;
  attempts?: number;
  date?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as SubmitBody;
  const guess = normalizeGuess(body.guess ?? "");
  const attempts = Math.max(1, Math.min(10, body.attempts ?? 1));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = resolveGameDate(body.date);
  const answer = getDailyWord(date);
  const won = guess === answer;
  const score = scoreGuess(attempts, won);

  const { data, error } = await supabase.rpc("submit_daily_result", {
    p_game_date: date,
    p_attempts: attempts,
    p_won: won,
    p_score: score,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    won,
    answer,
    score,
    stats: data?.stats ?? null,
    badgesAwarded: data?.badges_awarded ?? 0,
  });
}
