import { describe, expect, it } from "vitest";
import {
  normalizeDateKey,
  shiftDateKey,
  dateKeyToUtcDate,
  isPastMelbourneDateKey,
  getMelbourneDayIndex,
  getMelbourneDateKey,
  getMelbourneMinutesAfterMidnight,
  resolveMelbourneDateKey,
} from "../melbourne-date";

describe("normalizeDateKey", () => {
  it("returns null for falsy inputs", () => {
    expect(normalizeDateKey(null)).toBeNull();
    expect(normalizeDateKey(undefined)).toBeNull();
    expect(normalizeDateKey("")).toBeNull();
  });

  it("accepts a well-formed YYYY-MM-DD date", () => {
    expect(normalizeDateKey("2026-04-25")).toBe("2026-04-25");
    expect(normalizeDateKey("2000-01-01")).toBe("2000-01-01");
  });

  it("rejects wrong separators", () => {
    expect(normalizeDateKey("2026/04/25")).toBeNull();
    expect(normalizeDateKey("2026.04.25")).toBeNull();
  });

  it("rejects unpadded month or day", () => {
    expect(normalizeDateKey("2026-4-25")).toBeNull();
    expect(normalizeDateKey("2026-04-5")).toBeNull();
  });

  it("rejects datetime strings with time component", () => {
    expect(normalizeDateKey("2026-04-25T00:00:00Z")).toBeNull();
    expect(normalizeDateKey("2026-04-25T12:00:00.000Z")).toBeNull();
  });

  it("rejects non-date strings", () => {
    expect(normalizeDateKey("not-a-date")).toBeNull();
    expect(normalizeDateKey("hello world")).toBeNull();
  });
});

describe("shiftDateKey", () => {
  it("shifts forward by positive offset", () => {
    expect(shiftDateKey("2026-04-25", 1)).toBe("2026-04-26");
    expect(shiftDateKey("2026-04-25", 5)).toBe("2026-04-30");
  });

  it("shifts backward by negative offset", () => {
    expect(shiftDateKey("2026-04-25", -1)).toBe("2026-04-24");
    expect(shiftDateKey("2026-04-25", -25)).toBe("2026-03-31");
  });

  it("handles zero offset", () => {
    expect(shiftDateKey("2026-04-25", 0)).toBe("2026-04-25");
  });

  it("crosses month boundaries", () => {
    expect(shiftDateKey("2026-04-30", 1)).toBe("2026-05-01");
    expect(shiftDateKey("2026-05-01", -1)).toBe("2026-04-30");
  });

  it("crosses year boundaries", () => {
    expect(shiftDateKey("2026-12-31", 1)).toBe("2027-01-01");
    expect(shiftDateKey("2027-01-01", -1)).toBe("2026-12-31");
  });

  it("handles leap year February", () => {
    expect(shiftDateKey("2024-02-28", 1)).toBe("2024-02-29");
    expect(shiftDateKey("2024-02-29", 1)).toBe("2024-03-01");
  });
});

describe("dateKeyToUtcDate", () => {
  it("returns a Date at UTC midnight for the given key", () => {
    const d = dateKeyToUtcDate("2026-04-25");
    expect(d.getUTCFullYear()).toBe(2026);
    expect(d.getUTCMonth()).toBe(3); // April = 3
    expect(d.getUTCDate()).toBe(25);
    expect(d.getUTCHours()).toBe(0);
    expect(d.getUTCMinutes()).toBe(0);
    expect(d.getUTCSeconds()).toBe(0);
  });

  it("correctly parses January 1 1970", () => {
    const d = dateKeyToUtcDate("1970-01-01");
    expect(d.getTime()).toBe(0);
  });
});

describe("isPastMelbourneDateKey", () => {
  it("returns true for clearly past dates", () => {
    expect(isPastMelbourneDateKey("2020-01-01")).toBe(true);
    expect(isPastMelbourneDateKey("2000-06-15")).toBe(true);
  });

  it("returns false for clearly future dates", () => {
    expect(isPastMelbourneDateKey("2099-12-31")).toBe(false);
    expect(isPastMelbourneDateKey("2050-01-01")).toBe(false);
  });
});

describe("getMelbourneDayIndex", () => {
  it("returns a non-negative integer", () => {
    const idx = getMelbourneDayIndex();
    expect(Number.isInteger(idx)).toBe(true);
    expect(idx).toBeGreaterThanOrEqual(0);
  });

  it("increases by 1 for consecutive Melbourne dates", () => {
    // Use two UTC timestamps that are guaranteed to be different Melbourne dates.
    // 2026-04-25 at 14:00 UTC = 2026-04-26 00:00 AEST
    // 2026-04-24 at 14:00 UTC = 2026-04-25 00:00 AEST
    const d1 = new Date("2026-04-24T14:00:00Z");
    const d2 = new Date("2026-04-25T14:00:00Z");
    expect(getMelbourneDayIndex(d2) - getMelbourneDayIndex(d1)).toBe(1);
  });

  it("is deterministic for the same input date", () => {
    const d = new Date("2026-04-25T06:00:00Z");
    expect(getMelbourneDayIndex(d)).toBe(getMelbourneDayIndex(d));
  });
});

describe("getMelbourneDateKey", () => {
  it("returns a YYYY-MM-DD formatted string", () => {
    const key = getMelbourneDateKey();
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns the Melbourne date for a known UTC timestamp", () => {
    // 2026-04-25T14:30:00Z = 2026-04-26 00:30 AEST (UTC+10)
    const d = new Date("2026-04-25T14:30:00Z");
    expect(getMelbourneDateKey(d)).toBe("2026-04-26");
  });

  it("is one day ahead of UTC for early UTC morning when AEST is +10", () => {
    // 2026-06-15T01:00:00Z = 2026-06-15 11:00 AEST (UTC+10, no DST in June)
    const d = new Date("2026-06-15T01:00:00Z");
    expect(getMelbourneDateKey(d)).toBe("2026-06-15");
  });
});

describe("getMelbourneMinutesAfterMidnight", () => {
  it("returns a number between 0 and 1439", () => {
    const mins = getMelbourneMinutesAfterMidnight();
    expect(mins).toBeGreaterThanOrEqual(0);
    expect(mins).toBeLessThanOrEqual(1439);
  });

  it("returns the correct minutes for a known UTC timestamp", () => {
    // 2026-04-25T14:01:00Z = 2026-04-26 00:01 AEST (UTC+10)
    const d = new Date("2026-04-25T14:01:00Z");
    expect(getMelbourneMinutesAfterMidnight(d)).toBe(1);
  });

  it("returns 0 at Melbourne midnight", () => {
    // 2026-04-25T14:00:00Z = 2026-04-26 00:00 AEST
    const d = new Date("2026-04-25T14:00:00Z");
    expect(getMelbourneMinutesAfterMidnight(d)).toBe(0);
  });

  it("returns 60 one hour after Melbourne midnight", () => {
    // 2026-04-25T15:00:00Z = 2026-04-26 01:00 AEST
    const d = new Date("2026-04-25T15:00:00Z");
    expect(getMelbourneMinutesAfterMidnight(d)).toBe(60);
  });
});

describe("resolveMelbourneDateKey", () => {
  it("returns a valid date for null/undefined", () => {
    expect(resolveMelbourneDateKey(null)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(resolveMelbourneDateKey(undefined)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns the date unchanged for a valid past date", () => {
    expect(resolveMelbourneDateKey("2020-01-01")).toBe("2020-01-01");
  });

  it("clamps a future date to today", () => {
    const today = getMelbourneDateKey();
    expect(resolveMelbourneDateKey("2099-12-31")).toBe(today);
  });

  it("returns today for an invalid format", () => {
    const today = getMelbourneDateKey();
    expect(resolveMelbourneDateKey("not-a-date")).toBe(today);
    expect(resolveMelbourneDateKey("2026/04/25")).toBe(today);
  });
});
