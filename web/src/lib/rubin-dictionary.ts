export type RubinClassificationChoice = {
  id: string;
  label: string;
  description: string;
};

export const RUBIN_CLASSIFICATION_DICTIONARY: RubinClassificationChoice[] = [
  {
    id: "tail",
    label: "Tail",
    description: "A visible dust or ion tail streaming away from the nucleus.",
  },
  {
    id: "coma",
    label: "Coma",
    description: "A diffuse, fuzzy halo surrounding the nucleus with no distinct tail.",
  },
  {
    id: "both",
    label: "Tail & Coma",
    description: "Both a coma and a tail are visible in these frames.",
  },
  {
    id: "neither",
    label: "Neither",
    description: "No visible tail or coma — the object looks point-like or inactive.",
  },
  {
    id: "not-sure",
    label: "Not Sure",
    description: "Hard to tell from these frames.",
  },
];
