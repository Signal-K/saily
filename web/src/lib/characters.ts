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
    occupation: "Tourist",
    fleeReason: "Booked a holiday to Verdant Paradise and got dropped off in the wrong star system.",
    avatarSeed: "zix-tourist",
    tone: "warm",
  },
  "brix": {
    id: "brix",
    name: "Commander Brix",
    occupation: "Supply Corps",
    fleeReason: "Surveying planets for future supply depots across the outer rim.",
    avatarSeed: "brix-corps",
    tone: "serious",
  },
  "pip": {
    id: "pip",
    name: "Pip",
    occupation: "Navigation Cadet",
    fleeReason: "On their first solo certification mission — needs to find a planet with water.",
    avatarSeed: "pip-cadet",
    tone: "warm",
  },
  "carta": {
    id: "carta",
    name: "The Cartographer",
    occupation: "Cartographer",
    fleeReason: "Mapping an entire sector listed on existing charts as 'probably fine.'",
    avatarSeed: "carta-map",
    tone: "serious",
  },
};
