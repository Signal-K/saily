import { createClient } from "@/lib/pocketbase/server";
import { getMelbourneDateKey } from "@/lib/melbourne-date";

type ServerPocketBase = Awaited<ReturnType<typeof createClient>>;

export type DayAccess = {
  date: string;
  isToday: boolean;
  allowed: boolean;
  signInRequired: boolean;
  requiresUnlock: boolean;
  completed: boolean;
  unlocked: boolean;
};

export async function getDayAccessForUser(
  pocketbase: ServerPocketBase,
  userId: string | null | undefined,
  date: string,
): Promise<DayAccess> {
  const today = getMelbourneDateKey();
  const isToday = date === today;

  if (!userId) {
    return {
      date,
      isToday,
      // Today's puzzle is never locked behind sign-in; only archived days are.
      allowed: isToday,
      signInRequired: !isToday,
      requiresUnlock: !isToday,
      completed: false,
      unlocked: false,
    };
  }

  const [{ data: play }, { data: unlock }] = await Promise.all([
    pocketbase.from("daily_plays").select("game_date").eq("user_id", userId).eq("game_date", date).maybeSingle(),
    pocketbase.from("archive_unlocks").select("game_date").eq("user_id", userId).eq("game_date", date).maybeSingle(),
  ]);

  const completed = Boolean(play);
  const unlocked = Boolean(unlock);

  return {
    date,
    isToday,
    // Today's puzzle is always playable regardless of completion; archived
    // days require either a completion record or an explicit unlock.
    allowed: isToday || completed || unlocked,
    signInRequired: false,
    requiresUnlock: !isToday && !completed && !unlocked,
    completed,
    unlocked,
  };
}
