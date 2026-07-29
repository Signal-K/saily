---
id: 56di2r
title: Orient The Daily Transit around podcast episodes and Atlas
status: done
priority: medium
labels:
  - normal
  - frontend
  - editorial
  - podcast
  - atlas
createdAt: '2026-07-29T20:44:54.667Z'
updatedAt: '2026-07-29T20:52:55.477Z'
timeSpent: 468
assignee: '@me'
---
# Orient The Daily Transit around podcast episodes and Atlas

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Begin repositioning The Daily Transit as a podcast-first Star Sailors publication: episodes are primary, transcript pages replace generic articles, and each editorial journey offers a clear next step into Atlas. Reuse the existing CMS extra_frontmatter capability rather than introducing a migration or audio vendor.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Navigation and publication copy present The Daily Transit as a podcast and a Star Sailors publication
- [x] #2 The article index and detail experience are reframed as episodes and transcripts while remaining compatible with existing articles
- [x] #3 Episode metadata can optionally describe an audio URL, episode number, and duration without a database migration
- [x] #4 Atlas has a prominent contextual call to action from publication surfaces
- [x] #5 Relevant tests, lint, and build checks pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extend `web/src/lib/cms.ts` to normalize optional `episodeNumber`, `audioUrl`, and `audioDuration` values from file frontmatter or PocketBase `extra_frontmatter`, preserving full compatibility with existing article records.
2. Reframe `web/src/components/daily-transit-masthead.tsx` around Episodes and the exact brand line “A Star Sailors publication,” while retaining the existing Atlas destination.
3. Turn `web/src/app/articles/page.tsx` into an Episodes & Transcripts index that handles podcast-enabled and legacy entries gracefully.
4. Turn `web/src/app/articles/[slug]/page.tsx` into an episode page with optional native audio playback, a transcript-first reading structure, and a contextual Atlas continuation CTA.
5. Run focused formatting/type checks, the relevant unit suite, lint, and a production build; record results before completing ACs.

Context: @doc/saily-specs/saily-product-spec. No audio host, feed generation, URL migration, or CMS database migration is included in this first slice.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Done: Episodes/transcripts framing, optional episode/audio metadata via extra_frontmatter, native audio playback, exact Star Sailors publication line, and contextual Atlas CTAs. Verification: npm run lint; npm run test:unit (53/53); npm run build; git diff --check. Visual browser QA unavailable because no browser backend was connected.
<!-- SECTION:NOTES:END -->

