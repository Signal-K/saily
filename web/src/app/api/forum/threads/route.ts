import { NextResponse } from "next/server";
import { isDailyLiveThreadLocked, normalizeDateKey } from "@/lib/forum";
import { createClient } from "@/lib/supabase/server";

type ThreadRow = {
  id: number;
  puzzle_date: string;
  kind: "daily_live" | "ongoing";
  title: string;
  continue_thread_id: number | null;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = normalizeDateKey(url.searchParams.get("date"));

  if (!date) {
    return NextResponse.json({ error: "date is required (YYYY-MM-DD)" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ensure_forum_threads", {
    p_puzzle_date: date,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const rows = ((data ?? []) as ThreadRow[]).map((thread) => ({
    ...thread,
    is_locked: thread.kind === "daily_live" ? isDailyLiveThreadLocked(thread.puzzle_date) : false,
  }));

  const dailyLive = rows.find((thread) => thread.kind === "daily_live");
  const ongoing = rows.find((thread) => thread.kind === "ongoing");

  return NextResponse.json({
    date,
    threads: rows,
    defaultThreadId: dailyLive && !dailyLive.is_locked ? dailyLive.id : ongoing?.id ?? rows[0]?.id ?? null,
  });
}
