---
id: co7xis
title: Local Cypress e2e needs unsandboxed Node for localhost services
layer: project
category: failure
status: proposed
tags:
  - debug
  - cypress
  - e2e
  - local-dev
createdAt: '2026-07-21T18:48:25.420Z'
updatedAt: '2026-07-21T18:48:25.420Z'
---

Root cause pattern: Node-based e2e setup and Next/Cypress runs can fail under the filesystem/network sandbox with `connect EPERM 127.0.0.1:8090` or `listen EPERM 0.0.0.0:3000`, even when curl can reach PocketBase. Fix: start Docker/PocketBase normally, then rerun the Node seed and `npm run test:e2e` outside the sandbox with `web/.env.local` and `web/.env.e2e.local` loaded as appropriate. On 2026-07-21 this produced a green Cypress run: 16/16 passing across auth-profile, mission-minigames, and smoke.
