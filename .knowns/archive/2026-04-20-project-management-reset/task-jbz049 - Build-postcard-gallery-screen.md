---
id: jbz049
title: Build postcard gallery screen
status: done
priority: medium
labels:
  - functionality
  - narrative
createdAt: '2026-04-08T10:48:55.793Z'
updatedAt: '2026-04-08T11:03:35.279Z'
timeSpent: 0
---
# Build postcard gallery screen

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The postcard system is already implemented — postcards are awarded on arc completion and stored with a referral code. There is no screen to view collected postcards. Build /postcards page (or surface it on the profile page) that lists all earned postcards for the logged-in user. Data: query user_story_progress or a postcards table for completed arcs. Each postcard shows: character name, arc title, postcardTitle, postcardMessage, referral code (copyable). The MissionComplete component (web/src/components/mission/mission-complete.tsx) shows the postcard design — reuse that visual style. No new design needed: match the existing postcard card style from mission-complete.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Logged-in user can view all their earned postcards at /postcards or profile
- [x] #2 Each postcard shows character, arc title, message, and referral code
- [x] #3 Referral code is copyable (copy button)
- [x] #4 Empty state shown when no postcards earned yet
- [x] #5 Page is accessible to unauthenticated users with a sign-in prompt
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created web/src/app/postcards/page.tsx — server component, reads profiles.completed_storylines, maps to STORYLINES to get postcard content. Shows all earned postcards with title, message, referral code. Redirects to sign-in if unauthenticated. Empty state with CTA if no postcards yet.
<!-- SECTION:NOTES:END -->

