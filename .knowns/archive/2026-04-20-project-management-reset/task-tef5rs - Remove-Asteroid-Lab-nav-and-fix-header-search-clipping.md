---
id: tef5rs
title: Remove Asteroid Lab nav and fix header search clipping
status: done
priority: high
labels:
  - ui
  - nav
  - header
createdAt: '2026-03-08T00:50:13.981Z'
updatedAt: '2026-03-08T00:51:28.437Z'
timeSpent: 0
assignee: '@me'
---
# Remove Asteroid Lab nav and fix header search clipping

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Remove Asteroid Lab from primary navigation and adjust header/search layout so the search input is larger and not visually clipped on common desktop widths.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Asteroid Lab link is removed from header navigation
- [x] #2 Header search input is wider and no longer clipped
- [x] #3 Layout remains usable on desktop and mobile
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Removed Asteroid Lab link from desktop header nav. Increased header search prominence and reduced clipping risk by widening middle grid column, giving search wrapper explicit max width/justify stretch, increasing input height, and adjusting <=900px header grid widths.
<!-- SECTION:NOTES:END -->

