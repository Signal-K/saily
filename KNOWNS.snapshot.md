# Saily Knowns Snapshot

> Generated from the parent Navigation `.knowns` project. This file is read-only context for agents that can only see this repository.

Generated: 2026-07-12T11:37:01.503Z

## Canonical Source

- Live Knowns root: `../.knowns`
- Live Knowns repo: `..`
- Bridge config: `.knowns-bridge.json`
- Writable outbox: `.knowns-outbox/`
- Refresh from the parent repo with `make knowns-sync`.

Do not edit this snapshot to update tasks or docs. When the parent repo is accessible, use the canonical Knowns tools against `../.knowns`.

If the parent repo is not accessible, write proposed task/doc/context updates into `.knowns-outbox/` and mention them in your final response. Parent-capable agents collect them with `make knowns-outbox-collect` and apply accepted updates to canonical Knowns.

## PM Vault Worklog

For Star Sailors project work, update the relevant ticket in the parent repo PM vault before your final response.

When the parent repo is accessible, use `python3 ../scripts/pm.py update <ticket-id> --status <status> --comment "<evidence>"` from a child repo, or `python3 scripts/pm.py update <ticket-id> --status <status> --comment "<evidence>"` from the parent repo.

The comment should state what changed, what validation ran, and any remaining risk. Ticket IDs are local PM-vault IDs such as `LN-001`, `SA-001`, `BE-001`, or `CL-001`.

If the parent repo is not accessible, write the proposed worklog record into `.knowns-outbox/` and mention it in your final response so a parent-capable agent can collect it.

## Active Or Recent Tasks

- @task-j4h6kd Deploy Saily to Vercel production from main [in-review priority=high labels=project-saily,sprint-saily-0620,devops,github-actions,vercel]
- @task-gm9ltt Replace broken Zooniverse fallback images with real NASA imagery [todo priority=high labels=project-saily,data-quality]
- @task-59xf9p Epic: Build Rubin Comet Catchers and Gaia Variables game UI [todo priority=high labels=project-saily,epic]
- @task-va2onv Implement hint penalty scoring in game complete API [todo priority=medium labels=project-saily,scoring]
- @task-yzipvv Rename insight-mission-flow.cy.ts to reflect it tests asteroid game [todo priority=low labels=project-saily,testing,cleanup]
- @task-cb38ly Fix completed_storylines stale ID risk with migration path [todo priority=medium labels=project-saily,database]
- @task-8mfwer Remove check-supabase dependency from make up target [todo priority=medium labels=project-saily,devops,docker]
- @task-klulyj Add iteration guard to username collision loop in handle_new_user trigger [todo priority=medium labels=project-saily,database,bug]
- @task-i73ji5 Wire AsteroidGamePage to read from active_asteroids_daily cache table [todo priority=medium labels=project-saily,asteroid,data-pipeline]
- @task-on7c95 Fix mission.test.ts to use real storyline ID gizmo instead of juniper [todo priority=medium labels=project-saily,testing,bug]
- @task-nfnuoy Clean up: remove dead word puzzle code and GAME_ORDER_DATE_OVERRIDES stale entry [todo priority=medium labels=project-saily,cleanup]
- @task-ie7g9l Automate science feed daily ingestion [todo priority=high labels=project-saily,infrastructure,data-pipeline]
- @task-64ark5 Add env.example and env.docker.example with secret rotation docs [todo priority=high labels=project-saily,documentation,devops]
- @task-y4f33o Migrate Mars game from live NASA API to mars_images_pool cache table [todo priority=high labels=project-saily,mars,api]
- @task-grzhn7 Decide: multi-puzzle mission flow intent (3 games vs 1) [todo priority=high labels=project-saily,decision-needed]
- @task-eh9uxq Rewrite characters-storylines spec to document Gizmo + 5-chapter arc [todo priority=high labels=project-saily,documentation]
- @task-phknhb Fix validate-narrative.mjs to use current Chapter field names [todo priority=high labels=project-saily,validation,bug]
- @task-pw3qp2 Fix repair_streak RPC CHECK constraint violation [todo priority=high labels=project-saily,database,bug]
- @task-q5knxc Define logged-in reader perks requirements [todo priority=low labels=project-saily]
- @task-za7hd0 Implement Saily forum/thread gate seed relationship [todo priority=medium labels=project-saily,seeds,implementation]
- @task-uq74a2 Add comment moderation tooling (rate-limiting, report/flag, admin view) [backlog priority=medium labels=project-saily]
- @task-mesf9z Write Saily minigame baseline verification report [in-review priority=medium labels=project-saily,validation,report]
- @task-4qujpr Run existing test suites and triage failures across all projects [in-review priority=high labels=project-saily,project-landnam,project-client,project-compass]
- @task-reb08f Add landing_interest PocketBase table and persist emails/suggestions server-side [todo priority=high labels=project-saily,from-sprint,sprint-saily-0620]
- @task-57d0r9 Unify landing page success messaging and add rate limiting to /api/landing-interest [todo priority=medium labels=project-saily,from-sprint,sprint-saily-0620]
- @task-e170kp Render ReaderBriefingSection on Saily landing page [todo priority=high labels=project-saily,from-sprint,sprint-saily-0620]
- @task-wf20kh Verify Resend emails are going through from landing waitlist [todo priority=high labels=project-saily,sprint-saily-0620]
- @task-zpi9v3 Verify landing page surveys are sending to PostHog [todo priority=high labels=project-saily,sprint-saily-0620]
- @task-rvdldc Get Saily CMS editor working [todo priority=high labels=project-saily,sprint-saily-0620]
- @task-obxzd8 Implement Saily v0 launch seed data files [todo priority=high labels=project-saily,seeds,implementation]
- @task-kuogff Implement Saily seed validation script [todo priority=high labels=project-saily,seeds,implementation]
- @task-lwsofh Decision: Streak bonus direction for Saily scoring [todo priority=medium labels=project-saily,seeds,decision-needed,daily-puzzles]
- @task-clgvul Decision: Mars onboarding flow for Saily [todo priority=high labels=project-saily,seeds,decision-needed,daily-puzzles]
- @task-w143ls Epic: Saily minigame confidence milestone [in-review priority=high labels=project-saily,epic,minigames,e2e,docker]

## Recently Completed Tasks

- @task-hv82ie Preserve Minimal Daily Transit landing cleanliness while fixing dark-mode polish [done priority=low labels=project-saily,daily-transit,landing,design,minimal]
- @task-zwote6 Refine Solar Daily Transit landing dark-mode concept copy [done priority=medium labels=project-saily,daily-transit,landing,design,solar]
- @task-rihhaa Make Terminal Daily Transit landing navigation feel less chat-like [done priority=medium labels=project-saily,daily-transit,landing,design,terminal]
- @task-hlw71m Improve Cosmic Daily Transit landing first-screen content and theme toggle [done priority=medium labels=project-saily,daily-transit,landing,design,cosmic]
- @task-p77vb9 Fix Daily Transit landing dark-mode readability across variants [done priority=high labels=project-saily,daily-transit,landing,design,dark-mode]
- @task-ftpocd Draft Saily launch seed bible v0 [done priority=high labels=project-saily,seeds,daily-puzzles,citizen-science]
- @task-aylmp2 Run Saily stack in Docker [done priority=high labels=project-saily,docker,devops,sprint-1]
- @task-c9ozq3 Epic: Saily route and demo-content audit [done priority=medium labels=project-saily,epic,audit,routes]
- @task-u2ohds Inventory Saily routes and placeholder content [done priority=medium labels=project-saily,audit,routes]
- @task-izsqqu TEST - delete me [done priority=low labels=bug,project-saily]
- @task-ag7lxq TEST2 - delete me [done priority=low labels=bug,project-saily]
- @task-o93mrk Operationalize Initial Gameplay Seed Content Overview [done priority=medium labels=project-landnam,project-saily,scribe-fallback]
- @task-f22s6s Create shared astronomy seed data plan [done priority=high labels=project-client,project-landnam,project-saily,backend,astronomy,seeds]
- @task-swtod6 Decision: choose shared astronomy seed source strategy [done priority=high labels=project-client,project-landnam,project-saily,seeds,decision-needed]
- @task-c4gpdi Decision: choose Saily pre-seeded launch calendar horizon [done priority=high labels=project-saily,seeds,daily-puzzles,decision-needed]
- @task-sphshq Implement Saily Daily Transit landing waitlist [done priority=high labels=project-saily,landing,pocketbase]
- @task-8tsjsx Integrate and verify Saily minigames [done priority=high labels=project-saily,minigames,integration]
- @task-fish6h Add Make targets for Saily verification [done priority=high labels=project-saily,make,automation]
- @task-7ggezu Create Cypress E2E workflow for Saily minigames [done priority=high labels=project-saily,cypress,e2e,minigames]
- @task-ttp16f Set up repeatable Saily local environment [done priority=high labels=project-saily,setup,environment]

## Project Docs

- No project docs found.
