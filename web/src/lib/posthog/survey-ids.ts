// Not a real PostHog Survey object ID — a custom aggregation key stamped onto
// "survey sent" event properties so /api/project-survey/results can tally
// votes via HogQL. Keep the string value stable; changing it orphans existing
// vote counts.
export const CITIZEN_SCIENCE_VOTE_KEY = "citizen-science-projects-2026";
