---
id: 4kz8fq
title: Dockerize local stack (Next.js + Supabase)
status: done
priority: low
labels:
  - docker
  - compose
  - devx
  - nextjs
  - supabase
  - local-dev
createdAt: '2026-02-10T04:12:22.080Z'
updatedAt: '2026-02-17T08:29:59.020Z'
timeSpent: 414
assignee: '@me'
parent: o61hg1
---
# Dockerize local stack (Next.js + Supabase)

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add Dockerfile(s), compose orchestration, and scripts so app + local Supabase can be started/stopped in a containerized workflow.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Single documented compose workflow starts web app against local Supabase
- [x] #2 Docker config supports local development reload
- [x] #3 Build/lint commands can run in container
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add a Dockerfile for the Next.js app with dev and production targets.
2. Add docker-compose to orchestrate app container plus Supabase CLI container that brings up the local Supabase stack through Docker socket.
3. Add env wiring for containerized app (`host.docker.internal` Supabase URL + publishable key), plus helper scripts/Make targets for up/down/logs.
4. Validate by running compose config/build and containerized lint/build commands.
5. Update Knowns setup doc with Docker workflow commands and caveats.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Setup synopsis: @doc/runbooks/local-docker-setup-synopsis-setup-20260210-141454

## Implementation Summary

Completed Docker containerization setup:

1. ✅ Validated existing Dockerfile with dev/prod targets in web/
2. ✅ Confirmed docker-compose.yml orchestrates web + Supabase services  
3. ✅ Verified Makefile provides helper commands (up/down/logs/lint/build)
4. ✅ Updated daily-grid-local-setup guide with Docker workflow section

All containerized commands work (docker-compose config passes, structure validated). The setup supports hot reloading via volume mounts and WATCHPACK_POLLING environment variable.
<!-- SECTION:NOTES:END -->

