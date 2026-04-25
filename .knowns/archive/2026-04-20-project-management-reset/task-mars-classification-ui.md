---
id: task-mars-classification-ui
title: Build Mars Classification UI & Template Dictionary
status: open
priority: high
labels:
  - puzzle
  - mars
  - ui
createdAt: '2026-03-18T00:00:00.000Z'
---
# Build Mars Classification UI & Template Dictionary

## Description
Develop the second puzzle type: Mars Surface Classification. This involves tagging entities (craters, dunes, deposits) on real Mars imagery using a "template dictionary" for comparison.

## Acceptance Criteria
- [ ] Create `MarsGame` component that renders surface imagery from `lib/mars-images.ts`.
- [ ] Implement the "Template Dictionary": a side panel showing reference images for "Craters", "Dunes", "Deposits", etc.
- [ ] Implement image tagging: user can tap to place markers and select the feature type from the dictionary.
- [ ] Submission includes coordinates and feature types of all tagged entities.
- [ ] Ensure the UI is mobile-friendly and optimized for image clarity.

## Implementation Notes
- Use `lib/mars-images.ts` to source real planetary data.
- The "Dictionary" is a set of example images that the user uses as a reference (no auto-checking).
- The goal is to classify deposit types and surface features.
