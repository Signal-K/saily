export type Character = {
  id: string;
  name: string;
  occupation: string;
  avatarSeed: string;
  tone: "thriller" | "mystery" | "warm" | "serious";
};

export const CHARACTERS: Record<string, Character> = {
  "gizmo": {
    id: "gizmo",
    name: "Gizmo",
    occupation: "Field Classification Unit",
    avatarSeed: "gizmo",
    tone: "warm",
  },
};
