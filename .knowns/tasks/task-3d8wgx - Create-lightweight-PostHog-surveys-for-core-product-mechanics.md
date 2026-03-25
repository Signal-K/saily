---
id: 3d8wgx
title: Create lightweight PostHog surveys for core product mechanics
status: done
priority: high
labels:
  - analytics
  - posthog
  - surveys
  - feedback
createdAt: '2026-03-08T04:56:10.145Z'
updatedAt: '2026-03-28T04:18:00.104Z'
timeSpent: 618
assignee: '@me'
---
# Create lightweight PostHog surveys for core product mechanics

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create minimally intrusive surveys (max 2 questions each) targeting minigames/features/mechanics, with user-id-aware targeting and app-consistent UX delivery triggers.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 At least one survey exists for each major gameplay area
- [x] #2 Each survey has no more than two questions
- [x] #3 Survey triggers are scoped to relevant in-app events/properties including user id context
- [x] #4 Survey setup scripts/config are committed for repeatable creation
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented PostHog survey queue + runtime display system for mechanic_feedback_triggered events with cooldown/sampling for non-obtrusive behavior. Added user-aware tracking via posthog.identify(user.id,email) and user_id property on survey-trigger events. Created reusable survey creation script scripts/posthog/create_mechanic_surveys.sh and successfully created 5 surveys in project 199773 (US): planet_transit=019ccbd6-f1dc-0000-e6e6-caacce63cd34, planet_no_detection=019ccbd6-f751-0000-16f9-763d27b53ae1, asteroid_mapping=019ccbd6-fd2d-0000-c370-82976b2d473c, mars_classification=019ccbd7-0233-0000-be5a-20d67c00f106, narrative_flow=019ccbd7-07a0-0000-00f3-bfd70228d93f. Updated .env.local/.env.example with corresponding NEXT_PUBLIC_POSTHOG_SURVEY_* ids and PostHog key/host. Added lightweight CSS overrides for survey widget to better align with app styling.
<!-- SECTION:NOTES:END -->

