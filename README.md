# Saily

Grounded daily citizen science puzzles — hunt planets, survey asteroids, classify Mars. Built with Next.js and PocketBase.

Saily is a Wordle-style daily app where you help characters in simple, multi-chapter stories solve real-world scientific mysteries by classifying actual astronomical and planetary data.

## Quick Start (Docker)
...
| Command | Description |
|---------|-------------|
| `make up` | Start all services in Docker containers |
| `make down` | Stop all containers |
| `make logs` | View logs from all services |
| `make lint` | Run linter in container |
| `make build` | Build Next.js app in container |

## Saily Core Concepts

- **Real Science:** Every puzzle uses actual data from TESS or Mars surface imagery. No procedural generation.
- **Daily Mission:** One mission per day, resetting at Melbourne/AEST Midnight.
- **Story Chapters:** Follow 4 characters through 5-chapter story arcs.
- **Data Chips:** Earn consumables to repair streaks and unlock the archive.
- **Bulk Discovery:** Your classifications contribute to a global consensus submitted to scientific bodies.


## Architecture

- **Frontend**: Next.js 16 with TypeScript, App Router
- **Backend**: Shared Star Sailors PocketBase auth plus the Saily PocketBase backend
- **Container Orchestration**: Docker Compose
- **Development**: Hot reloading with volume mounts

## Services

When running `make up`, these services start:

- **Web App**: http://localhost:3000
- **Shared PocketBase**: http://localhost:8090
- **Saily PocketBase**: http://localhost:8092

## Environment variables

Copy `web/.env.example` to `web/.env.local` for local `npm run dev`, or copy
`.env.docker.example` to `.env.docker` for `make up`/`make bootstrap`. Both
files document every required var inline (PocketBase, PostHog, Resend, CMS
allowlist, E2E credentials).

### Secret rotation

Do this before every production deploy, and whenever an environment is
promoted (dev → staging → prod):

1. Generate fresh values for every var marked `SECRET` in `web/.env.example` /
   `.env.docker.example` — do not carry over local/dev values. This includes
   `SAILY_PB_ENCRYPTION_KEY`, `ADMIN_SYNC_SECRET`, `SAILY_PB_SUPERUSER_PASSWORD`,
   `RESEND_API_KEY`, and `POSTHOG_PERSONAL_API_KEY`.
2. Rotate the PocketBase superuser password on both the shared and Saily
   backends, and update the `SHARED_PB_SUPERUSER_*` and
   `SAILY_PB_SUPERUSER_*` credentials wherever they're configured (Vercel,
   Docker secrets, CI).
3. Confirm `NEXT_PUBLIC_APP_VERSION` is bumped for the release and is
   consistent across every environment config.
4. Never commit a real `.env`, `.env.local`, or `.env.docker` file — only the
   `*.example` files are tracked in git (see `.gitignore`).

## Documentation

See [guides/daily-grid-local-setup](../.knowns/docs/guides/daily-grid-local-setup.md) for detailed setup instructions and alternative workflows.
