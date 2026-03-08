---
id: kdwrmt
title: Overhaul daily mission UI for mobile-first consistency
status: done
priority: high
labels:
  - ui
  - mobile
  - pwa
  - narrative
createdAt: '2026-03-07T13:18:31.600Z'
updatedAt: '2026-03-08T00:48:54.542Z'
timeSpent: 208
assignee: '@me'
---
# Overhaul daily mission UI for mobile-first consistency

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Redesign game flow to reduce scrolling, unify UI system across briefing/minigames/results, and strengthen PWA/mobile behavior. Inspiration from Murdle/NYT/Worldle patterns with mission narrative continuity.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Mission flow uses a consistent shell/layout across briefing, all minigames, and mission complete
- [x] #2 Primary gameplay interactions fit mobile viewport without excessive vertical scrolling
- [x] #3 Visual system (colors, spacing, typography, controls) is unified across game pages
- [x] #4 PWA affordances (install/offline/status feedback) are visible and mobile friendly
- [x] #5 Existing game mechanics continue to function after redesign
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Introduce a unified Mission Game Shell (single header/progress/meta/actions structure) used by all 3 minigames and narrative beats.
2. Refactor Today/Asteroid/Mars pages to the same mobile-first two-block pattern: primary play area first, collapsible/secondary controls below, with reduced vertical stack depth.
3. Replace ad-hoc inline styles with shared design tokens/components for buttons/chips/pills/cards to keep consistent spacing, typography, and color language inspired by Murdle/NYT style clarity.
4. Improve mobile and PWA affordances: sticky mission action bar, offline/install status banner, and safe-area tuned spacing for bottom nav/PWA standalone mode.
5. Validate behavior parity (submissions, scoring, progression), run build, then update task AC and notes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Audit: current mission uses mixed layouts (today=custom puzzle shell; asteroid/mars=home-grid-two + panels), causing inconsistent hierarchy and excess mobile scroll. Works well: strong data context pills, clear submission CTAs, narrative beats. Weak points: repeated headers/metadata, deep control stacks, non-sticky primary actions, uneven visual language, minimal in-flow offline/install cues.

Implemented UI overhaul: added MissionStatusBanner (offline + install prompt), unified mission shell wrapper in mission-flow, and refactored Today/Asteroid/Mars into consistent puzzle-screen/header/workspace/sidebar structure. Reduced scroll depth with collapsible help/evidence sections and sticky mobile action bars. Updated design tokens/colors for cohesive, less-purple visual language and aligned PWA theme colors in manifest/layout. Validation: npm run build (web) passes; knowns validate passes with only pre-existing warnings on unrelated tasks lacking AC.

Local runtime fixes: migrated src/middleware.ts to src/proxy.ts to remove Next 16 deprecation warning; added next.config turbopack.root=process.cwd() to stop workspace root lockfile warning; added dev-only local URL guard in lib/supabase/middleware to skip edge auth refresh against localhost/127.0.0.1 and prevent noisy fetch-failed retries in local dev. Also resolved Supabase local port conflict by stopping project-id client and restarting this project.

Follow-up fixes from UX review: removed explicit step-order labels from game headers/beats, implemented chapter-dependent mission game sequencing via getMissionGameOrder(), removed fixed arrowed order in briefing preview, and reduced /games/today right-column scroll pressure by collapsing hints/notes + capping desktop sidebar height with internal scroll.

UX follow-up: today-game now keeps note inputs optional behind collapsed Notes section; annotation list no longer auto-opens; added no-planet banner + Confirm No Planet Here action when no annotations exist. This submits a low-confidence completion for points and ends mission flow early for the session. MissionComplete now shows an early-end resolution message.
<!-- SECTION:NOTES:END -->

