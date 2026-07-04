import { NextResponse } from "next/server";
import { getDayAccessForUser } from "@/lib/day-access";
import { isPastGameDate, resolveGameDate } from "@/lib/game";
import { createClient } from "@/lib/pocketbase/server";

type ClassifyBody = {
  date?: string;
  subjectId?: string;
  choice?: string;
  note?: string;
};

export async function POST(request: Request) {
  const pocketbase = await createClient();
  const {
    data: { user },
  } = await pocketbase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as ClassifyBody;
  const date = resolveGameDate(payload.date);
  const access = await getDayAccessForUser(pocketbase, user.id, date);
  if (!access.allowed) {
    return NextResponse.json({ error: "Unlock this archived mission before submitting it." }, { status: 403 });
  }

  const subjectId = typeof payload.subjectId === "string" ? payload.subjectId.trim() : "";
  const choice = typeof payload.choice === "string" ? payload.choice.trim() : "";

  if (!subjectId || !choice) {
    return NextResponse.json({ error: "Missing subject or classification choice." }, { status: 400 });
  }

  const row = {
    user_id: user.id,
    game_date: date,
    source_id: subjectId.slice(0, 80),
    classification: choice.slice(0, 40),
    note: payload.note ? payload.note.slice(0, 1000) : null,
  };

  const { error } = await pocketbase
    .from("gaia_variables_classifications")
    .upsert([row], { onConflict: "user_id,game_date,source_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  let score = 50;
  if (choice !== "not-sure") score += 30;
  if (row.note) score += 20;
  score = Math.min(100, score);

  return NextResponse.json({
    ok: true,
    score: isPastGameDate(date) ? 0 : score,
    archiveMode: isPastGameDate(date),
  });
}

export async function GET(request: Request) {
  const pocketbase = await createClient();
  const {
    data: { user },
  } = await pocketbase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const date = resolveGameDate(url.searchParams.get("date"));
  const access = await getDayAccessForUser(pocketbase, user.id, date);
  if (!access.allowed) {
    return NextResponse.json({ error: "Unlock this archived mission before viewing it." }, { status: 403 });
  }

  const { data, error } = await pocketbase
    .from("gaia_variables_classifications")
    .select("source_id,classification,note,created_at")
    .eq("user_id", user.id)
    .eq("game_date", date);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, date, classifications: data ?? [] });
}
