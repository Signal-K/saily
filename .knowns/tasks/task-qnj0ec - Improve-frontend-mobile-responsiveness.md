---
id: qnj0ec
title: Improve frontend mobile responsiveness
status: done
priority: high
labels:
  - project-saily,sprint-2026-07-11,frontend,responsive
createdAt: '2026-07-06T09:24:45.131Z'
updatedAt: '2026-07-06T10:29:46.093Z'
timeSpent: 3896
assignee: '@me'
---
# Improve frontend mobile responsiveness

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Audit found: no site nav rendered on mobile/desktop (dead mega-menu CSS unused), landing nav fragile between 768-860px, article/gallery grids skip tablet 2-col step, calendar/search pages lack sub-360px handling, game lightcurve chart forces horizontal scroll, some tap targets under 44px.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 DailyTransitMasthead has a working responsive nav (hamburger on mobile, inline links on desktop) linking to Games/Calendar/Discuss/Search
- [x] #2 Landing masthead nav wraps/scrolls cleanly with no magic-number padding hacks between 640-900px
- [x] #3 tx-live-grid and tx-ed-stats stat row remain legible on narrow phones (<360px)
- [x] #4 Article and gallery grids have an intermediate tablet 2-column step instead of jumping 3-to-1
- [x] #5 Calendar and search page headers/grids have an added breakpoint for phones under 360px
- [x] #6 Game puzzle workspace lightcurve chart is usable on narrow viewports without relying solely on horizontal scroll
- [x] #7 Small tap targets (e.g. profile trigger) meet ~44px minimum touch target size
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented responsive pass: DailyTransitMasthead now has inline desktop nav plus mobile hamburger links for Games/Calendar/Discuss/Search; landing masthead no longer uses narrow-width padding hacks; tx-ed-stats stacks on sub-360px phones; article/gallery grids use a tablet 2-column step; calendar and search pages have under-380px handling; puzzle lightcurve SVGs no longer force a 720px minimum; profile trigger/touch target sizing raised to ~44px. Verification: npm run lint, npm run build, npm run test:unit; HTTP smoke checked /vote, /search?q=planet, invalid /api/landing-vote, and confirmed /calendar currently redirects under app guard instead of crashing.
<!-- SECTION:NOTES:END -->

