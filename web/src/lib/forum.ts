import { getMelbourneDateKey, getMelbourneMinutesAfterMidnight } from "@/lib/melbourne-date";

export type ThreadKind = "daily_live" | "ongoing";

export function getTodayAestDateKey() {
  return getMelbourneDateKey();
}

export function isDailyLiveThreadLocked(puzzleDate: string) {
  const now = {
    date: getMelbourneDateKey(),
    minutesAfterMidnight: getMelbourneMinutesAfterMidnight(),
  };

  if (puzzleDate !== now.date) {
    return true;
  }

  // Live thread opens at 00:01 AEST.
  return now.minutesAfterMidnight < 1;
}

/**
 * "6. Forum/Thread Gating" (saily-launch-seed-bible-v0.md): a day's community
 * thread is Hidden while its mission is in progress and Revealed once the
 * player has completed it (all puzzles in both games submitted).
 *
 * This is a *different* gate than `isDailyLiveThreadLocked` above, which is
 * purely time-based (thread doesn't open until 00:01 AEST same day). The two
 * flags are independent — a thread can be:
 *   - not time-locked, but still hidden-until-completion (player hasn't
 *     finished today's mission yet even though the thread window is open)
 *   - time-locked, but not hidden-until-completion (e.g. an archive day the
 *     player already completed, whose live-thread window has since passed)
 *
 * `threadRow.hidden_until_completion` is the per-thread flag persisted on
 * `forum_threads` (see backend/migrations/9_forum_thread_gate.go). It starts
 * `true` for every thread; this function is what actually flips it to
 * "revealed" for a given viewer once their day access shows `completed`.
 */
export type ForumThreadGateRow = {
  hidden_until_completion: boolean;
};

export type ForumThreadGateDayAccess = {
  completed: boolean;
};

export function isThreadHiddenUntilCompletion(
  threadRow: ForumThreadGateRow,
  dayAccess: ForumThreadGateDayAccess,
): boolean {
  if (!threadRow.hidden_until_completion) {
    return false;
  }

  return !dayAccess.completed;
}
