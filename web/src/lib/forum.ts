export type ThreadKind = "daily_live" | "ongoing";

export function getAestNowParts() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(new Date());
  const map = new Map(parts.map((part) => [part.type, part.value]));

  const date = `${map.get("year")}-${map.get("month")}-${map.get("day")}`;
  const hour = Number(map.get("hour") ?? "0");
  const minute = Number(map.get("minute") ?? "0");

  return {
    date,
    minutesAfterMidnight: hour * 60 + minute,
  };
}

export function getTodayAestDateKey() {
  return getAestNowParts().date;
}

export function isDailyLiveThreadLocked(puzzleDate: string) {
  const now = getAestNowParts();

  if (puzzleDate !== now.date) {
    return true;
  }

  // Live thread opens at 00:01 AEST.
  return now.minutesAfterMidnight < 1;
}

export function normalizeDateKey(value: string | null | undefined) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}
