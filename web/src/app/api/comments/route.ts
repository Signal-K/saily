import { NextResponse } from "next/server";
import { createClient } from "@/lib/pocketbase/server";

// Minimal rate-limit-only moderation path (uq74a2 — full report/flag/
// admin-view tooling — is still `backlog`, per
// ~/Navigation/workspace/projects/landnam/docs/spec-comments-on-classifications-and-discoveries.md
// §3's explicit fallback). One comment per author per RATE_LIMIT_WINDOW_MS,
// across both record types.
const RATE_LIMIT_WINDOW_MS = 10_000;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const date = requestUrl.searchParams.get("date");
  const recordType = requestUrl.searchParams.get("recordType");
  const recordId = requestUrl.searchParams.get("recordId");

  const pocketbase = await createClient();

  // Polymorphic path — comments on a `record_type`/`record_id` pair (e.g.
  // "discovery" / a discoveries row id). Public read, no auth required, per
  // spec §2 ("Saily readers without an account can read comments").
  if (recordType && recordId) {
    const { data, error } = await pocketbase
      .from("comments")
      .select("id,body,created_at,user_id,profiles(username)")
      .eq("record_type", recordType)
      .eq("record_id", recordId)
      .order("created_at", { ascending: false })
      .limit(40);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ comments: data ?? [] });
  }

  // Legacy daily-game path — unchanged.
  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  const { data, error } = await pocketbase
    .from("comments")
    .select("id,body,created_at,user_id,profiles(username)")
    .eq("game_date", date)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ comments: data ?? [] });
}

export async function POST(request: Request) {
  const pocketbase = await createClient();
  const {
    data: { user },
  } = await pocketbase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    date?: string;
    recordType?: string;
    recordId?: string;
    body?: string;
  };
  const content = payload.body?.trim();

  if (!content) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: "body must be 2000 characters or fewer" }, { status: 400 });
  }

  const recordType = payload.recordType;
  const recordId = payload.recordId;
  const date = payload.date;

  if (!date && (!recordType || !recordId)) {
    return NextResponse.json(
      { error: "either date, or recordType and recordId, are required" },
      { status: 400 },
    );
  }

  const cutoffIso = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { data: recent, error: rateLimitError } = await pocketbase
    .from("comments")
    .select("id,created_at")
    .eq("user_id", user.id)
    .gte("created_at", cutoffIso)
    .order("created_at", { ascending: false })
    .limit(1);

  if (rateLimitError) {
    return NextResponse.json({ error: rateLimitError.message }, { status: 400 });
  }
  if (recent && recent.length > 0) {
    return NextResponse.json(
      { error: "You're commenting too fast — please wait a few seconds and try again." },
      { status: 429 },
    );
  }

  const row: Record<string, string> = { user_id: user.id, body: content };
  if (recordType && recordId) {
    row.record_type = recordType;
    row.record_id = recordId;
  } else if (date) {
    row.game_date = date;
    row.record_type = "daily_game";
    row.record_id = date;
  }

  const { error } = await pocketbase.from("comments").insert(row);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (row.record_type === "daily_game") {
    await pocketbase.rpc("award_comment_badges", { user_id: user.id });
  }
  return NextResponse.json({ ok: true });
}
