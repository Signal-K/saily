import { describe, expect, it } from "vitest";
import { getMissionGameOrder } from "../mission";

describe("mission game order", () => {
  it("returns the visible two-game mission path without asteroid", () => {
    const results = Array.from({ length: 12 }, (_, chapterIndex) => getMissionGameOrder("gizmo", chapterIndex));

    results.forEach((order) => {
      expect(order).toHaveLength(2);
      expect(order).toContain("planet");
      expect(order).toContain("mars");
      expect(order).not.toContain("asteroid");
    });
  });
});
