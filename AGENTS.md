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

Auth is centralized: shared backend owns user accounts. Saily verifies tokens via `internal/sharedauth/verifier.go`, which calls `POST /api/collections/users/auth-refresh` on the shared backend. Flow: user authenticates on shared backend → gets JWT → sends to Saily API → Saily verifies via shared backend → returns user identity.

**Canonical source: `~/Navigation/workspace/` (ZenNotes-backed).** Knowns is being phased out for planning — do not create or edit `knowns task` entries for new Saily work. Read `~/Navigation/CLAUDE.md` for the full workflow; the short version:

```bash
cd ~/Navigation
cat workspace/Current.md                                  # active board: what's active/in-review/blocked/next
python3 scripts/workspace_board.py                         # regenerate board after any frontmatter change
python3 scripts/workspace_ticket.py list --project saily --sprint <active-sprint-slug>
python3 scripts/workspace_ticket.py show <ticket-id-or-slug>
python3 scripts/workspace_ticket.py update <ticket-id-or-slug> --status in-review --heading "Implementation Evidence" --note "..."
```

Tickets live at `workspace/projects/saily/tickets/<sprint>/*.md`, specs/docs at `workspace/projects/saily/docs/`.

**Sprint label format: `sprint-YYYY-MM-DD`** where the date is the Saturday ending the sprint (never numbered sprints like `sprint-6`). Sprint frontmatter must match a `workspace/sprints/<slug>/README.md` with `status: active` — check this fresh each session, there can be more than one active sprint across projects.

Status lifecycle: `todo` → `in-progress` → `in-review` (only Liam marks `done`).

Open decisions needing Liam's input go in a `status: blocked` ticket, each question formatted as `**N. Question text` (no closing `**`) followed by a blank `> Answer:` line — `workspace_board.py` surfaces these under "Open Questions" in `Current.md`. **When Liam answers a question in chat, write the `> Answer:` line back into the ticket in the same turn** — an answer that only exists in conversation is not resolved.

**Compass** (`/Applications/Compass.app`) reads `~/Navigation/.knowns/` for its board, but ticket state of record is the workspace ticket files above — Compass reflects them, it does not own them.

To find the current sprint Saturday: run `date +%Y-%m-%d` and count to the nearest Saturday.

## Documentation & Decisions: Craft, Desk, ZenNotes

As of 2026-07-21, this is the canonical split for where writing lives, monorepo-wide (see `~/Navigation/CLAUDE.md`):

- **Craft** — long-form writing: planning docs, ideation, proposals, spec drafts, feedback/playtest triage write-ups, research notes. Every Craft doc tied to active Saily work must be **tagged** and **attached to its Desk ticket(s)/story** (`attach_craft_doc`) — don't leave it floating with no ticket link.
- **ZenNotes** (`~/Navigation/workspace`, ZenNotes MCP) — canonical home for **decisions and rules**: finalized specs, feature/mission definitions and their limits, gameplay/content decisions. Search here first for authoritative rules, not Craft.
- **Desk** — tickets/stories/epics only. Note: this file's "Tickets & Sprints" section above still describes the retired `workspace_ticket.py`/`Current.md` flow — the rest of the monorepo has moved to Desk (MCP server `desk`) as system of record; treat that section as stale until it's updated to match.

Flow: research/ideation in Craft → tag + attach to the Desk ticket once it needs review or action → once a decision lands, write the durable rule/spec into ZenNotes, not just a Craft doc or ticket comment.
