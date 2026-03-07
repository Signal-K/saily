---
id: vnzl08
title: Story progress DB migration
status: todo
priority: high
labels:
  - database
  - narrative
  - supabase
createdAt: '2026-03-07T09:40:18.157Z'
updatedAt: '2026-03-07T09:40:18.157Z'
timeSpent: 0
---
# Story progress DB migration

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add user_story_progress table to track each user's chapter index per storyline. One row per (user_id, storyline_id), incremented when a chapter is completed.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Migration creates user_story_progress(user_id, storyline_id, chapter_index, last_played_at)
- [ ] #2 RLS policy: users can only read/write their own rows
- [ ] #3 API route /api/story/progress GET + POST wired up
<!-- AC:END -->

