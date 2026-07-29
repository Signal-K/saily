# Close Approach Ranker Gameplay Contract

Status: Sprint 10 contract for `STS-378`.

## Goal

Close Approach Ranker is a newspaper-style Saily puzzle where players order a small set of real near-Earth close approaches. The game must teach scale and orbital risk literacy without turning the source data into fabricated trivia.

The MVP ranks real NASA/JPL SBDB Close-Approach Data records by closest nominal Earth approach. Stretch modes can rank by soonest approach or fastest relative velocity after the distance mode is reliable.

## Source Contract

Primary source: NASA/JPL SBDB Close-Approach Data API.

- Documentation: https://ssd-api.jpl.nasa.gov/doc/cad.html
- Request endpoint: `GET https://ssd-api.jpl.nasa.gov/cad.api`
- Runtime rule: gameplay reads from cached Saily data only. Ingest may call JPL; the game route must not depend on a live JPL request.
- Version rule: ingest must check `signature.version` and fail loudly if it does not match the documented format the parser expects.
- Source query baseline: Earth NEO close approaches in a bounded date window, with `diameter=true`, `fullname=true`, and a deterministic `sort` parameter.

Useful JPL fields for the game:

| Field | Use |
| --- | --- |
| `des` | Stable small-body designation. |
| `orbit_id` | Source computation identifier for traceability. |
| `cd` | Calendar close-approach time, TDB; used for soonest-approach mode and display. |
| `dist` | Nominal approach distance in au; MVP ranking key. |
| `dist_min`, `dist_max` | Uncertainty range; used in reveal copy. |
| `v_rel` | Relative velocity in km/s; stretch ranking key. |
| `h` | Absolute magnitude; optional difficulty/context clue. |
| `diameter`, `diameter_sigma` | Optional size context when requested and available. |
| `fullname` | Human-readable display name when requested. |

## MVP Round Shape

Each daily round has 4-6 records. Default target is 5 records.

Public payload:

```ts
type CloseApproachRound = {
  date: string;
  mode: "closest-distance";
  prompt: string;
  records: Array<{
    id: string;
    designation: string;
    displayName: string;
    closeApproachTime: string;
    distanceAu: number;
    distanceLd: number;
    distanceMinAu: number | null;
    distanceMaxAu: number | null;
    relativeVelocityKmS: number;
    absoluteMagnitudeH: number | null;
    diameterKm: number | null;
    sourceUrl: string;
  }>;
};
```

Private or submit-only payload:

```ts
type CloseApproachSolution = {
  date: string;
  mode: "closest-distance";
  orderedRecordIds: string[];
  sourceSignatureVersion: string;
  generatedAt: string;
};
```

The public response may show numeric distance and velocity values because the puzzle is about reading and ordering real scientific measurements. It must not include `orderedRecordIds`, rank labels, correctness flags, or a pre-sorted list unless the current state is reveal/complete.

## Ranking Modes

MVP mode: `closest-distance`.

- Player task: order cards from closest Earth approach to farthest.
- Sort key: ascending `dist`.
- Tie break: ascending `dist_min`, then ascending `cd`, then lexical `des`.
- Prompt: "Rank these close approaches from closest to farthest."

Stretch mode: `soonest-approach`.

- Player task: order cards by earliest close-approach time.
- Sort key: ascending `cd`.
- Tie break: ascending `dist`, then lexical `des`.
- Prompt: "Put these visitors in the order Earth meets them."

Stretch mode: `fastest-relative-velocity`.

- Player task: order cards from fastest relative velocity to slowest.
- Sort key: descending `v_rel`.
- Tie break: ascending `dist`, then lexical `des`.
- Prompt: "Rank these flybys from fastest to slowest."

Only `closest-distance` is required for Sprint 10 implementation.

## Scoring

Score is position-based and capped at 100.

For a round of `n` records:

1. Compare each submitted position against the solved position.
2. Award `1` point for an exact position.
3. Award `0.5` points if the record is one slot away from its solved position.
4. Award `0` points otherwise.
5. `score = round((points / n) * 100)`.

Examples:

- Perfect 5-card order: `100`.
- One adjacent swap in a 5-card round: `80` (`3` exact + `2 * 0.5` near = `4 / 5`).
- Fully reversed 5-card order: usually `20` if the middle card remains exact.

The mission-flow score consumes this game score as a 0-100 value like crossword and transit spotter. It must never sum multiple 0-100 game scores into a value above 100.

## Answer Reveal

Before submit:

- Cards show designation/name, approach time, nominal distance, velocity, and optional size context.
- No card shows its correct rank.
- The action label is "Lock ranking".

After submit:

- Show the player's order and the correct order side by side, or annotate each card with "Correct", "Near", or "Moved".
- Show exact rank numbers only after submission.
- Highlight the closest object with a concise explanation:
  "Closest approach: {displayName} at {distanceLd} lunar distances on {date}."
- Include source metadata:
  "Source: NASA/JPL SBDB Close-Approach Data API. Distances are nominal approach distances; uncertainty range is shown where available."

Players can finish the mission after reveal even with a low score. This is a literacy puzzle, not a blocker.

## Educational Copy

Short intro:

> Tiny changes in astronomical distance still span thousands of kilometers. Sort the flybys by their closest approach and learn which measurements matter.

Distance helper:

> `au` means astronomical unit: the average Earth-Sun distance. `LD` means lunar distance: the average Earth-Moon distance.

Uncertainty helper:

> Close-approach predictions include uncertainty. The nominal distance is the center estimate; minimum and maximum show the range.

Velocity helper:

> Relative velocity is how fast the object passes the approach body. It is not a collision prediction.

Risk copy:

> Close does not mean dangerous. This puzzle compares measured flyby geometry; it does not predict impact risk.

## Fallback Behavior

No cached round for requested date:

- Return a stable empty state, not a spinner.
- UI copy: "No close-approach desk is cached for this date yet."
- Primary action: "Play today's mission".
- Secondary action: "Back to games".

Too few source records:

- Ingest should not publish a round with fewer than 4 records.
- API returns `available: false`, `reason: "insufficient-source-records"`.
- UI uses the same empty state as a missing cache.

Source parser/version mismatch:

- Ingest fails and logs the JPL signature version and expected version.
- Existing cached rounds remain playable.
- Gameplay never calls JPL as a fallback.

Malformed cached record:

- API excludes invalid records.
- If fewer than 4 valid records remain, return the insufficient-records empty state.

Unsupported mode:

- API returns `400` with allowed modes.
- UI should not expose unsupported modes.

## Implementation Handoff

`STS-379` ingest/cache:

- Fetch bounded Earth close-approach windows from JPL.
- Normalize numeric fields into explicit numbers.
- Compute `distanceLd` from `distanceAu` using a fixed documented conversion.
- Store source signature/version, raw field names, ingest timestamp, source URL, and selected mode.

`STS-380` schema/API:

- Store public records and private solution order separately or ensure the public route strips solution fields.
- Add `/api/close-approaches/daily?date=YYYY-MM-DD`.
- Support stable empty responses for missing/insufficient cache.

`STS-381` UI/scoring:

- Use keyboard-accessible move up/down controls as the baseline interaction.
- Drag-and-drop is optional and must not be the only way to reorder.
- Score using the contract above.

`STS-382` mission integration:

- Add the game behind an explicit mission registry decision.
- Use `firstGame=close-approach` or equivalent e2e selection only after the route is playable.
- Do not replace the current reliable mission path until cached source data and Cypress coverage are green.
