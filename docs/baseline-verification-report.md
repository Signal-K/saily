# Saily Minigame — Baseline Verification Report

**Date:** 2026-06-09
**Milestone:** First Saily milestone — Make/Docker/Cypress setup + minigame logic checks

---

## Verified: What Is Known to Work

### Make/Docker/Cypress Workflow

| Target | Command | Status |
|--------|---------|--------|
| Full stack | `make up` | Verifiable — starts PocketBase (port 8092) + Next.js web (port 3000) via `docker compose` |
| Dev server | `make web` | Runs `npm run dev` locally (no Docker) |
| Bootstrap | `make bootstrap` | Builds images and starts stack |
| Unit tests | `make unit` / `make test` | Runs `vitest run` in `web/` — 41 tests across 3 test suites |
| E2E (Docker) | `make test-e2e` | Runs Cypress container against Docker stack |
| E2E (local) | `make cypress-spec SPEC=...` | Starts dev server + runs single Cypress spec |
| CI | `.github/workflows/ci.yml` | `npm ci` → `vitest run` on every push/PR to `web/` |

**Docker services:** `pocketbase`, `web`, `cypress` (test profile), `tour-tester` (tour profile). Health checks and dependency ordering are configured for `web` (waits for PocketBase) and `cypress` (waits for web).

### Covered Minigames and Verified Paths

| Area | What's tested | Test count | Path |
|------|--------------|------------|------|
| Planet classification logic | `clamp01`, `normalizePeriodDays`, `mergeSegments`, `projectTimeIntervalToPhase` | 5 tests | `src/lib/game-logic.test.ts` |
| Extended planet logic | `projectPhaseIntervalToTime`, `projectAnnotationToView` (time↔phase, fold/unfold, degenerate), `toDisplayPoints` (binning, phase fold, empty input, numerical stability) | 18 tests | `src/lib/planet-logic-extended.test.ts` |
| Melbourne date/time | `normalizeDateKey`, `shiftDateKey`, `dateKeyToUtcDate`, `resolveMelbourneDateKey`, `getMelbourneDateKey`, `getMelbourneMinutesAfterMidnight`, `getMelbourneDayIndex` | 18 tests | `src/lib/melbourne-date.test.ts` |
| Smoke (Cypress) | Home page loads, page title present, `/play` route responds | 3 E2E tests | `cypress/e2e/smoke.cy.ts` |

### Game Type Definitions

Minigame types are defined in `src/lib/game/types.ts` with type discriminators for Planet, Asteroid, Mars, and InSight game variants. The `today-game-page.tsx` component orchestrates per-stage anomaly review and submission for these game types.

---

## Remaining Gaps

### Testing Gaps

1. **No dedicated minigame E2E spec** — The Makefile target `make test` references `cypress/e2e/mission-minigames.cy.ts`, but this file does not exist. No E2E test exercises the actual game UI (today-game-page, anomaly review, submission flow).
2. **No Streak Repair E2E flow** — `task-bcnv14` (E2E tests for Streak Repair) is not yet implemented.
3. **No authentication E2E test** — The Cypress smoke spec only checks public pages; the auth/signup flow is untested at the E2E level.
4. **No narrative/storyline unit tests** — `task-34zaey` (narrative integrity tests for `storylines.ts`) is not yet implemented.

### Infrastructure Gaps

5. **No Docker-based E2E in CI** — The GitHub Actions workflow (`ci.yml`) only runs `vitest`. The `make test-e2e` path (Docker Compose + Cypress) is not wired into CI.
6. **Cypress Docker spec pattern mismatch** — `cypress.docker.config.js` is absent from Saily (unlike Landnam which has one). The Docker Compose cypress service mounts the entire `web/` dir and relies on the local `cypress.config.ts`, which references the `cypress/support/e2e.ts` support file (available in the mount). However, the `cypress/included:15.10.0` image expects specs at the container's working directory (`/e2e`), which maps to `./web`. This works for the smoke spec but has not been validated with a full game E2E spec.

### Content/Data Gaps (out of scope for this milestone)

7. **Data ingestion automation** (`task-pqre20`) — Manual CSV seeding still in use; no automated pipeline.
8. **Reward system audit** (`task-xvb4ki`) — Data Chip awarding not yet unified across game types.
9. **Database optimization** (`task-49d38s`) — PocketBase collection rules and indexes not yet reviewed.

---

## Summary

The baseline verification confirms that the Make/Docker/Cypress scaffold is operational, 41 unit tests pass for the core minigame logic (planet classification, date handling), and a Cypress smoke spec validates basic page rendering. The remaining gaps are concentrated in E2E coverage of the actual game UI, CI integration of Docker-based E2E tests, and the Streak Repair/narrative test paths — none of which block this milestone but should be addressed before the next.
