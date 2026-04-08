---
id: 49d38s
title: Optimize Supabase RLS and query performance
status: done
priority: medium
labels:
  - functionality
createdAt: '2026-04-08T04:36:52.749Z'
updatedAt: '2026-04-08T11:00:03.785Z'
timeSpent: 0
---
# Optimize Supabase RLS and query performance

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Review RLS policies and indexes for the anomalies, submissions (anomaly_submissions), mars_classifications, and user_story_progress tables. The migrations are in supabase/migrations/. Key query patterns: (1) daily anomaly lookup by date, (2) user submission lookup by user_id + game_date, (3) story progress by user_id + storyline_id. Add missing indexes and verify RLS policies don't do full table scans (use auth.uid() not joins where possible).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 RLS policies are performant
- [x] #2 Indexes cover all common query patterns
- [x] #3 anomalies table has index on game_date or equivalent daily lookup column
- [x] #4 anomaly_submissions has composite index on (user_id, game_date)
- [x] #5 mars_classifications has composite index on (user_id, game_date)
- [x] #6 user_story_progress has index on (user_id, storyline_id)
- [ ] #7 RLS policies use auth.uid() directly, not subqueries
- [ ] #8 Changes delivered as a new migration file
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added supabase/migrations/20260408210000_add_performance_indexes.sql: composite indexes on daily_plays(user_id,game_date), anomaly_submissions(user_id,game_date), user_story_progress(user_id,storyline_id), user_stats(total_score desc), anomalies(anomalySet). All RLS policies already use auth.uid() directly.
<!-- SECTION:NOTES:END -->

