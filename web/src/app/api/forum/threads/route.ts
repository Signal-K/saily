import { NextResponse } from "next/server";
import { getDayAccessForUser } from "@/lib/day-access";
import { isDailyLiveThreadLocked, isThreadHiddenUntilCompletion } from "@/lib/forum";
import { normalizeDateKey } from "@/lib/melbourne-date";
import { createClient } from "@/lib/pocketbase/server";

type ThreadRow = {
  id: string;
  puzzle_date: string;
  kind: "daily_live" | "ongoing";
  title: string;
  continue_thread_id: string | null;
  // Persisted per-thread gate flag (backend/migrations/9_forum_thread_gate.go).
  hidden_until_completion: boolean;
};

const THREAD_KINDS: ThreadRow["kind"][] = ["daily_live", "ongoing"];

function defaultTitleFor(kind: ThreadRow["kind"], date: string) {
  return kind === "daily_live" ? `Live discussion — ${date}` : `Ongoing discussion — ${date}`;
}

// Finds this puzzle date's forum_threads rows, creating any of the two
// expected kinds (daily_live, ongoing) that don't exist yet. Replaces the
// formerly-unimplemented "ensure_forum_threads" RPC — done inline here
// rather than through PocketBase's generic rpc() mechanism, consistent with
// how other compound logic in this codebase lives in the route handler.
async function ensureForumThreads(pocketbase: Awaited<ReturnType<typeof createClient>>, date: string) {
  const { data: existing, error: existingError } = await pocketbase
    .from("forum_threads")
    .select("id,puzzle_date,kind,title,continue_thread_id,hidden_until_completion")
    .eq("puzzle_date", date);

  if (existingError) {
    return { error: existingError };
  }

  const rows = [...(existing ?? [])] as ThreadRow[];
  const existingKinds = new Set(rows.map((row) => row.kind));

  for (const kind of THREAD_KINDS) {
    if (existingKinds.has(kind)) continue;

    const { data: created, error: createError } = await pocketbase
      .from("forum_threads")
      .insert({
        puzzle_date: date,
        kind,
        title: defaultTitleFor(kind, date),
        continue_thread_id: null,
        // Any thread-creation path must explicitly set this — PocketBase
        // bool fields have no schema-level default (see migration 9's note).
        hidden_until_completion: true,
      })
      .select("id,puzzle_date,kind,title,continue_thread_id,hidden_until_completion")
      .single();

    if (createError) {
      return { error: createError };
    }

    rows.push(created as ThreadRow);
  }

  return { data: rows };
}

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
  const { data, error } = await ensureForumThreads(pocketbase, date);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

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
