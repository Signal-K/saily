---
id: on7qfx
title: "Database error saving new user"
status: done
priority: high
labels:
  - error
  - db
  - supabase
  - auth
createdAt: '2026-05-06T12:17:00Z'
updatedAt: '2026-05-06T12:17:00Z'
timeSpent: 0
---

# Database error saving new user

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
SES Removing unpermitted intrinsicscontent.js:2 Check phishing by URL: Passed.jjfnwqcoknfeyxtozdsw.supabase.co/auth/v1/token?grant_type=password:1  Failed to load resource: the server responded with a status of 400 ()jjfnwqcoknfeyxtozdsw.supabase.co/auth/v1/signup?redirect_to=https%3A%2F%2Fthedailysail.starsailors.space%2Fauth%2Fcallback%3Fnext%3D%2Fprofile:1  Failed to load resource: the server responded with a status of 500 ()9The resource <URL> was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Fixed at the database-trigger layer. Added a new Supabase migration that replaces `public.handle_new_user()` with collision-safe username generation based on `raw_user_meta_data`/email fallback, preserving the referral-code and data-chip award logic. This removes the common `profiles.username` uniqueness failure mode that surfaced as Supabase’s generic “Database error saving new user” during signup.
<!-- SECTION:NOTES:END -->
