import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const date = requestUrl.searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id,body,created_at,profiles(username)")
    .eq("game_date", date)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ comments: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { date?: string; body?: string };
  const date = body.date;
  const content = body.body?.trim();

  if (!date || !content) {
    return NextResponse.json({ error: "date and body are required" }, { status: 400 });
  }

  const { error } = await supabase.from("comments").insert({
    game_date: date,
    user_id: user.id,
    body: content,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.rpc("award_comment_badges");
  return NextResponse.json({ ok: true });
}
