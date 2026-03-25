import { NextResponse } from "next/server";
import { getDayAccessForUser } from "@/lib/day-access";
import { resolveGameDate } from "@/lib/game";
import { INSIGHT_FALLBACK_SOLS, getInsightPuzzle, parseInsightFeed, type InsightSol } from "@/lib/insight";
import { createClient } from "@/lib/supabase/server";

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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = resolveGameDate(url.searchParams.get("date"));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const access = await getDayAccessForUser(supabase, user?.id, date);

  if (!access.allowed) {
    return NextResponse.json({
      ok: true,
      date,
      access,
      puzzle: null,
      source: null,
      user: user ? { id: user.id, email: user.email } : null,
    });
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

  return NextResponse.json({
    ok: true,
    date,
    access,
    source,
    puzzle: getInsightPuzzle(date, pool),
    user: user ? { id: user.id, email: user.email } : null,
  });
}
