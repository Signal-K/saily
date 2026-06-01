export const puzzleOptions = [
  "Lightcurve transit hunting",
  "Image annotation",
  "Pattern and anomaly spotting",
  "Cosmic crossword",
  "Daily logic grid",
  "Spot the asteroid",
];

export const storyOptions = [
  "Brand-new discoveries",
  "Stunning imagery",
  "People behind the science",
  "Mission and launch updates",
  "Deep explainers",
  "Data I can dig into",
];

export const returnOptions = [
  "Daily puzzle streak",
  "One new discovery each day",
  "Short reels",
  "Community leaderboard",
  "Email digest",
  "Data chips and rewards",
];

export const games = [
  {
    title: "Landnam",
    status: "Star Sailors flagship",
    body: "Hunt for real exoplanets, then manage the ship and crew that turns a signal into a journey.",
    href: "https://starsailors.space",
    image: "/puzzles/puzzle-1.svg",
  },
  {
    title: "Asteroid Hunters",
    status: "Survey game",
    body: "Sweep survey frames for moving points of light and help track the rocks crossing our sky.",
    href: "https://starsailors.space",
    image: "/puzzles/puzzle-3.svg",
  },
];

export const newsroom = [
  {
    kicker: "Lead story",
    title: "What TESS saw in Sector 7-G",
    body: "A plain-language walkthrough of the signal, the uncertainty, and what the crew checks next.",
  },
  {
    kicker: "Daily reel",
    title: "How a single dip becomes a planet",
    body: "A short visual dispatch for readers who want the science in under a minute.",
  },
  {
    kicker: "Puzzle desk",
    title: "The first edition grid",
    body: "A small daily puzzle that points back to real mission data, not generic trivia.",
  },
];

export const teamCards = [
  {
    name: "Liam Martin",
    role: "Game designer",
    group: "Team",
    icon: "/team/liam-martin.svg",
  },
  {
    name: "Rhys Campbell",
    role: "Machine learning lead",
    group: "Team",
    icon: "/team/rhys-campbell.svg",
  },
  {
    name: "Fred Bruce",
    role: "Audio and visual interfacing",
    group: "Team",
    icon: "/team/fred-bruce.svg",
  },
  {
    name: "Dev Pena",
    role: "Software",
    group: "With thanks",
    icon: "/team/dev-pena.svg",
  },
  {
    name: "Matt Kane",
    role: "QA",
    group: "With thanks",
    icon: "/team/matt-kane.svg",
  },
  {
    name: "Tom Roshin",
    role: "QA",
    group: "With thanks",
    icon: "/team/tom-roshin.svg",
  },
] as const;
