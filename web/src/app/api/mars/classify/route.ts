import { NextResponse } from "next/server";
import { getDayAccessForUser } from "@/lib/day-access";
import { isPastGameDate } from "@/lib/game";
import { createClient } from "@/lib/supabase/server";
import { resolveGameDate } from "@/lib/game";

type ClassifyBody = {
  date?: string;
  classifications?: Array<{
    imageId: string;
    imageUrl: string;
    annotations?: unknown[];
    note?: string;
  }>;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as ClassifyBody;
  const date = resolveGameDate(payload.date);
  const access = await getDayAccessForUser(supabase, user.id, date);
  if (!access.allowed) {
    return NextResponse.json({ error: "Unlock this archived mission before submitting it." }, { status: 403 });
  }
  const classifications = Array.isArray(payload.classifications) ? payload.classifications : [];

  if (classifications.length === 0) {
    return NextResponse.json({ error: "No classifications provided" }, { status: 400 });
  }

  const rows = classifications
    .filter((c) => {
      if (!c.imageId || typeof c.imageId !== "string") return false;
      if (!c.imageUrl || typeof c.imageUrl !== "string") return false;
      return true;
    })
    .map((c) => ({
      user_id: user.id,
      game_date: date,
      image_id: c.imageId.slice(0, 80),
      image_url: c.imageUrl.slice(0, 500),
      annotations: Array.isArray(c.annotations) ? c.annotations : [],
      confidence: 100,
      note: c.note ? c.note.slice(0, 1000) : null,
    }));

  if (rows.length === 0) {
    return NextResponse.json({ error: "No valid classifications" }, { status: 400 });
  }

  const { error } = await supabase
    .from("mars_classifications")
    .upsert(rows, { onConflict: "user_id,game_date,image_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const avgConfidence = 100;
  const totalAnnotations = rows.reduce((sum, r) => sum + r.annotations.length, 0);
  
  // Base 40 + points for images + points for annotations + confidence bonus
  const score = Math.round(40 + (rows.length * 10) + (totalAnnotations * 5) + (avgConfidence * 0.2));

  return NextResponse.json({ ok: true, classified: rows.length, score: isPastGameDate(date) ? 0 : score, archiveMode: isPastGameDate(date) });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const date = resolveGameDate(url.searchParams.get("date"));
  const access = await getDayAccessForUser(supabase, user.id, date);
  if (!access.allowed) {
    return NextResponse.json({ error: "Unlock this archived mission before viewing it." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("mars_classifications")
    .select("image_id,classification,confidence,annotations,note,created_at")
    .eq("user_id", user.id)
    .eq("game_date", date);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, date, classifications: data ?? [] });
}
