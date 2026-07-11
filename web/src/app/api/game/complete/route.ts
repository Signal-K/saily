import { NextResponse } from "next/server";
import { isPastGameDate, resolveGameDate } from "@/lib/game";
import { shiftDateKey } from "@/lib/melbourne-date";
import { getDayAccessForUser } from "@/lib/day-access";
import { createClient } from "@/lib/pocketbase/server";

type UserStatsRow = {
  games_played: number;
  wins: number;
  current_streak: number;
  best_streak: number;
  total_score: number;
};

type BadgeRow = { id: string; slug: string; kind: string; threshold: number };

type CompleteBody = {
  completedPuzzles?: number;
  note?: string;
  date?: string;
};

function normalizeNumber(value: unknown, fallback: number, min: number, max: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.min(max, Math.round(numeric)));
}

export async function POST(request: Request) {
  const pocketbase = await createClient();
  const {
    data: { user },
  } = await pocketbase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as CompleteBody;
  const completedPuzzles = normalizeNumber(payload.completedPuzzles, 3, 1, 3);
  const confidence = 100;
  const date = resolveGameDate(payload.date);
  const access = await getDayAccessForUser(pocketbase, user.id, date);

  if (!access.allowed) {
    return NextResponse.json({ error: "Unlock this archived mission before playing it." }, { status: 403 });
  }

  const isArchiveRun = isPastGameDate(date);
  const xpMultiplier = isArchiveRun ? 0 : 1;

  const attempts = Math.max(1, 4 - completedPuzzles);
  const baseScore = Math.round((completedPuzzles / 3) * (60 + confidence * 0.4));
  const score = Math.max(1, Math.round(baseScore * xpMultiplier));

  if (isArchiveRun) {
    return NextResponse.json({
      ok: true,
      stats: null,
      badgesAwarded: 0,
      score: 0,
      xpMultiplier,
      gameDate: date,
      archiveMode: true,
    });
  }

  // Keep note payload for future analytics, if provided.
  void payload.note;

  // Idempotent: if this date was already recorded, only refresh the play
  // row's attempts/score — don't double-count games_played/streak/score.
  const { data: existingPlay } = await pocketbase
    .from("daily_plays")
    .select("id")
    .eq("user_id", user.id)
    .eq("game_date", date)
    .maybeSingle();

  const { error: playError } = await pocketbase.from("daily_plays").upsert(
    {
      user_id: user.id,
      game_date: date,
      attempts,
      won: true,
      score,
      played_at: new Date().toISOString(),
    },
    { onConflict: "user_id,game_date" },
  );

  if (playError) {
    return NextResponse.json({ error: playError.message }, { status: 400 });
  }

  const { data: existingStats } = await pocketbase
    .from("user_stats")
    .select("games_played,wins,current_streak,best_streak,total_score")
    .eq("user_id", user.id)
    .maybeSingle();

  const stats: UserStatsRow = existingStats ?? {
    games_played: 0,
    wins: 0,
    current_streak: 0,
    best_streak: 0,
    total_score: 0,
  };

  let newStats = stats;
  let badgesAwarded = 0;

  if (!existingPlay) {
    const yesterday = shiftDateKey(date, -1);
    const { data: yesterdayPlay } = await pocketbase
      .from("daily_plays")
      .select("id")
      .eq("user_id", user.id)
      .eq("game_date", yesterday)
      .maybeSingle();

    const currentStreak = yesterdayPlay ? stats.current_streak + 1 : 1;
    newStats = {
      games_played: stats.games_played + 1,
      wins: stats.wins + 1,
      current_streak: currentStreak,
      best_streak: Math.max(stats.best_streak, currentStreak),
      total_score: stats.total_score + score,
    };

    const { error: statsError } = await pocketbase
      .from("user_stats")
      .upsert({ user_id: user.id, ...newStats }, { onConflict: "user_id" });

    if (statsError) {
      return NextResponse.json({ error: statsError.message }, { status: 400 });
    }

    const [{ data: badges }, { data: earnedBadges }] = await Promise.all([
      pocketbase.from("badges").select("id,slug,kind,threshold"),
      pocketbase.from("user_badges").select("badge").eq("user_id", user.id),
    ]);

    const earnedBadgeIds = new Set((earnedBadges ?? []).map((row) => row.badge));
    const statValueByKind: Record<string, number> = {
      wins: newStats.wins,
      streak: newStats.current_streak,
      games: newStats.games_played,
    };

    const toAward = ((badges ?? []) as BadgeRow[]).filter((badge) => {
      if (earnedBadgeIds.has(badge.id)) return false;
      const value = statValueByKind[badge.kind];
      return value !== undefined && value >= badge.threshold;
    });

    if (toAward.length > 0) {
      await Promise.all(
        toAward.map((badge) =>
          pocketbase.from("user_badges").insert({
            user_id: user.id,
            badge: badge.id,
            awarded_at: new Date().toISOString(),
          }),
        ),
      );
      badgesAwarded = toAward.length;
    }
  }

  return NextResponse.json({
    ok: true,
    stats: newStats,
    badgesAwarded,
    score,
    xpMultiplier,
    gameDate: date,
  });
}
