import { NextResponse } from "next/server";
import { resolveGameDate } from "@/lib/game";
import { createClient } from "@/lib/pocketbase/server";
import { buildClueBank } from "@/lib/crossword-clues";
import { buildDailyCrossword, type CrosswordGrid } from "@/lib/crossword-generator";

type CrosswordRow = { game_date: string; grid: CrosswordGrid };

// Public shape sent to the client: no answers, so solving happens against
// /api/crossword/submit rather than by reading the response body.
type PublicClue = {
  number: number;
  direction: CrosswordGrid["placements"][number]["direction"];
  row: number;
  col: number;
  length: number;
  clue: string;
  sourceUrl: string | null;
};

function toPublicPayload(grid: CrosswordGrid) {
  const clues: PublicClue[] = grid.placements.map((p) => ({
    number: p.number,
    direction: p.direction,
    row: p.row,
    col: p.col,
    length: p.answer.length,
    clue: p.clue,
    sourceUrl: p.sourceUrl,
  }));

  return { width: grid.width, height: grid.height, cells: Object.keys(grid.cells), clues };
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const date = resolveGameDate(requestUrl.searchParams.get("date"));
  const pocketbase = await createClient();

  const { data: existing } = await pocketbase.from("crossword_daily").select("game_date,grid").eq("game_date", date).maybeSingle();

  if (existing) {
    const row = existing as CrosswordRow;
    return NextResponse.json({ date, ...toPublicPayload(row.grid) });
  }

  const clueBank = await buildClueBank();
  const grid = buildDailyCrossword(clueBank, date);

  await pocketbase.from("crossword_daily").upsert(
    { game_date: date, grid, clues: grid.placements.map((p) => ({ number: p.number, answer: p.answer })) },
    { onConflict: "game_date" },
  );

  return NextResponse.json({ date, ...toPublicPayload(grid) });
}
