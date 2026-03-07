export type Character = {
  id: string;
  name: string;
  occupation: string;
  fleeReason: string;
  avatarSeed: string;
  tone: "thriller" | "mystery" | "warm" | "serious";
};

export const CHARACTERS: Record<string, Character> = {
  "mara-chen": {
    id: "mara-chen",
    name: "Dr. Mara Chen",
    occupation: "Exobiologist",
    fleeReason: "Discovered evidence of extraterrestrial contact buried in classified telescope data — now being hunted by those who want it buried.",
    avatarSeed: "mara-chen-sci",
    tone: "thriller",
  },
  "kai-voss": {
    id: "kai-voss",
    name: "Kai Voss",
    occupation: "Student",
    fleeReason: "His late mother left him coordinates to something extraordinary — a corporation wants them back.",
    avatarSeed: "kai-voss-heir",
    tone: "mystery",
  },
  "atlas-torres": {
    id: "atlas-torres",
    name: "Commander Atlas Torres",
    occupation: "Former Military",
    fleeReason: "Walked away after discovering the war he fought was manufactured for corporate resource rights. Now officially a deserter.",
    avatarSeed: "atlas-torres-cmd",
    tone: "serious",
  },
  "yara-osei": {
    id: "yara-osei",
    name: "Dr. Yara Osei",
    occupation: "Botanist & Conservationist",
    fleeReason: "Carrying 17,000 seed species to a new world before Earth loses them forever.",
    avatarSeed: "yara-osei-bot",
    tone: "warm",
  },
};
