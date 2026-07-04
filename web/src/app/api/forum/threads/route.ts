import { NextResponse } from "next/server";
import { getDayAccessForUser } from "@/lib/day-access";
import { isDailyLiveThreadLocked, isThreadHiddenUntilCompletion } from "@/lib/forum";
import { normalizeDateKey } from "@/lib/melbourne-date";
import { createClient } from "@/lib/pocketbase/server";

type ThreadRow = {
  id: number;
  puzzle_date: string;
  kind: "daily_live" | "ongoing";
  title: string;
  continue_thread_id: number | null;
  // Persisted per-thread gate flag (backend/migrations/9_forum_thread_gate.go).
  // Optional here because the current ensure_forum_threads RPC this route
  // calls is a non-functional Supabase-shim stub (see lib/pocketbase/server.ts)
  // and does not yet return this column — see the route's NOTE below.
  hidden_until_completion?: boolean;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = normalizeDateKey(url.searchParams.get("date"));

  if (!date) {
    return NextResponse.json({ error: "date is required (YYYY-MM-DD)" }, { status: 400 });
  }

  const pocketbase = await createClient();
  const {
    data: { user },
  } = await pocketbase.auth.getUser();
  const access = await getDayAccessForUser(pocketbase, user?.id, date);
  const { data, error } = await pocketbase.rpc("ensure_forum_threads", {
    p_puzzle_date: date,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // NOTE: `pocketbase.rpc("ensure_forum_threads", ...)` is currently backed
  // by the stub client in lib/pocketbase/server.ts (a Supabase-shaped shim
  // left over from the pre-PocketBase migration) and always resolves to
  // `{ data: null, error: null }`. That means `rows` below is empty in
  // practice today. Fully wiring this endpoint to real PocketBase queries is
  // a separate, larger, pre-existing gap (rewriting lib/pocketbase/server.ts)
  // that is out of scope for the forum-thread-gate ticket. The gating logic
  // itself (`isThreadHiddenUntilCompletion`) is implemented and unit-tested
  // as a pure function so it is correct and ready to use the moment real
  // thread rows are available here.
  const rows = ((data ?? []) as ThreadRow[]).map((thread) => ({
    ...thread,
    is_locked: thread.kind === "daily_live" ? isDailyLiveThreadLocked(thread.puzzle_date) : false,
    is_hidden: isThreadHiddenUntilCompletion(
      { hidden_until_completion: thread.hidden_until_completion ?? true },
      { completed: access.completed },
    ),
  }));

  const dailyLive = rows.find((thread) => thread.kind === "daily_live");
  const ongoing = rows.find((thread) => thread.kind === "ongoing");

  return NextResponse.json({
    date,
    access,
    threads: rows,
    defaultThreadId: access.allowed ? (dailyLive && !dailyLive.is_locked ? dailyLive.id : ongoing?.id ?? rows[0]?.id ?? null) : null,
  });
}
