---
id: 41rpck
title: 'Improve home hub: show today''s mission status and next storyline preview'
status: done
priority: medium
labels:
  - functionality
createdAt: '2026-04-08T10:49:26.948Z'
updatedAt: '2026-04-08T11:03:23.548Z'
timeSpent: 0
---
# Improve home hub: show today's mission status and next storyline preview

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The home page (web/src/components/pages/home-page.tsx) shows the current storyline and character. Improve it to: (1) clearly show whether the user has already played today (played = show score + 'See results' CTA, not played = show 'Play now' CTA), (2) show which storyline is active tomorrow as a teaser (use getStorylineForDate with tomorrow's date), (3) show the user's chapter progress within the active storyline (e.g. 'Chapter 3 of 5'). All data is already available via existing Supabase queries on the page — this is a UI/logic improvement, no new APIs needed.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Home page shows 'Already played today' state with score when user has played
- [x] #2 Home page shows chapter progress (e.g. Chapter 2 of 5) for active storyline
- [x] #3 Home page shows tomorrow's character as a teaser
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Updated home-page.tsx: added todayPlay query (daily_plays for today) and storyProgressRes query (user_story_progress for active storyline). Shows 'Mission complete — score X' + 'See Results' CTA when played, normal CTA otherwise. Chapter progress shown in subtitle (Chapter N of M). Tomorrow's character/storyline teaser added below CTAs.
<!-- SECTION:NOTES:END -->

