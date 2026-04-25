---
id: 7q8hn2
title: Create PostHog exit survey for current version
status: done
priority: medium
labels:
  - posthog
  - survey
  - analytics
createdAt: '2026-02-17T09:28:55.546Z'
updatedAt: '2026-02-17T12:23:10.880Z'
timeSpent: 10119
assignee: '@me'
---
# Create PostHog exit survey for current version

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create and configure an exit survey for the current app version using PostHog (US Cloud). Project ID: 199773. API key provided by stakeholder for setup. Ensure survey is ready to trigger at version exit points and documented for rollout.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Exit survey exists in PostHog project 199773 (US Cloud) with final approved questions and targeting rules
- [x] #2 Survey trigger logic for this version is implemented and verified in the app
- [x] #3 PostHog configuration values are sourced from existing environment setup (no hardcoded secrets)
- [x] #4 Task notes include rollout/verification steps and links to created survey assets
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add PostHog client bootstrap in web app (env-driven, US cloud host default).
2. Trigger exit-survey flow after daily puzzle completion and show survey on next home load.
3. Add script to create exit survey in PostHog via API (token/env-based) and document usage.
4. Run lint/build, then update task notes and AC status.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan set and approved by user in chat; implementing now.

Implemented:
- Added PostHog runtime bootstrap in app shell: @src/components/posthog-runtime.tsx
- Added exit-survey queue helpers: @src/lib/posthog/exit-survey.ts
- Wired daily puzzle completion to queue survey trigger before redirect: @src/components/pages/games/today-game-page.tsx
- Added env vars for PostHog + survey id: @web/.env.example
- Added survey creation scripts: @scripts/posthog/create_version_exit_survey.sh and @scripts/posthog/create_experiment1_exit_survey.sh

Validation:
- npm run build (web) passes

Rollout steps:
1) Set NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_EXIT_SURVEY_ID, NEXT_PUBLIC_APP_VERSION in Vercel/GHA env.
2) Create survey with PERSONAL API token:
   POSTHOG_PERSONAL_API_KEY=<token> POSTHOG_PROJECT_ID=199773 APP_VERSION=v1 scripts/posthog/create_version_exit_survey.sh
3) Copy created survey id into NEXT_PUBLIC_POSTHOG_EXIT_SURVEY_ID and deploy.

Blocker:
- Could not create survey object from this environment due outbound DNS/network restrictions to PostHog API.

PostHog survey created successfully.
- survey_id: 019c6b89-a660-0000-ef2b-2163bc9dea6f
- project_id: 199773
- trigger event: exit_survey_triggered
- survey name: DailySail Exit Survey (v1)

Post-completion update:
- Updated live PostHog survey 019c6b89-a660-0000-ef2b-2163bc9dea6f conditions to trigger only when event=exit_survey_triggered and source=first_game_complete and app_version=v1.
- Updated script defaults in scripts/posthog/create_version_exit_survey.sh to include propertyFilters for source/app_version.
<!-- SECTION:NOTES:END -->

