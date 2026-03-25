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
