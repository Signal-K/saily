---
id: 54p88y
title: Add leaderboard page
status: done
priority: medium
labels:
  - functionality
createdAt: '2026-04-08T10:49:11.249Z'
updatedAt: '2026-04-08T11:03:34.818Z'
timeSpent: 0
---
# Add leaderboard page

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The spec calls for global leaderboards based on score/XP. The user_stats table has total_score, wins, current_streak, best_streak. Build a /leaderboard page that shows top players by total_score. Use the existing profile/home page patterns (server component, Supabase query). Show: rank, username, total_score, current_streak. Highlight the logged-in user's row. No new design needed — use existing table/panel styles. RLS: leaderboard data is public (no user-specific filtering needed). Add a Supabase index on user_stats.total_score DESC if not present.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Leaderboard page shows top 50 players by total_score
- [x] #2 Logged-in user's row is highlighted
- [x] #3 Page is accessible without login (public)
- [x] #4 user_stats has index on total_score for the query
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created web/src/app/leaderboard/page.tsx — server component, queries user_stats joined with profiles, top 50 by total_score desc. Logged-in user row highlighted. Public (no auth required). Index on user_stats(total_score desc) added in migration 20260408210000.
<!-- SECTION:NOTES:END -->

