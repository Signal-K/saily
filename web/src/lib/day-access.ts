import { createClient } from "@/lib/supabase/server";
import { getMelbourneDateKey } from "@/lib/melbourne-date";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

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
  supabase: ServerSupabase,
  userId: string | null | undefined,
  date: string,
): Promise<DayAccess> {
  const today = getMelbourneDateKey();
  const isToday = date === today;

  if (isToday) {
    return {
      date,
      isToday,
      allowed: true,
      signInRequired: false,
      requiresUnlock: false,
      completed: false,
      unlocked: false,
    };
  }

  if (!userId) {
    return {
      date,
      isToday,
      allowed: false,
      signInRequired: true,
      requiresUnlock: true,
      completed: false,
      unlocked: false,
    };
  }

  const [{ data: play }, { data: unlock }] = await Promise.all([
    supabase.from("daily_plays").select("game_date").eq("user_id", userId).eq("game_date", date).maybeSingle(),
    supabase.from("archive_unlocks").select("game_date").eq("user_id", userId).eq("game_date", date).maybeSingle(),
  ]);

  const completed = Boolean(play);
  const unlocked = Boolean(unlock);

  return {
    date,
    isToday,
    allowed: completed || unlocked,
    signInRequired: false,
    requiresUnlock: !completed && !unlocked,
    completed,
    unlocked,
  };
}
