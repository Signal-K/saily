# Sprint 11 Minigame Ranking Synthesis

Status: Sprint 10 handoff for `STS-386`  
Date: 2026-07-19  

## Signal Read

Current PostHog survey signal is not available in this local environment:

- `POSTHOG_PROJECT_ID` is not set.
- `POSTHOG_PERSONAL_API_KEY` is not set.
- `/api/project-survey/results` is already coded to return `{ votes: {} }` when those credentials are absent.

Craft search did not return matching vision notes for:

- `Saily minigame puzzle vision Sprint 11`
- `Daily Transit minigames Connections Space Weather Catalog Cipher`

So this ranking is a feasibility-weighted Sprint 11 recommendation, not a live-vote leaderboard. When PostHog credentials or exported vote counts are available, replace the `Survey signal` column with measured votes and re-sort only if signal is strong enough to overcome implementation risk.

## Ranked Candidates

| Rank | Candidate | Survey signal | Feasibility | Recommendation |
| --- | --- | --- | --- | --- |
| 1 | Connections-style science groups | unavailable | high | Build first. It fits the newspaper-game direction, can be generated from article tags/events, needs no heavy graphics, and works well inside articles. |
| 2 | APOD caption/fact puzzle | unavailable | high | Strong fallback candidate. NASA APOD is recognizable, daily, and friendly to article framing. Keep it simple: match fact to image/caption, not free-form trivia. |
| 3 | Space Weather Decoder | unavailable | medium | Good science value and daily freshness, but source interpretation needs careful copy. Use NOAA/SWPC fields only after a small source contract is written. |
| 4 | Cloudspotting on Mars | unavailable | medium | Good citizen-science fit and already in Saily planning, but image-subject caching and display QA are heavier than text/card puzzles. |
| 5 | Asteroid Activity Spotter | unavailable | medium | Similar value to Cloudspotting, but the interaction is more classification-like and may overlap with existing transit spotting unless the visual task is distinct. |
| 6 | Variable Star Pattern Match | unavailable | medium-low | Strong astronomy fit, but pattern generation/scoring is more delicate. Defer until the simpler card/text puzzles prove retention. |
| 7 | Catalog Cipher | unavailable | low-medium | Potentially fun, but the mechanic is least validated and can become opaque quickly. Keep as a prototype spike, not the next release-floor game. |

## Sprint 11 Recommendation

Build **Connections-style science groups** as the next production candidate.

Why:

- It reuses the Sprint 10 article loop: articles can seed terms, categories, and source links.
- It is cheap to validate with unit tests and Cypress because the interaction is deterministic.
- It can run from local content even when external feeds are unavailable.
- It gives The Daily Transit a more newspaper-like game alongside crossword and ranker.

Keep **APOD caption/fact puzzle** as the backup if the group-generation data model gets messy.

## Suggested Acceptance Criteria for Sprint 11

- A daily puzzle contains 12-16 terms grouped into 3-4 source-backed science categories.
- The public payload exposes terms and category count, not solved groups.
- The submit route scores completed groups server-side.
- At least one article embeds `{{puzzle}}` and references the game.
- Cypress covers standalone play and optional mission-flow selection.

## Follow-up Data Work

- Export PostHog vote counts for `citizen-science-projects-2026`.
- Add the export summary to this doc before Sprint 11 planning closes.
- If one candidate has at least 2x the next candidate's votes, let that measured signal override this feasibility ranking unless implementation risk is high.
