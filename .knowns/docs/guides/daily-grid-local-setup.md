---
title: Daily Grid Local Setup
createdAt: '2026-02-10T04:10:07.649Z'
updatedAt: '2026-02-17T08:32:16.477Z'
description: Runbook for local Next.js + Supabase + PWA development.
tags:
  - setup
  - nextjs
  - supabase
  - pwa
  - runbook
  - docid-05e2a4
---
# Daily Grid Local Setup

## Prerequisites
- Node.js 20+
- Docker Desktop running
- Supabase CLI (`supabase --version`)

## First-time setup
1. Start local Supabase from project root: `supabase start`
2. In `web/`, install deps: `npm install`
3. Create `web/.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key from supabase start>`
4. Run app: `cd web && npm run dev`

## Useful commands
- Lint: `cd web && npm run lint`
- Build: `cd web && npm run build`
- Stop Supabase: `supabase stop`

## Notes
- Magic-link emails are available in Mailpit: `http://127.0.0.1:54324`
- Studio: `http://127.0.0.1:54323`
- Daily game endpoint: `/api/game/today`


## Docker Workflow (Alternative)

### Prerequisites
- **Docker Desktop running** (start Docker Desktop app first)
- Sufficient RAM allocated to Docker (recommended: 4GB+)

### Setup
1. Ensure Docker Desktop is started and running
2. From project root: `make up`
   - This starts both Supabase and the Next.js web app in containers
   - Web app available at: http://localhost:3000
   - Supabase services start automatically via containerized Supabase CLI

### Commands
- **Start**: `make up` (starts everything in background)
- **Stop**: `make down` (stops all containers)
- **Logs**: `make logs` (follow logs for both services)
- **Lint**: `make lint` (run linter in container)
- **Build**: `make build` (build Next.js app in container)

### Troubleshooting
- If you see "Cannot connect to Docker daemon": Start Docker Desktop first
- If containers fail to start: Try `make down` then `make up` again
- Check logs with `make logs` to see startup progress

### Notes
- Environment variables are pre-configured for containerized setup
- Hot reloading works with volume mounts and WATCHPACK_POLLING
- Supabase runs fully containerized (not just CLI)
- Supabase Studio: http://localhost:54323
- Mailpit (email testing): http://localhost:54324
