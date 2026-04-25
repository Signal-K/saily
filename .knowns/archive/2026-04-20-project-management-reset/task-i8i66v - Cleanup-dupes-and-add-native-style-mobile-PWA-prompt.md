---
id: i8i66v
title: Cleanup dupes and add native-style mobile PWA prompt
status: done
priority: high
labels:
  - cleanup
  - mobile
  - pwa
createdAt: '2026-03-08T00:56:09.448Z'
updatedAt: '2026-03-08T00:56:35.708Z'
timeSpent: 0
assignee: '@me'
---
# Cleanup dupes and add native-style mobile PWA prompt

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Clean up duplicated Supabase config logic, simplify mission status banner behavior, and add mobile-first install prompt UX with rejection persisted in local storage.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Supabase config duplication is reduced via shared helper module
- [x] #2 Mobile PWA install prompt appears on supported browsers and stores rejection in local storage
- [x] #3 Mobile UI receives native-style spacing/safe-area improvements without breaking desktop
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Cleanup: extracted shared Supabase config helpers (cookie name, URL/key resolution, localhost detection) and refactored server/client/middleware to use them. Simplified MissionStatusBanner to offline-only. Added global mobile PWA install prompt component with beforeinstallprompt handling; if user dismisses/rejects, localStorage key cosmo_pwa_install_rejected=1 suppresses future prompts in that browser. Added mobile native-feel polish in globals.css: safer spacing, larger panel radii, overscroll/tap-highlight tuning, and bottom-sheet style install prompt above tab bar with safe-area handling. Validation: npm run lint (1 pre-existing warning only), npm run build passes.
<!-- SECTION:NOTES:END -->

