---
title: Saily v0 Launch and Rollback Checklist
createdAt: '2026-03-06T08:42:16.621Z'
updatedAt: '2026-03-06T08:42:32.331Z'
description: >-
  Launch timing, owners, rollback criteria, and first external tester script for
  v0
tags:
  - release
  - v0
  - runbook
---
# Saily v0 Launch and Rollback Checklist

## Launch timing
- Internal readiness check: 2026-03-07
- Soft external launch (first tester cohort): 2026-03-08
- Go/no-go review: 2026-03-09

## Owners
- Release owner: @me
- Product decision owner: project maintainer
- Rollback decision owner: release owner + product decision owner

## Required pre-launch checks
1. Run `scripts/release/check_v0_readiness.sh`.
2. Confirm PostHog runtime and Vercel Analytics are mounted in app layout.
3. Confirm today puzzle submit flow works for authenticated user.
4. Confirm asteroid draft save flow works for authenticated user.

## First tester script
- Script path: `scripts/release/first_external_tester_script.sh`
- Use this script for the first external batch and capture issue reports with URL, timestamp, action, and screenshot.

## Rollback criteria
- Roll back if 2 or more testers are blocked on sign-in, puzzle submit, or draft save within first 24 hours.
- Roll back if release checks fail after deployment (lint/build critical regression).
- Roll back if production errors prevent `/games/today` from loading for signed-in users.

## Rollback action
1. Disable external invite/link distribution.
2. Revert to last known stable deployment.
3. Re-run `scripts/release/check_v0_readiness.sh` on release branch before retry.
4. Re-open release task with blocker notes.
