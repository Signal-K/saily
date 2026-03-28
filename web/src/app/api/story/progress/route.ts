import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { STORYLINES } from "@/lib/storylines";

const VALID_STORYLINE_IDS = new Set(STORYLINES.map((s) => s.id));

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const storylineId = url.searchParams.get("storylineId") ?? "";

  if (!VALID_STORYLINE_IDS.has(storylineId)) {
    return NextResponse.json({ error: "Invalid storylineId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("user_story_progress")
    .select("storyline_id,chapter_index,last_played_at")
    .eq("user_id", user.id)
    .eq("storyline_id", storylineId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    chapterIndex: data?.chapter_index ?? 0,
    lastPlayedAt: data?.last_played_at ?? null,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as {
    storylineId?: string;
    action?: string;
  };

  const storylineId = typeof payload.storylineId === "string" ? payload.storylineId.trim() : "";
  const action = payload.action;

  if (!VALID_STORYLINE_IDS.has(storylineId)) {
    return NextResponse.json({ error: "Invalid storylineId" }, { status: 400 });
  }

  if (action !== "complete-chapter") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const storyline = STORYLINES.find((s) => s.id === storylineId)!;
  const maxChapter = storyline.chapters.length;

  // Fetch current index before incrementing
  const { data: existing } = await supabase
    .from("user_story_progress")
    .select("chapter_index")
    .eq("user_id", user.id)
    .eq("storyline_id", storylineId)
    .maybeSingle();

  const currentIndex = existing?.chapter_index ?? 0;
  const nextIndex = Math.min(currentIndex + 1, maxChapter);

  const { data, error } = await supabase
    .from("user_story_progress")
    .upsert(
      {
        user_id: user.id,
        storyline_id: storylineId,
        chapter_index: nextIndex,
        last_played_at: new Date().toISOString(),
      },
      { onConflict: "user_id,storyline_id" },
    )
    .select("storyline_id,chapter_index,last_played_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const isComplete = data.chapter_index >= maxChapter;
  let awardedChips = 0;
  let referralCode = null;

  if (isComplete) {
    // Check if this storyline was already completed before to avoid double-rewarding
    const { data: profile } = await supabase
      .from("profiles")
      .select("completed_storylines, referral_code, data_chips")
      .eq("id", user.id)
      .single();
    
    referralCode = profile?.referral_code;

    if (profile && !profile.completed_storylines.includes(storylineId)) {
      awardedChips = 2;
      const newCompleted = [...profile.completed_storylines, storylineId];
      
      await supabase
        .from("profiles")
        .update({ 
          completed_storylines: newCompleted,
          data_chips: profile.data_chips + awardedChips
        })
        .eq("id", user.id);
    }
  }

  return NextResponse.json({
    ok: true,
    chapterIndex: data.chapter_index,
    isComplete,
    awardedChips,
    referralCode,
  });
}
