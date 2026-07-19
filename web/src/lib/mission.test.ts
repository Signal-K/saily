import { describe, expect, it } from "vitest";
import { getMissionGameOrder, MISSION_GAME_REGISTRY, MISSION_GAMES } from "./mission";

describe("mission game order", () => {
  it("includes every configured minigame in the mission flow", () => {
    const order = getMissionGameOrder("gizmo", 3);

    expect(order).toHaveLength(MISSION_GAMES.length);
    expect(new Set(order)).toEqual(new Set(MISSION_GAMES));
  });

  it("starts new users on the crossword puzzle", () => {
    const order = getMissionGameOrder("gizmo", 0);

    expect(order[0]).toBe("crossword");
  });

  it("registers close approach ranker without enabling it in the default daily rotation", () => {
    expect(MISSION_GAME_REGISTRY).toContain("close_approach");
    expect(MISSION_GAMES).not.toContain("close_approach");
  });
});
