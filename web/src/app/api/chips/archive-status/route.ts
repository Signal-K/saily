import { NextResponse } from "next/server";
import { createClient } from "@/lib/pocketbase/server";

// Backs chips/page.tsx's archive-day picker. Client components can't call
// real-query.ts directly (it needs the server-only PocketBase superuser
// token), so this exposes just the played/unlocked date sets the page needs.
export async function GET(request: Request) {
  const pocketbase = await createClient();
  const {
    data: { user },
  } = await pocketbase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const dates = (url.searchParams.get("dates") ?? "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);

  if (dates.length === 0) {
    return NextResponse.json({ played: [], unlocked: [] });
  }

  const [{ data: plays, error: playsError }, { data: unlocks, error: unlocksError }] = await Promise.all([
    pocketbase.from("daily_plays").select("game_date").eq("user_id", user.id).in("game_date", dates),
    pocketbase.from("archive_unlocks").select("game_date").eq("user_id", user.id).in("game_date", dates),
  ]);

  if (playsError || unlocksError) {
    return NextResponse.json({ error: playsError?.message ?? unlocksError?.message }, { status: 400 });
  }

  return NextResponse.json({
    played: (plays ?? []).map((row) => row.game_date),
    unlocked: (unlocks ?? []).map((row) => row.game_date),
  });
}
