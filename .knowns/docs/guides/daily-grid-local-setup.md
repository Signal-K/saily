---
title: Daily Grid Local Setup
createdAt: '2026-02-10T04:10:07.649Z'
updatedAt: '2026-02-10T06:18:56.747Z'
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
