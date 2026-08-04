// Not a real PostHog Survey object ID — a custom aggregation key stamped onto
// "survey sent" event properties so /api/project-survey/results can tally
// votes via HogQL. Keep the string value stable; changing it orphans existing
// vote counts.
export const CITIZEN_SCIENCE_VOTE_KEY = "citizen-science-projects-2026";

// Same pattern as CITIZEN_SCIENCE_VOTE_KEY above — a custom aggregation key,
// not a real PostHog Survey object ID. Stamped onto "survey sent" events from
// the /feedback asset-review cards so /api/feedback/asset-review/results can
// tally per-asset identification ratings via HogQL. Keep stable.
export const ASSET_REVIEW_VOTE_KEY = "landnam-room-tier-review-2026-08";

// Custom aggregation key for the /feedback suggestions box. Stamped onto the
// "tdt_suggestion_submitted" event so /api/feedback/suggestions/results can
// report a real submitted-suggestions count (never a fabricated one).
export const SUGGESTION_EVENT_KEY = "tdt-suggestions-desk-2026-08";
