---
title: User Flow and Citizen Science Mechanics
createdAt: '2026-02-22T05:05:13.567Z'
updatedAt: '2026-02-22T05:07:01.604Z'
description: >-
  Specification for the Planet Hunters citizen science platform - user flow,
  game mechanics, submission workflow, and community features
tags:
  - spec
  - citizen-science
  - game-mechanics
  - user-flow
---

# Saily System Specification

## Overview

Saily is a grounded, daily puzzle application where players participate in real astronomical discovery. Players analyze light curve data from the TESS (Transiting Exoplanet Survey Satellite) telescope and Mars surface imagery to identify potential scientific candidates (anomalies).

The platform gamifies citizen science through:
- **Daily Mission** - One fresh puzzle per day (seeded by date).
- **Daily Refresh** - Missions reset at **Melbourne/AEST Midnight (UTC+10/11)**.
- **Bulk Verification** - There is NO "Correct Answer" logic in-game. User classifications are submitted in bulk to scientific bodies for consensus-based discovery.
- **Progression** - Streaks, XP, and a "Data Chip" economy for repairing streaks and unlocking archives.

## Requirements

### Functional Requirements

#### FR-1: Daily Mission Gameplay
- Players receive one "Mission" per day, common to all players (Global Storyline).
- Each mission consists of one or more puzzle types (Planet Hunter or Mars Classification).
- Reset time is strictly Melbourne/AEST Midnight.

#### FR-2: Planet Hunter (Lightcurve) Engine
- Players mark transits (dips) on a TESS lightcurve.
- Tools: Phase-Fold, Binning.
- **Hint Penalty:** Using Phase-Fold or Binning reduces the total XP/Score awarded for the submission.

#### FR-3: Mars Classification Engine
- Players identify surface features (craters, dunes, deposits) on real Mars imagery.
- **Template Dictionary:** A set of reference images is provided for comparison (no automated verification).
- Players tag entities and categorize them based on the dictionary.

#### FR-4: Narrative Layer
- Lightweight briefings (a few lines) from characters (DiceBear avatars).
- Characters react to puzzle results with narrative beats.
- **Reacting Avatars:** Character portraits change expressions based on story beats and puzzle outcomes.
- **Ambient Soundscapes:** Subtle audio (e.g., wind, ship hum) during briefings to set the mood.

#### FR-5: Economy & Progression
- **Data Chips:** Consumables earned by finishing 5-chapter story arcs.
  - Used to **Repair Streaks** if a day is missed.
  - Used to **Unlock Archive** for playing historical puzzles (no score).
- **Postcards:** Referral codes awarded for story completion.
- **Streaks:** Daily play tracking.
- **Leaderboards:** Global rankings based on score/XP (No-Hint discoveries are weighted higher).

#### FR-6: Verification & Data Submission
- Submissions enter a "Pending Bulk Review" status.
- Data is periodically exported to scientific partners.
- Discovery consensus is reached by aggregating user annotations (entity counts/locations).

#### FR-7: Social & Community
- **Discussion Threads:** Locked until the user has completed their daily mission.
- Discussion is strictly limited to the scientific anomaly, not the story text (to prevent spoilers).

### Non-Functional Requirements

#### NFR-1: Data Integrity
- Unique constraint on (user_id, game_date, anomaly_id) for submissions.
- UTC timestamps with local AEST/AEDT midnight mapping.

#### NFR-2: Performance (PWA)
- Progressive Web App support for offline play.
- Caching of high-resolution Mars imagery and TESS data points (typically 320 points).
- Melbourne reset logic must be handled on the client-side for consistent daily refreshes regardless of user location.

#### NFR-3: Security
- RLS policies ensure users can only see their own submissions until bulk results are published.
- Discussion thread visibility is gated by mission completion status.

## Technical Notes

### Coordinate Systems
- **Planet Hunter:** 0-1 normalized time or phase.
- **Mars:** Pixel/Image coordinates for entity tagging.

### Reward Multiplier Logic
- Base: 100 points.
- No Hints Used: 1.25x Multiplier.
- Hints Used: 0.75x Multiplier (Penalty).
- Streak Bonus: +10 XP per day of the streak.

