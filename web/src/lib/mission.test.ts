import { describe, expect, it } from "vitest";
import { MISSION_GAME_REGISTRY, MISSION_GAMES } from "./mission";

describe("mission game registry", () => {
  it("registers every independent game", () => {
    expect(new Set(MISSION_GAMES)).toEqual(new Set(MISSION_GAME_REGISTRY));
  });

  it("includes all four standalone games", () => {
    expect(MISSION_GAMES).toEqual(
      expect.arrayContaining(["crossword", "dsmr", "close_approach", "cloudspotting_mars"]),
    );
  });
});
