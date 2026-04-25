import { describe, expect, it } from "vitest";
import { getTodayAestDateKey, isDailyLiveThreadLocked } from "../forum";
import { getMelbourneMinutesAfterMidnight } from "../melbourne-date";

describe("getTodayAestDateKey", () => {
  it("returns a valid YYYY-MM-DD date string", () => {
    const key = getTodayAestDateKey();
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns a plausible date (year >= 2024)", () => {
    const year = parseInt(getTodayAestDateKey().slice(0, 4), 10);
    expect(year).toBeGreaterThanOrEqual(2024);
  });
});

describe("isDailyLiveThreadLocked", () => {
  it("returns true for a past puzzle date", () => {
    expect(isDailyLiveThreadLocked("2020-01-01")).toBe(true);
    expect(isDailyLiveThreadLocked("2024-06-15")).toBe(true);
  });

  it("returns true for a future puzzle date", () => {
    expect(isDailyLiveThreadLocked("2099-12-31")).toBe(true);
    expect(isDailyLiveThreadLocked("2050-01-01")).toBe(true);
  });

  it("returns false for today when it is past 00:01 AEST (almost always true during CI)", () => {
    // This test may only be wrong if tests run at exactly 00:00 Melbourne time.
    // We skip the case where minutesAfterMidnight < 1 (i.e. exactly midnight).
    const today = getTodayAestDateKey();
    const mins: number = getMelbourneMinutesAfterMidnight();
    if (mins >= 1) {
      expect(isDailyLiveThreadLocked(today)).toBe(false);
    } else {
      // At Melbourne midnight (00:00), today's thread is still locked.
      expect(isDailyLiveThreadLocked(today)).toBe(true);
    }
  });
});
