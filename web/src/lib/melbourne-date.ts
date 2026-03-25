export const MELBOURNE_TIME_ZONE = "Australia/Melbourne";

function formatMelbourneParts(date: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: MELBOURNE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const map = new Map(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(map.get("year") ?? "0"),
    month: Number(map.get("month") ?? "1"),
    day: Number(map.get("day") ?? "1"),
    hour: Number(map.get("hour") ?? "0"),
    minute: Number(map.get("minute") ?? "0"),
  };
}

export function getMelbourneDateKey(date: Date = new Date()) {
  const parts = formatMelbourneParts(date);
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function getMelbourneMinutesAfterMidnight(date: Date = new Date()) {
  const parts = formatMelbourneParts(date);
  return parts.hour * 60 + parts.minute;
}

export function normalizeDateKey(value: string | null | undefined) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return value;
}

export function resolveMelbourneDateKey(value: string | null | undefined) {
  const today = getMelbourneDateKey();
  const normalized = normalizeDateKey(value);
  if (!normalized) return today;
  if (normalized > today) return today;
  return normalized;
}

export function isPastMelbourneDateKey(dateKey: string) {
  return dateKey < getMelbourneDateKey();
}

export function dateKeyToUtcDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function shiftDateKey(dateKey: string, offsetDays: number) {
  const base = dateKeyToUtcDate(dateKey);
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return base.toISOString().slice(0, 10);
}

export function getMelbourneDayIndex(date: Date = new Date()) {
  const key = getMelbourneDateKey(date);
  const utcMidnight = dateKeyToUtcDate(key);
  return Math.floor(utcMidnight.getTime() / (1000 * 60 * 60 * 24));
}
