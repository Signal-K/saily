import { NextResponse } from "next/server";
import { getDayAccessForUser } from "@/lib/day-access";
import { resolveGameDate } from "@/lib/game";
import { INSIGHT_FALLBACK_SOLS, getInsightAnswer, parseInsightFeed, type InsightSol } from "@/lib/insight";
import { createClient } from "@/lib/supabase/server";

type SubmitBody = {
  date?: string;
  selectedSol?: string;
};

async function fetchLiveInsightSols(): Promise<InsightSol[]> {
  const apiKey = process.env.NASA_API_KEY?.trim() || "DEMO_KEY";
  const url = new URL("https://api.nasa.gov/insight_weather/");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("feedtype", "json");
  url.searchParams.set("ver", "1.0");

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 * 60 * 6 },
  });

  if (!response.ok) {
    throw new Error(`InSight feed failed: ${response.status}`);
  }

  const json = (await response.json()) as Record<string, unknown>;
  return parseInsightFeed(json);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = (await request.json().catch(() => ({}))) as SubmitBody;
  const date = resolveGameDate(payload.date);
  const selectedSol = typeof payload.selectedSol === "string" ? payload.selectedSol.trim() : "";
  const access = await getDayAccessForUser(supabase, user?.id, date);

  if (!access.allowed) {
    return NextResponse.json({ error: "Unlock this archived mission before playing it." }, { status: 403 });
  }

  if (!selectedSol) {
    return NextResponse.json({ error: "selectedSol is required" }, { status: 400 });
  }

  let source: "live" | "fallback" = "fallback";
  let pool = INSIGHT_FALLBACK_SOLS;

  try {
    const live = await fetchLiveInsightSols();
    if (live.length >= 5) {
      pool = live;
      source = "live";
    }
  } catch {
    // Fallback is intentional for stability.
  }

  const answer = getInsightAnswer(date, pool);
  const correct = selectedSol === answer.answerSol;
  const score = correct ? 90 : 20;

  return NextResponse.json({
    ok: true,
    source,
    correct,
    score,
    answerSol: answer.answerSol,
    metric: answer.puzzle.metric,
    metricLabel: answer.puzzle.metricLabel,
    baseline: answer.baseline,
    answerValue: answer.answerValue,
    archiveMode: !access.isToday,
  });
}
