import { NextResponse } from "next/server";
import { resolveGameDate } from "@/lib/game";
import { createClient } from "@/lib/pocketbase/server";
import type { CrosswordGrid } from "@/lib/crossword-generator";

type CrosswordRow = { game_date: string; grid: CrosswordGrid };
// Keyed by "{number}-{direction}" since across/down entries can share a
// start-cell number in a small grid.
type SubmitBody = { date?: string; answers?: Record<string, string> };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SubmitBody;
  const date = resolveGameDate(body.date);
  const answers = body.answers ?? {};

  const pocketbase = await createClient();
  const { data: existing } = await pocketbase.from("crossword_daily").select("game_date,grid").eq("game_date", date).maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "No crossword generated for this date yet." }, { status: 404 });
  }

  const grid = (existing as CrosswordRow).grid;
  let correct = 0;
  for (const placement of grid.placements) {
    const submitted = String(answers[`${placement.number}-${placement.direction}`] ?? "").trim().toUpperCase();
    if (submitted === placement.answer) correct += 1;
  }

  const total = grid.placements.length || 1;
  const score = Math.round((correct / total) * 100);

  return NextResponse.json({ date, correct, total, score, allCorrect: correct === total });
}
