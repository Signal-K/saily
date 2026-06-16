# Saily Launch Seed Bible v0

**Status:** draft  
**Owner:** @me (Liam decisions resolved 2026-06-14)  
**Scope:** 7-day pre-seeded launch horizon. Planet Hunt + Mars only.

---

## 1. Decisions in Effect

| Decision | Value |
|----------|-------|
| Pre-seed horizon | 7 days (Days 1–7 from launch) |
| Games per day | Both Planet Hunt AND Mars every day |
| Mars framing | Rover-photo classification; onboarding frames user as building + launching their own rover |
| Rover upgrades | Routine upgrades available post-onboarding via economy hooks |
| Tutorial entries | Demo payloads only (not recorded walkthroughs) |
| Scoring | Equal weight across Planet Hunt and Mars categories |
| Confidence scoring | Deferred — not in v0 |
| Forum/thread relationship | Hidden until mission completion |

---

## 2. Database Shape

### 2.1 `daily_editions`

One row per calendar day. Controls which puzzles are accessible and the Melbourne-time reset window.

```json
{
  "date": "YYYY-MM-DD",
  "edition_label": "Day 1",
  "is_tutorial": false,
  "planet_puzzle_ids": ["planet_001", "planet_002", "planet_003"],
  "mars_puzzle_ids": ["mars_001", "mars_002", "mars_003"],
  "melbourne_reset_hour_utc": 14
}
```

**Rules:**
- `date` is the Melbourne calendar date (AEST/AEDT).
- `melbourne_reset_hour_utc`: 14 = midnight AEST (UTC+10). Adjust to 13 during AEDT (UTC+11).
- Both `planet_puzzle_ids` and `mars_puzzle_ids` must be non-empty for every day.
- Tutorial day (if flagged) uses demo payloads only and does not affect streak.

---

### 2.2 `daily_puzzles` — Planet Hunt

One row per puzzle. Payload is a lightcurve dataset with TOI/TIC metadata.

```json
{
  "id": "planet_001",
  "type": "planet_hunt",
  "difficulty": "easy",
  "tic_id": "TIC-123456789",
  "toi_id": "TOI-700",
  "label": "TOI-700d candidate",
  "source_name": "TESS SPOC",
  "source_url": "https://exofop.ipac.caltech.edu/tess/target.php?id=123456789",
  "source_mission": "TESS",
  "source_sector": 1,
  "is_synthetic": false,
  "lightcurve": [
    { "t": 0.0, "flux": 1.0 },
    { "t": 0.1, "flux": 0.998 }
  ],
  "expected_annotation": {
    "tag": "Transit dip",
    "x_start": 0.3,
    "x_end": 0.45
  },
  "hint_flags": {
    "phase_fold": false,
    "bin": false
  },
  "is_tutorial_demo": false
}
```

**Lightcurve format:** array of `{ t: number, flux: number }` normalized flux values. `t` is time in days from the start of the observation window.

**Tags (from `TAGS` constant):**
- `"Transit dip"` — primary classification for planetary candidates
- `"Periodic pattern"` — secondary/eclipsing binary
- `"Noise/uncertain"` — ambiguous signal
- `"Other"` — catch-all

---

### 2.3 `daily_puzzles` — Mars Classification

One row per puzzle. Payload is a rover image with annotation point anchors.

```json
{
  "id": "mars_001",
  "type": "mars_classification",
  "difficulty": "easy",
  "image_id": "PIA23240",
  "image_url": "https://images-assets.nasa.gov/image/PIA23240/PIA23240~large.jpg",
  "image_credit": "NASA/JPL-Caltech",
  "expected_categories": ["crater", "rock-outcrop"],
  "is_tutorial_demo": false,
  "rover_mission": "Curiosity"
}
```

**Category dictionary** (from `MARS_TEMPLATE_DICTIONARY`):

| id | label | description |
|----|-------|-------------|
| `crater` | Crater | Circular depressions caused by impacts |
| `dunes` | Dunes | Rippled/wave-like wind-blown sand patterns |
| `rock-outcrop` | Rock Outcrop | Exposed bedrock or large rock clusters |
| `sand-dust` | Sand & Dust | Fine-grained surface material, often smooth |
| `deposit` | Deposit | Layered material differing from surrounding terrain |

---

## 3. 7-Day Launch Calendar Seed

### Tutorial Day (Day 0 / pre-launch onboarding)

Flagged as `is_tutorial: true` in `daily_editions`. Does not count toward streak.

- **Planet Hunt demo:** 1 synthetic lightcurve showing a clear transit dip. Difficulty: easy. `is_tutorial_demo: true`. `is_synthetic: true`.
- **Mars demo:** 1 image with a clearly visible crater. Difficulty: easy. `is_tutorial_demo: true`.

### Launch Days 1–7

Each day includes 3 Planet Hunt puzzles + 3 Mars puzzles.

| Day | Planet Hunt difficulty spread | Mars difficulty spread | Notes |
|-----|-------------------------------|------------------------|-------|
| 1 | Easy × 3 | Easy × 3 | First real day; gentle entry |
| 2 | Easy × 2, Medium × 1 | Easy × 2, Medium × 1 | Gentle ramp |
| 3 | Easy × 1, Medium × 2 | Easy × 1, Medium × 2 | |
| 4 | Medium × 3 | Medium × 3 | Mid-week plateau |
| 5 | Medium × 2, Hard × 1 | Medium × 2, Hard × 1 | Difficulty ramp begins |
| 6 | Medium × 1, Hard × 2 | Medium × 1, Hard × 2 | |
| 7 | Hard × 3 | Hard × 3 | Challenge day |

**Puzzle ID convention:** `planet_D<day>_<index>` and `mars_D<day>_<index>` (e.g. `planet_D1_1`, `mars_D3_2`).

---

## 4. Scoring & Economy Config

```json
{
  "xp_per_puzzle": 100,
  "xp_multiplier_streak_bonus": 1.5,
  "data_chips_per_mission_complete": 1,
  "streak_bonus_threshold_days": 3,
  "confidence_scoring_enabled": false
}
```

**Notes:**
- Planet Hunt and Mars are equal weight (100 XP each at base).
- Streak bonus (×1.5) activates at 3+ consecutive days.
- Confidence scoring field is present in schema but `false` for v0 — implementation deferred.
- No per-category or per-difficulty XP modifier in v0 (equal scoring decision).

---

## 5. Mars Rover Onboarding Flow

The Mars mission is introduced during platform onboarding as a mission-specific briefing, not general platform onboarding. The framing:

1. **Build phase** — User selects rover components (symbolic; no gameplay decision required in v0).
2. **Launch phase** — Animated launch sequence. One-time per user.
3. **Active survey** — After launch, each Mars session is framed as "your rover is on the surface."
4. **Upgrade hooks** — After completing N Mars missions (suggested: every 10), user is offered a rover upgrade. Upgrade is cosmetic/narrative in v0; affects rover avatar and briefing copy.

**Onboarding entry in `daily_puzzles`:** The tutorial day Mars puzzle doubles as the onboarding trigger. When `is_tutorial_demo: true`, the client shows the rover build/launch flow before presenting the image.

---

## 6. Forum/Thread Gating

The community thread for each `daily_edition` is:
- **Hidden** during active puzzle session
- **Revealed** on mission completion (all puzzles in both games submitted)
- Thread ID linked in `daily_editions.forum_thread_id` (nullable; null = no thread)

This gate is enforced client-side in v0. Server-side enforcement deferred.

---

## 7. Remaining Gaps (pre-implementation checklist)

- [ ] Real TOI/TIC lightcurve data for Days 1–7 needs sourcing from TESS/ExoFOP
- [ ] NASA image IDs for Mars puzzles Days 1–7 need curation and rights confirmation
- [ ] Rover build/launch animation assets not yet created
- [ ] Forum thread creation automation not yet wired
- [ ] PocketBase migration for `daily_editions` and `daily_puzzles` tables not yet written
- [ ] Importer script (JSON → PocketBase) not yet written

---

## 8. Out of Scope for v0

- Coral game (deferred to July–August)
- Landnam integration
- Article/CMS content
- Confidence scoring
- Server-side forum gating
- Rover upgrade gameplay mechanics beyond cosmetic
