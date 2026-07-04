import type { AvatarExpression } from "./avatar";

export type Chapter = {
  index: number;
  title: string;
  briefing: string;
  briefingExpression?: AvatarExpression;
  update1: string;
  update1Expression?: AvatarExpression;
  update2: string;
  update2Expression?: AvatarExpression;
  resolution: string;
  resolutionExpression?: AvatarExpression;
  ambience?: "wind" | "ship" | "lab" | "none";
};

export type Storyline = {
  id: string;
  characterId: string;
  title: string;
  chapters: Chapter[];
  postcardTitle: string;
  postcardMessage: string;
};

// ---------------------------------------------------------------------------
// Gizmo — Active Survey
// ---------------------------------------------------------------------------

const GIZMO_CHAPTERS: Chapter[] = [
  {
    index: 0,
    title: "Three Datasets",
    briefing:
      "Today's mission covers two active surveys — planet transits and Mars surface data. Work through each one and I'll check in between.",
    briefingExpression: "happy",
    update1: "Good start. Two more to go.",
    update1Expression: "neutral",
    update2: "Nearly there. One left.",
    update2Expression: "neutral",
    resolution: "All three done. Good work today.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
  {
    index: 1,
    title: "Signal vs Noise",
    briefing:
      "Across today's three surveys, your job is to separate real signals from noise. Each dataset looks different — the principle is the same.",
    briefingExpression: "neutral",
    update1: "One down. Keep that same approach.",
    update1Expression: "neutral",
    update2: "Two down. Stay consistent.",
    update2Expression: "neutral",
    resolution: "Three accurate calls added to the record.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
  {
    index: 2,
    title: "Borderline Cases",
    briefing:
      "Today's data includes some borderline examples across all three surveys. Take your time before committing to a call.",
    briefingExpression: "serious",
    update1: "One done. On to the next dataset.",
    update1Expression: "neutral",
    update2: "Two done. One more.",
    update2Expression: "neutral",
    resolution: "Finished. Borderline calls are still useful — you made a decision.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
  {
    index: 3,
    title: "Clean Rejections",
    briefing:
      "Not everything in today's three surveys will show something interesting. A correct 'nothing here' is just as valuable as a detection.",
    briefingExpression: "neutral",
    update1: "One survey done. Same care for the next.",
    update1Expression: "neutral",
    update2: "Two surveys done. Last one.",
    update2Expression: "neutral",
    resolution: "All three logged. Clean calls keep the catalogue honest.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
  {
    index: 4,
    title: "Live Queue",
    briefing:
      "Today's data is live. Your classifications across all three surveys go directly to the research teams.",
    briefingExpression: "serious",
    update1: "First survey done. The data is real and so is your contribution.",
    update1Expression: "neutral",
    update2: "Two surveys complete. One left.",
    update2Expression: "neutral",
    resolution: "All three surveys filed. The observation chain continues.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
  {
    index: 5,
    title: "Coma Watch",
    briefing:
      "Today's data comes from Rubin Comet Catchers — you're looking at tail and coma activity, checking for real cometary outbursts against dust and instrument noise.",
    briefingExpression: "neutral",
    update1: "First comet checked. The coma calls are subtle — trust what you see.",
    update1Expression: "neutral",
    update2: "Second one filed. One more comet to review.",
    update2Expression: "neutral",
    resolution: "All comets classified. Real activity gets flagged for the follow-up queue.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
  {
    index: 6,
    title: "Variable Skies",
    briefing:
      "Today's mission is a Gaia Variables session — you're reading light curves, looking for genuine stellar variability in the brightness dips and rises.",
    briefingExpression: "neutral",
    update1: "First light curve classified. Keep an eye on the periodic ones.",
    update1Expression: "neutral",
    update2: "Second star done. One more light curve to go.",
    update2Expression: "neutral",
    resolution: "All light curves logged. A little more of the variable-star catalogue is settled.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
];

// ---------------------------------------------------------------------------
// Assembled storylines
// ---------------------------------------------------------------------------

export const STORYLINES: Storyline[] = [
  {
    id: "gizmo",
    characterId: "gizmo",
    title: "Active Survey",
    chapters: GIZMO_CHAPTERS,
    postcardTitle: "Survey Complete",
    postcardMessage: "Five objects reviewed, five calls made. The catalogue is a little more accurate than it was.",
  },
];
