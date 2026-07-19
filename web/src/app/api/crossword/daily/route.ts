import { NextResponse } from "next/server";
import { resolveGameDate } from "@/lib/game";
import { createClient } from "@/lib/pocketbase/server";
import { getDayAccessForUser } from "@/lib/day-access";
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

  const {
    data: { user },
  } = await pocketbase.auth.getUser();
  const access = await getDayAccessForUser(pocketbase, user?.id, date);
  if (!access.allowed) {
    return NextResponse.json({ error: "Unlock this archived mission before playing it." }, { status: 403 });
  }

  const { data: existing } = await pocketbase.from("crossword_daily").select("game_date,grid").eq("game_date", date).maybeSingle();

  if (existing) {
    const row = existing as CrosswordRow;
    return NextResponse.json({ date, ...toPublicPayload(row.grid) });
  }

  let grid: CrosswordGrid;
  try {
    const clueBank = await buildClueBank();
    grid = buildDailyCrossword(clueBank, date);
    if (grid.placements.length === 0) {
      throw new Error("No real clue sources were available to build today's crossword.");
    }
  } catch (error) {
    console.error("[crossword/daily] generation failed", error);
    return NextResponse.json({ error: "Could not generate today's crossword. Try again shortly." }, { status: 503 });
  }

  try {
    await pocketbase.from("crossword_daily").upsert(
      { game_date: date, grid, clues: grid.placements.map((p) => ({ number: p.number, answer: p.answer })) },
      { onConflict: "game_date" },
    );
  } catch (error) {
    // Not fatal — a concurrent request may have already cached this date's
    // row; the generated grid is still valid to return either way.
    console.warn("[crossword/daily] caching the generated grid failed", error);
  }

  return NextResponse.json({ date, ...toPublicPayload(grid) });
}
