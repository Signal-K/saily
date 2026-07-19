# Saily / The Daily Transit — Agent Instructions

## What this project is

Saily ("The Daily Transit") is a Wordle-style daily citizen-science app: players help characters in short multi-chapter stories classify real astronomical/planetary data (TESS transits, Mars surface imagery, and whichever mission games are currently live — check `web/src/lib/mission.ts`'s `MISSION_GAMES` for the current live roster, it changes). One mission per day, resetting at Melbourne/AEST midnight. No procedurally generated puzzle data — every puzzle is real data or nothing.

TDT is the entry point into the wider Star Sailors ecosystem — treat it as the on-ramp product, not a standalone toy.

## Repo layout

```
~/Navigation/saily/            ← this repo (Saily monorepo root)
~/Navigation/saily/web/        ← Next.js frontend (main working directory)
~/Navigation/saily/backend/    ← Saily PocketBase (port 8092)
~/Navigation/backend/          ← shared PocketBase (port 8090)
```

- All `npm` commands run from `~/Navigation/saily/web/`
- All git commits from `~/Navigation/saily/` (monorepo root)

## Tech stack

- Next.js 16 (App Router), TypeScript
- Go PocketBase backend (`backend/`, port 8092)
- Docker Compose orchestration (`make up` / `make down` / `make logs` / `make lint` / `make build`)
- Cypress (E2E) + Vitest (unit)

## Design system

Editorial/newspaper theme. Tokens in `web/src/app/globals.css`:
- `--font-display` (Turret Road), `--font-serif` (Source Serif), `--font-data` (Oxanium), `--font-system`
- `--color-ink*` / `--color-newsprint*` / `--color-paper` / `--color-bg*` / `--color-fg*` / `--color-border*` / `--color-glacier*` semantic scale

Landing style-lab variants (`web/src/components/landing/variant-*.tsx`) must sync `document.body` background with both the active variant and `document.documentElement.dataset.theme` — light/dark divergence in a variant is a bug, not a style choice.

## Standing product rules

Durable rules from prior sprint decisions — apply to every sprint and to every agent working in this repo (Claude, Codex, OpenCode, Gemini). Treat these the same as the Design system rules above: never violate without an explicit new decision.

- **Real science only.** No procedurally generated or fabricated puzzle/stat data anywhere in shipped copy — including landing-page "activity" stats. A fabricated stat (e.g. an invented "N light curves classified" counter) is a shipping bug, not a placeholder.
- **Terminology: clients, not contractors.** Same rule as Landnam — "contractor" wording is retired across the Star Sailors ecosystem, including live PostHog survey copy, not just local code.
- **Docker must never require network access.** `make up` and every container in `docker-compose.yml` must start and run fully offline. A base-image bump is an explicit, separate maintenance action, never a side effect of `make up`.
- **PostHog surveys must be live, real, and non-blocking.** Every survey ID referenced in code must resolve to a real, non-archived PostHog survey (project 199773) — no demo/dummy/placeholder IDs, and no custom aggregation key masquerading as a survey object unless explicitly documented as such (e.g. `CITIZEN_SCIENCE_VOTE_KEY`). Survey popups must never block or cover gameplay UI. Audit answered-vs-ignored survey volume every sprint.
- **Don't resume Rubin Comet Catchers / Gaia Variables speculatively.** Both were removed from the codebase 2026-07-12 (never fully functional — PocketBase query client was a permanent stub, zero real classifications ever persisted). `MISSION_GAMES` in `web/src/lib/mission.ts` is `["planet", "mars"]`. Only resume if BOTH: a real PocketBase data path exists, AND product explicitly commits a sprint to citizen-science roster growth. See the archived build-reference doc and the `orbtn4` task before touching this.
- **CMS content is Markdown/MDX in-repo, not Supabase.** Articles/reels/projects live as validated front-matter files under `web/` content directories, built via `scripts/cms/build-content.mjs` (`npm run cms:validate` / `cms:build` / `cms:preview`). PostHog remains the source for surveys/feedback/analytics — don't reach for a database for CMS content.

## Backend architecture

Three PocketBase instances. If parent repo is accessible, read `@doc/backend-architecture` for full detail.

- **Shared backend** (port 8090) — auth + canonical astronomy data (celestial_bodies, classifications, ecosystem_profiles)
- **Landnam backend** (port 8091 Docker / 8093 local) — Landnam game state
- **Saily backend** (this repo, port 8092) — this service's game state. Env: `SAILY_PB_ENCRYPTION_KEY`, `SHARED_PB_URL=http://backend:8090`

Auth is centralized: shared backend owns user accounts. Saily verifies tokens via `internal/sharedauth/verifier.go`, which calls `POST /api/collections/users/auth-refresh` on the shared backend. Flow: user authenticates on shared backend → gets JWT → sends to Saily API → Saily verifies via shared backend → returns user identity.

Local PocketBase superuser login (both backends, local dev only): `liam@skinetics.tech` / `ThisIsATestPassword` — see `~/Navigation/CLAUDE.md` for the monorepo-wide note. Create/update via `go run . superuser upsert liam@skinetics.tech ThisIsATestPassword` from `saily/backend`.

## Testing

```bash
cd ~/Navigation/saily/web
npm run test:unit          # vitest unit tests
npm run cypress:run        # cypress E2E (needs dev server running)
npm run test:e2e           # start-server-and-test + cypress
```

## Rules

1. TypeScript strict — no `any`, no suppressed errors
2. All puzzle/stat data must be real — no fabricated or procedurally generated content in shipped copy
3. See "Standing product rules" above for terminology, Docker-offline, PostHog-survey, and Rubin/Gaia requirements — these bind every agent, not just Claude
4. Read workspace docs/decisions for game design context before changing narrative or mission-selection logic

## Tickets & Sprints

As of 2026-07-18, **Desk (MCP server `desk`, registered globally — available in every repo, not just this one) is the live system of record for tickets, sprints, and board state.** Use its MCP tools directly (`projectId: "project-transit"`, workspace key `STS`):

- `list_tickets` / `get_ticket` / `list_story_boards` to read tickets, filtered by project/sprint/status.
- `create_ticket` / `update_ticket` to create tickets and change status, priority, sprint, epic, or labels.
- `add_comment` for implementation evidence — write it as a comment on the ticket instead of a markdown "Implementation Evidence" heading.
- `link_tickets` to relate or block tickets.

Status lifecycle: `Todo` → `In Progress` → `Done`. Desk trusts the status field directly rather than deriving it from anything else, so don't mark something `Done` with real work still outstanding — that's exactly the failure mode that made past sprints look complete when they weren't. **When Liam answers a question in chat, write it back to the relevant Desk ticket (as a comment or in the description) in the same turn** — an answer that only exists in conversation is not resolved.

**Plate is archived.** Do not create or update tasks there, and do not treat its state as authoritative.

**The old `workspace/projects/saily/tickets/<sprint>/*.md` + `workspace_ticket.py` / `workspace_board.py` / `Current.md` system is retired.** Don't create new ticket files there, don't run those scripts to change ticket state, and don't treat `Current.md` as the operational board (it's archived). `workspace/projects/saily/docs/` is unaffected — it remains the right place for long-form specs and decisions.

**Compass** (`/Applications/Compass.app`) previously read `~/Navigation/.knowns/`; that board is superseded by Desk for ticket state of record.
