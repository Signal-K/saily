---
id: task-narrative-rewards-system
title: Implement Narrative Rewards & Postcards
status: open
priority: medium
labels:
  - narrative
  - rewards
  - referrals
createdAt: '2026-03-18T00:00:00.000Z'
---
# Implement Narrative Rewards & Postcards

## Description
Develop the system for awarding "Postcards" and "Data Chips" upon the completion of a 5-chapter story arc.

## Acceptance Criteria
- [ ] Implement `awardStorylineRewards(userId, storylineId)` function to trigger at the end of Chapter 5.
- [ ] Create "Postcard" entity: a referral card containing a unique user code.
- [ ] Award 1-2 Data Chips and 1 Postcard to the user profile.
- [ ] Create "Mission Complete" UI that displays the rewards and character's resolution text.
- [ ] Implement referral link generation based on the "Postcard" referral code.

## Implementation Notes
- Rewards are only awarded the first time a user completes a storyline arc.
- Postcards should be shareable as social graphics (referral code included).
- Data Chips are automatically added to the user's balance.
