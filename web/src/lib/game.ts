import { getMelbourneDateKey, isPastMelbourneDateKey, normalizeDateKey, resolveMelbourneDateKey } from "@/lib/melbourne-date";

export function getDateKey(date: Date = new Date()): string {
  return getMelbourneDateKey(date);
}

export function normalizeGameDateParam(value: string | null | undefined): string | null {
  return normalizeDateKey(value);
}

export function resolveGameDate(value: string | null | undefined): string {
  return resolveMelbourneDateKey(value);
}

export function isPastGameDate(dateKey: string): boolean {
  return isPastMelbourneDateKey(dateKey);
}
