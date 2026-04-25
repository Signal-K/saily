---
id: a8eay1
title: Build streak repair and archive unlock screens
status: done
priority: medium
labels:
  - functionality
createdAt: '2026-04-08T10:48:56.294Z'
updatedAt: '2026-04-08T11:03:41.601Z'
timeSpent: 0
---
# Build streak repair and archive unlock screens

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The streak repair logic (economy.ts, streak-repair-prompt.tsx) and archive unlock (unlockArchive in economy.ts) are implemented but there is no dedicated screen or visual flow for using Data Chips. Currently the repair prompt is a small inline component. Build a proper /chips or modal-based screen that: (1) shows current chip balance, (2) lists repairable dates (missed days within repair window), (3) shows archive dates available to unlock, (4) confirms chip spend before deducting. No new design needed — use existing panel/button/chip styles from globals.css and mission-complete. The streak-repair-prompt.tsx component is the starting point.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 User can see their current Data Chip balance
- [x] #2 User can see which missed dates are repairable
- [x] #3 User can repair a streak date (with confirmation)
- [x] #4 User can unlock an archive date (with confirmation)
- [x] #5 Chip balance updates immediately after spend
- [x] #6 Insufficient chips state is handled gracefully
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created web/src/app/chips/page.tsx — client component. Loads chip balance, finds repairable dates (missed days within 7 days where surrounding day was played), and archive dates (last 30 days not played/unlocked). Each action calls economy.ts repairStreak/unlockArchive, updates balance optimistically. Disabled when chips=0.
<!-- SECTION:NOTES:END -->

