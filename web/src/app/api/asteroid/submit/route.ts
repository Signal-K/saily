import { NextResponse } from "next/server";
import { getDayAccessForUser } from "@/lib/day-access";
import { isPastGameDate } from "@/lib/game";
import { createClient } from "@/lib/supabase/server";
import { resolveGameDate } from "@/lib/game";

type SubmitBody = {
  anomalyKey?: string;
  date?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as SubmitBody;
  const anomalyKey =
    typeof payload.anomalyKey === "string" ? payload.anomalyKey.trim().slice(0, 80) : "";
  const date = resolveGameDate(payload.date);
  const access = await getDayAccessForUser(supabase, user.id, date);

  if (!access.allowed) {
    return NextResponse.json({ error: "Unlock this archived mission before submitting it." }, { status: 403 });
  }

  if (!anomalyKey) {
    return NextResponse.json({ error: "Invalid anomalyKey" }, { status: 400 });
  }

  // Fetch current draft to count annotations for scoring.
  const { data: draft } = await supabase
    .from("asteroid_annotation_drafts")
    .select("annotations,submitted_at")
    .eq("user_id", user.id)
    .eq("anomaly_key", anomalyKey)
    .maybeSingle();

  if (draft?.submitted_at) {
    const annotations = Array.isArray(draft.annotations) ? draft.annotations.length : 0;
    const score = scoreAnnotations(annotations);
    return NextResponse.json({ ok: true, alreadySubmitted: true, score });
  }

  const annotations = Array.isArray(draft?.annotations) ? draft.annotations.length : 0;
  const score = scoreAnnotations(annotations);

  if (isPastGameDate(date)) {
    return NextResponse.json({ ok: true, score: 0, archiveMode: true });
  }

  const { error } = await supabase
    .from("asteroid_annotation_drafts")
    .update({ submitted_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("anomaly_key", anomalyKey);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  void date; // reserved for future per-date daily play tracking

  return NextResponse.json({ ok: true, score });
}

function scoreAnnotations(count: number): number {
  // 40 base for completing, up to 40 bonus for up to 5 annotations.
  return Math.round(40 + Math.min(count, 5) * 8);
}
