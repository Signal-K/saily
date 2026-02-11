---
id: o61hg1
title: Build NYT-style daily games app (Next.js + Supabase + PWA)
status: done
priority: high
labels:
  - nextjs
  - supabase
  - pwa
  - games
  - auth
  - streaks
  - stats
  - comments
  - badges
  - mvp
createdAt: '2026-02-10T03:48:40.819Z'
updatedAt: '2026-02-10T06:15:25.887Z'
timeSpent: 1294
assignee: '@me'
---
# Build NYT-style daily games app (Next.js + Supabase + PWA)

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create a minimal but production-structured web app with daily games, streak/stat tracking, auth, comments, badges, and local Supabase dev environment.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 App runs locally with one command sequence
- [x] #2 Users can sign in and persist profile/progress
- [x] #3 At least one daily game works end-to-end
- [x] #4 Streaks and stats update correctly
- [x] #5 Comments and badges are functional
- [x] #6 PWA install + offline shell support are enabled
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Scaffold a minimal Next.js (App Router + TypeScript) app and baseline game-shell UI.
2. Initialize local Supabase (CLI + docker), create schema/migrations for profiles, daily_games, plays, streaks, comments, badges, and set RLS.
3. Integrate Supabase Auth (magic link) and session-aware app structure.
4. Implement one NYT-style daily game (date-seeded), submission API, and streak/stat updates in DB.
5. Add comments and badge milestone logic.
6. Add PWA support (manifest, icons, service worker, offline shell caching).
7. Add seed/dev scripts and concise setup docs + run validation/tests.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Done: delivered Next.js + Supabase + PWA MVP with daily game, auth, streak/stats, comments, badges, and local Supabase setup.
Runbook: @doc/guides/daily-grid-local-setup

Setup synopsis: @doc/runbooks/local-docker-setup-synopsis-setup-20260210-141454
<!-- SECTION:NOTES:END -->

