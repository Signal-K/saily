import { describe, expect, it, vi } from "vitest";
import {
  getMelbourneDateKey,
  getMelbourneMinutesAfterMidnight,
  resolveMelbourneDateKey,
} from "../melbourne-date";

describe("melbourne-date", () => {
  it("returns correct date key for Melbourne time", () => {
    // 2026-04-25 10:00 UTC is 2026-04-25 20:00 or 21:00 Melbourne
    const date = new Date("2026-04-25T10:00:00Z");
    const key = getMelbourneDateKey(date);
    expect(key).toBe("2026-04-25");
  });

  it("returns correct minutes after midnight", () => {
    // 2026-04-25T00:30:00 in Melbourne
    // We use a date that we know is 00:30 in Melbourne.
    // en-CA format used in melbourne-date logic: YYYY-MM-DD, HH:mm
    const date = new Date("2026-04-24T14:30:00Z"); // UTC+10 (AEST) -> 00:30 on 25th
    const mins = getMelbourneMinutesAfterMidnight(date);
    expect(mins).toBe(30);
  });

  describe("resolveMelbourneDateKey", () => {
    it("returns today if input is null", () => {
      const today = getMelbourneDateKey();
      expect(resolveMelbourneDateKey(null)).toBe(today);
    });

    it("returns today if input is in the future", () => {
      const today = getMelbourneDateKey();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2); // Definitely future
      const futureKey = getMelbourneDateKey(tomorrow);
      expect(resolveMelbourneDateKey(futureKey)).toBe(today);
    });

    it("returns the input if it is a valid past date", () => {
      expect(resolveMelbourneDateKey("2026-01-01")).toBe("2026-01-01");
    });
  });
});
