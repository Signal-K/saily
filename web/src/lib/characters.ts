// @doc/specs/characters-storylines — character definitions reference

export type Character = {
  id: string;
  name: string;
  occupation: string;
  fleeReason: string;
  avatarSeed: string;
  tone: "thriller" | "mystery" | "warm" | "serious";
};

export const CHARACTERS: Record<string, Character> = {
  "zix": {
    id: "zix",
    name: "Zix",
    occupation: "Atmosphere Tourist",
    fleeReason: "Came to Mars for the scenery and accidentally became invested in cloud classification.",
    avatarSeed: "zix-tourist",
    tone: "warm",
  },
  "brix": {
    id: "brix",
    name: "Commander Brix",
    occupation: "Variable-Star Triage Lead",
    fleeReason: "Sorting Gaia variable-star alerts into targets worth real telescope time.",
    avatarSeed: "brix-corps",
    tone: "serious",
  },
  "pip": {
    id: "pip",
    name: "Pip",
    occupation: "Junior Comet Scout",
    fleeReason: "Learning to tell real small-body activity from noise in Rubin imagery.",
    avatarSeed: "pip-cadet",
    tone: "warm",
  },
  "carta": {
    id: "carta",
    name: "The Cartographer",
    occupation: "Small-Body Cartographer",
    fleeReason: "Revising the active-asteroid catalogue anywhere rocks start behaving like comets.",
    avatarSeed: "carta-map",
    tone: "serious",
  },
};
