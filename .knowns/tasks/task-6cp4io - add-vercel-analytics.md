---
id: 6cp4io
title: Add vercel analytics
status: done
priority: medium
labels:
  - analytics
  - dx
createdAt: '2026-02-19T11:00:02.000Z'
updatedAt: '2026-03-06T08:43:17.461Z'
timeSpent: 0
assignee: '@me'
---
# Add vercel analytics

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
<!-- SECTION:DESCRIPTION:BEGIN -->
<!-- SECTION:DESCRIPTION:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Inspect current app shell/layout for analytics insertion point.
2. Add Vercel Analytics provider/component in production-safe way.
3. Validate build and confirm analytics script loads in app output.
4. Add brief notes on env/verification steps.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Started: took ownership and drafted implementation plan for Vercel Analytics

Done: added @vercel/analytics in app layout and verified via npm run build

Complete: Vercel Analytics integrated in root layout; lint/build pass.
<!-- SECTION:NOTES:END -->

