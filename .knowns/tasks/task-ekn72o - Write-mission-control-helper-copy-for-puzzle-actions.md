---
id: ekn72o
title: Write mission control helper copy for puzzle actions
status: done
priority: medium
labels:
  - writing
createdAt: '2026-03-26T02:31:23.757Z'
updatedAt: '2026-03-28T04:29:05.581Z'
timeSpent: 0
---
# Write mission control helper copy for puzzle actions

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The mission control panel has helper text for each puzzle action. Write the copy — short, contextual, action-oriented. Covers asteroid, InSight, and Wordle-style puzzles.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Helper copy written for all 3 puzzle types
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Helper copy — all 3 puzzle types

**Planet Transit (Wordle-style)**
- Hint button: "Narrow the window — costs one point but gets you closer."
- Submit: "Lock in your transit call. You can't revise after this."
- No detection: "Nothing found? That's a valid result. Scientists need negatives too."
- Progress pill (1 of 5): "Candidate %n of 5 — keep scanning."

**Asteroid Survey**
- Annotation tool: "Click a cluster to mark it. Look for brightness spikes — those are ice-rich patches."
- Submit: "File your survey. Your annotations go to the science log."
- Skip: "No clear signal today? Flag it as inconclusive — that's real data."

**InSight Weather Desk**
- Sol card: "Tap a Sol to select it as your anomaly call."
- Submit: "Submit your anomaly pick. The model will compare it against the median."
- Context pill (source): "Live = fresh NASA feed. Cached = fallback data from a known-good period."
<!-- SECTION:NOTES:END -->

