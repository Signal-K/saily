---
id: mdt9ls
title: Fix local CI Supabase env quoting and cleanup resilience
status: done
priority: high
labels:
  - ci
  - e2e
  - supabase
createdAt: '2026-03-08T02:38:14.959Z'
updatedAt: '2026-03-08T04:57:36.739Z'
timeSpent: 48
assignee: '@me'
---
# Fix local CI Supabase env quoting and cleanup resilience

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ensure frontend-cypress workflow works with local Supabase only: strip quoted env values, avoid secret dependency assumptions, and make e2e cleanup tolerant when test user was not created.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 e2e user create handles quoted/local URL values
- [x] #2 workflow exports local Supabase vars without invalid quotes
- [x] #3 cleanup step does not fail pipeline when TEST_USER_ID is absent
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Fixed CI local Supabase env quoting issue by stripping surrounding quotes in workflow export step (API_URL/ANON_KEY/SERVICE_ROLE_KEY). Hardened e2e create/cleanup scripts with env sanitization and SUPABASE_SERVICE_ROLE_KEY fallback. Added default local URL fallback (127.0.0.1:54321). Cleanup now exits successfully when TEST_USER_ID is absent, preventing false-fail after create step errors.

Follow-up patch: strip surrounding quotes in workflow export values to prevent Invalid URL in e2e create script. Added env sanitization + local defaults in create/cleanup scripts; cleanup now skips cleanly when TEST_USER_ID is absent.
<!-- SECTION:NOTES:END -->

