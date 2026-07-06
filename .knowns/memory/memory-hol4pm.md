---
id: hol4pm
title: Landing vote emails can be blocked by Vercel PocketBase env mismatch
layer: project
category: failure
status: proposed
tags:
  - debug
  - landing
  - resend
  - vercel
  - pocketbase
createdAt: '2026-07-06T05:02:48.564Z'
updatedAt: '2026-07-06T05:02:48.564Z'
---

Root cause pattern: `/api/landing-vote` first persists to the Saily PocketBase `landing_votes` collection and only then sends the Resend notification. On 2026-07-06, production `https://www.thedailytransit.com/api/landing-vote` returned `{"error":"persist_failed"}`, while direct POSTs to `https://signal-k-saily.fly.dev/api/collections/landing_votes/records` succeeded. This indicates the Vercel route is using a missing or wrong `SAILY_PB_URL` / `NEXT_PUBLIC_SAILY_PB_URL` rather than a bad PocketBase collection/migration. Fix/code hardening: log safe PocketBase host/env presence on persist failure, don't let PocketBase persistence failure block Resend email delivery, and make the client wait for the API response instead of swallowing errors.
