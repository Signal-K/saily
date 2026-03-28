---
id: task-data-chips-implementation
title: Implement Data Chips & Streak Repair Logic
status: open
priority: high
labels:
  - economy
  - streaks
  - supabase
createdAt: '2026-03-18T00:00:00.000Z'
---
# Implement Data Chips & Streak Repair Logic

## Description
Implement the "Data Chips" consumable to allow users to repair broken streaks and access the puzzle archive.

## Acceptance Criteria
- [ ] Add `data_chips` column to `public.profiles` table.
- [ ] Implement `repairStreak(userId)` function that consumes 1 Data Chip to restore a broken streak.
- [ ] Implement `unlockArchive(userId, date)` function that consumes 1 Data Chip to unlock a historical puzzle.
- [ ] Add UI indicators for Data Chip balance in the header or profile.
- [ ] Create a "Repair Streak" prompt when a user returns after missing a day.

## Implementation Notes
- Data Chips are earned by completing 5-chapter story arcs.
- The `repairStreak` logic should check the last play date and increment the current streak if the chip is used.
