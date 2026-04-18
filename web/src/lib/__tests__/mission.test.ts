import { describe, expect, it } from "vitest";
import { getMissionGameOrder } from "../mission";

describe("mission game order", () => {
  it("returns a single-game mission for the locked MVP path", () => {
    const results = Array.from({ length: 12 }, (_, chapterIndex) => getMissionGameOrder("juniper", chapterIndex));

    results.forEach((order) => {
      expect(order).toHaveLength(1);
      expect(["asteroid", "mars", "planet"]).toContain(order[0]);
    });
  });
});
