import { describe, expect, it } from "vitest";
import { getMissionGameOrder } from "./mission";

describe("mission game order", () => {
  it("returns three unique games and can rotate InSight into the mission", () => {
    const results = Array.from({ length: 12 }, (_, chapterIndex) => getMissionGameOrder("juniper", chapterIndex));

    results.forEach((order) => {
      expect(order).toHaveLength(3);
      expect(new Set(order).size).toBe(3);
    });

    expect(results.some((order) => order.includes("insight"))).toBe(true);
  });
});
