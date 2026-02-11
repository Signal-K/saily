---
title: Frontend Setup Synopsis
createdAt: '2026-02-10T06:14:54.498Z'
updatedAt: '2026-02-10T06:23:48.392Z'
description: >-
  Complete synopsis of all frontend setup work and current local runtime
  workflow
tags:
  - setup
  - frontend
  - nextjs
  - supabase
  - pwa
  - runbook
  - docid-8eb29e
---
## Scope
This runbook summarizes all frontend setup work completed so far, plus the active containerization/setup task.

## Setup Tasks Covered
Completed tasks:
- [`5froqu` - Scaffold Next.js app with TypeScript and core UI shell](../../tasks/task-5froqu%20-%20Scaffold-Nextjs-app-with-TypeScript-and-core-UI-shell.md)
- [`mgz6bl` - Set up local Supabase stack and DB schema](../../tasks/task-mgz6bl%20-%20Set-up-local-Supabase-stack-and-DB-schema.md)
- [`wrb0pd` - Implement auth + profile + persistent game progress](../../tasks/task-wrb0pd%20-%20Implement-auth-profile-persistent-game-progress.md)
- [`g02dln` - Build daily game engine + streak/stat calculation](../../tasks/task-g02dln%20-%20Build-daily-game-engine-streakstat-calculation.md)
- [`8q3l0d` - Add comments and badge awarding](../../tasks/task-8q3l0d%20-%20Add-comments-and-badge-awarding.md)
- [`fnvohs` - Enable PWA installability and offline shell](../../tasks/task-fnvohs%20-%20Enable-PWA-installability-and-offline-shell.md)
- [`o61hg1` - Build NYT-style daily games app (parent integration task)](../../tasks/task-o61hg1%20-%20Build-NYT-style-daily-games-app-Nextjs-Supabase-PWA.md)

Active setup task:
- [`4kz8fq` - Dockerize local stack (Next.js + Supabase)](../../tasks/task-4kz8fq%20-%20Dockerize-local-stack-Nextjs-Supabase.md)

## What Was Set Up
1. Frontend foundation
- Next.js App Router project scaffolded with TypeScript.
- Core UI shell and home game hub implemented.
- Baseline lint/build workflow established.

2. Local backend environment for frontend
- Local Supabase stack initialized and schema/migrations added.
- RLS policies and DB functions configured for safe user-scoped data access.

3. Auth and persistence plumbing
- Supabase magic-link auth integrated.
- Profile and gameplay progress persistence wired into app flows.

4. Core gameplay + progression
- Deterministic-by-date daily game flow implemented.
- Submission pipeline updates streak and aggregate stats.

5. Social and reward features
- Comments API/UI enabled for authenticated users.
- Badge milestone awarding and profile display wired.

6. PWA + offline readiness
- Manifest and icons added.
- Service worker registration and offline fallback route implemented.

7. Containerized local dev workflow (in progress)
- Compose-based orchestration for web + local Supabase startup.
- Env wiring for containerized frontend (`host.docker.internal` strategy).
- Runtime issue fixed: Supabase CLI now started via `npx --yes supabase@2`.

## Current Runtime Notes
- Frontend URL: `http://localhost:3000`
- Web container is mapped to host `3000:3000`
- Supabase services are started from the compose-driven setup flow
- Browser auto-open from this execution environment may fail due to LaunchServices issues; manual open of `http://localhost:3000` is reliable.
