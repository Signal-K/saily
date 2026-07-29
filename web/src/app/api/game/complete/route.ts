import { NextResponse } from "next/server";
import { isPastGameDate, resolveGameDate } from "@/lib/game";
import { shiftDateKey } from "@/lib/melbourne-date";
import { getDayAccessForUser } from "@/lib/day-access";
import { createClient } from "@/lib/pocketbase/server";
import { MISSION_GAME_REGISTRY, type MissionGame } from "@/lib/mission";

type UserStatsRow = {
  games_played: number;
  wins: number;
  current_streak: number;
  best_streak: number;
  total_score: number;
};

type BadgeRow = { id: string; slug: string; kind: string; threshold: number };

type CompleteBody = {
  game?: string;
  score?: number;
  date?: string;
};

function isMissionGame(value: unknown): value is MissionGame {
  return typeof value === "string" && MISSION_GAME_REGISTRY.includes(value as MissionGame);
}

function normalizeScore(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 100;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

// Games are independent — each one (crossword, transit spotter, close
// approach ranker, Cloudspotting on Mars) is completed and credited on its
// own, any time, in any order. This route is called once per finished game,
// not once per "mission" — a player can complete several different games on
// the same day and earn a Data Chip for each.
export async function POST(request: Request) {
  const pocketbase = await createClient();
  const {
    data: { user },
  } = await pocketbase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as CompleteBody;
  if (!isMissionGame(payload.game)) {
    return NextResponse.json({ error: "Invalid or missing game" }, { status: 400 });
  }
  const game = payload.game;
  const score = normalizeScore(payload.score);
  const date = resolveGameDate(payload.date);
  const access = await getDayAccessForUser(pocketbase, user.id, date);

  if (!access.allowed) {
    return NextResponse.json({ error: "Unlock this archived day before playing it." }, { status: 403 });
  }

  const isArchiveRun = isPastGameDate(date);

  if (isArchiveRun) {
    return NextResponse.json({
      ok: true,
      stats: null,
      badgesAwarded: 0,
      score: 0,
      awardedChips: 0,
      gameDate: date,
      game,
      archiveMode: true,
    });
  }

  // Idempotent per (user, game, date): replaying an already-completed game
  // today refreshes its score but never double-awards a chip or double-counts
  // streak/games_played.
  const { data: existingGamePlay } = await pocketbase
    .from("daily_plays")
    .select("id")
    .eq("user_id", user.id)
    .eq("game_date", date)
    .eq("game", game)
    .maybeSingle();

  const { data: existingAnyPlayToday } = await pocketbase
    .from("daily_plays")
    .select("id")
    .eq("user_id", user.id)
    .eq("game_date", date)
    .maybeSingle();

  const { error: playError } = await pocketbase.from("daily_plays").upsert(
    {
      user_id: user.id,
      game_date: date,
      game,
      attempts: 1,
      won: true,
      score,
      played_at: new Date().toISOString(),
    },
    { onConflict: "user_id,game_date,game" },
  );

  if (playError) {
    return NextResponse.json({ error: playError.message }, { status: 400 });
  }

  let newStats: UserStatsRow | null = null;
  let badgesAwarded = 0;
  let awardedChips = 0;

  if (!existingGamePlay) {
    // First time this exact game was completed today — award its chip.
    // Nothing else in the app provisions a `profiles` row on signup, so a
    // brand-new user has none yet; create it here rather than silently
    // skipping the reward (username must stay unique even for a
    // lazily-created row, so fall back to the user id).
    const { data: profile } = await pocketbase
      .from("profiles")
      .select("data_chips")
      .eq("shared_user_id", user.id)
      .maybeSingle();

    awardedChips = 1;
    const { error: chipsError } = await pocketbase.from("profiles").upsert(
      {
        shared_user_id: user.id,
        username: profile ? undefined : user.id,
        data_chips: (profile?.data_chips ?? 0) + awardedChips,
      },
      { onConflict: "shared_user_id" },
    );

    if (chipsError) {
      return NextResponse.json({ error: chipsError.message }, { status: 400 });
    }

    if (!existingAnyPlayToday) {
      // First game of any kind completed today — this is what advances the
      // daily streak, not each individual game.
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

      const earnedBadgeIds = new Set((earnedBadges ?? []).map((row: { badge: string }) => row.badge));
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
  }

  return NextResponse.json({
    ok: true,
    stats: newStats,
    badgesAwarded,
    awardedChips,
    score,
    gameDate: date,
    game,
  });
}
