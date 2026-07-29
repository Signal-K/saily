// Each of these games is independent — a player can complete any of them,
// any time, in any order. There is no chained "mission" tying them together;
// completing one earns its own Data Chip (see /api/game/complete).
export type MissionGame = "crossword" | "dsmr" | "close_approach" | "cloudspotting_mars";

export const MISSION_GAME_REGISTRY: MissionGame[] = ["crossword", "dsmr", "close_approach", "cloudspotting_mars"];
export const MISSION_GAMES: MissionGame[] = ["crossword", "dsmr", "close_approach", "cloudspotting_mars"];
