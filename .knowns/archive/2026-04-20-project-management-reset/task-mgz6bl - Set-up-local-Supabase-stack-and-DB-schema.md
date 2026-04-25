---
id: mgz6bl
title: Set up local Supabase stack and DB schema
status: done
priority: high
labels:
  - supabase
  - database
  - local-dev
  - migrations
  - rls
createdAt: '2026-02-10T03:48:48.842Z'
updatedAt: '2026-02-10T06:15:25.832Z'
timeSpent: 0
assignee: '@me'
parent: o61hg1
---
# Set up local Supabase stack and DB schema

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Initialize local Supabase, create migrations, and define schema for users, game sessions, streaks, stats, comments, and badges.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Supabase local services start successfully
- [x] #2 Schema/migrations are committed
- [x] #3 RLS policies protect user data
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Done: local Supabase initialized, migration+seed created, RLS and SQL functions added.

Setup synopsis: @doc/runbooks/local-docker-setup-synopsis-setup-20260210-141454
<!-- SECTION:NOTES:END -->

