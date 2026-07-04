export type GaiaClassificationChoice = {
  id: string;
  label: string;
  description: string;
};

export const GAIA_CLASSIFICATION_DICTIONARY: GaiaClassificationChoice[] = [
  {
    id: "eclipsing-binary",
    label: "Eclipsing Binary",
    description: "Sharp, periodic dips as one star passes in front of the other.",
  },
  {
    id: "pulsating",
    label: "Pulsating",
    description: "Smooth, repeating rise-and-fall brightness cycle (e.g. Cepheid or RR Lyrae-like).",
  },
  {
    id: "irregular",
    label: "Irregular",
    description: "Variability with no clear repeating period or shape.",
  },
  {
    id: "not-sure",
    label: "Not Sure",
    description: "Hard to tell the variability type from this curve.",
  },
];
