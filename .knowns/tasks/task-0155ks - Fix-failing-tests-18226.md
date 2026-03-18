---
id: 0155ks
title: Fix failing tests (18/2/26)
status: in-progress
priority: medium
labels:
  - tests
createdAt: '2026-02-18T22:23:19.000Z'
updatedAt: '2026-03-21T03:22:50.837Z'
timeSpent: 0
assignee: '@me'
---
# Fix failing tests (18/2/26)

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
<!-- SECTION:DESCRIPTION:BEGIN -->
<!-- SECTION:DESCRIPTION:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Reproduce the current Cypress failure path on the existing worktree and confirm whether it is a selector/assertion issue or an app/runtime regression.
2. Fix the underlying regression with the smallest safe change, prioritizing the browser Supabase URL path used by containerized Cypress.
3. Re-run targeted Cypress specs plus lint/build sanity checks.
4. Append task notes, validate refs, stop time, and close the task if verification is clean.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Root cause: Cypress specs asserted old home hero copy after responsive/text updates. Fix: updated smoke + game-flow heading assertions to current copy variants. Verified npm run lint + npm run build locally; Cypress binary failed to start in this env (SIGABRT), so CI run is required for E2E confirmation.

Reopened: investigating current Cypress failures on 2026-03-21

Root cause: Dockerized browser auth/sign-out paths were using the wrong Supabase/browser navigation strategy. Fix: aligned docker-compose NEXT_PUBLIC_SUPABASE_URL default with host.docker.internal, made browser URL rewriting conditional on actual browser host, and switched profile menu sign-out to client-side Supabase sign-out + redirect. Verified: docker compose cypress run authenticated-real-flow.cy.ts, smoke.cy.ts, header-navigation-search.cy.ts; npm run build. Note: npm run lint still fails on unrelated pre-existing issues outside this fix.
<!-- SECTION:NOTES:END -->

