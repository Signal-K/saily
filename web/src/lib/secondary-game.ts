export type AsteroidAnomaly = {
  id: string;
  title: string;
  ticId: string;
  mission: string;
  imagePath: string;
  imageAlt: string;
};

export const ASTEROID_ANOMALIES: AsteroidAnomaly[] = [
  {
    id: "asteroid-001",
    title: "Sector 92 Candidate",
    ticId: "11270200",
    mission: "TESS",
    imagePath: "/puzzles/puzzle-2.svg",
    imageAlt: "Asteroid anomaly candidate in sector 92",
  },
  {
    id: "asteroid-002",
    title: "Sector 7 Candidate",
    ticId: "55871761",
    mission: "TESS",
    imagePath: "/puzzles/puzzle-3.svg",
    imageAlt: "Asteroid anomaly candidate in sector 7",
  },
  {
    id: "asteroid-003",
    title: "Sector 92 Follow-up",
    ticId: "71841620",
    mission: "TESS",
    imagePath: "/puzzles/puzzle-1.svg",
    imageAlt: "Asteroid anomaly follow-up image",
  },
];
