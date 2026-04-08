# Saily Development Plan: April 2026

## Focus: Backend Functionality & Reliability (2-Week Sprint)

As the product owner is currently unavailable for design decisions, the next two weeks will focus exclusively on enhancing the core functionality, data integrity, and automated testing of the Saily platform.

### Week 1: Infrastructure & Game Economy
- **Data Ingestion Automation:** Move away from manual CSV seeding. Implement scripts or Edge Functions to fetch and process new scientific data (TESS/Mars) directly into Supabase.
- **Reward System Audit:** Unify reward triggers across all four game types (Planet, Asteroid, Mars, InSight) and ensure consistent Data Chip awarding.
- **Database Optimization:** Review and tune Supabase RLS policies and table indexes for the `anomalies` and `submissions` tables to ensure high performance as the dataset grows.

### Week 2: Quality Assurance & Validation
- **Narrative Integrity Tests:** Create unit tests to validate `storylines.ts` branching logic, character progression, and dialogue consistency.
- **End-to-End (E2E) Testing:** Implement Playwright/Cypress tests for critical user flows, specifically the 'Streak Repair' / Data Chip consumption path.
- **Automated Validation:** Enhance the `tour` script to automatically detect broken narrative paths during CI/CD.

## Task Status Reorganization
- **Functionality Tasks:** Elevated to HIGH/MEDIUM priority.
- **Design/Narrative Tasks:** Labeled as `design-required` or `narrative` and deprioritized to LOW until further design input is available.
- **Unit Tests:** Organized into `web/src/lib/__tests__/` to maintain a clean logic directory.

## Current High-Priority Backlog
1. **task-pqre20:** Automate scientific data ingestion for Planet & Mars
2. **task-xvb4ki:** Audit and unify reward awarding across all game types
3. **task-bcnv14:** Implement E2E tests for Streak Repair flow
4. **task-49d38s:** Optimize Supabase RLS and query performance
5. **task-34zaey:** Add unit tests for storyline narrative integrity
6. **task-miadz1:** Enhance 'tour' script for automated validation
