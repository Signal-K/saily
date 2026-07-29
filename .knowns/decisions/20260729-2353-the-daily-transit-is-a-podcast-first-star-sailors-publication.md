---
id: 20260729-2353-the-daily-transit-is-a-podcast-first-star-sailors-publication
title: The Daily Transit is a podcast-first Star Sailors publication
status: accepted
supersedes: []
supersededBy: []
tags:
  - editorial
  - podcast
  - atlas
  - branding
sources:
  - '@task-56di2r'
relatedDocs: []
relatedTasks:
  - 56di2r
createdAt: '2026-07-29T20:53:19.220Z'
updatedAt: '2026-07-29T20:53:19.220Z'
---

## Context

The Daily Transit previously presented its CMS entries as generic articles and stories. The publication now needs a clearer editorial identity and a stronger onward journey into the wider Star Sailors ecosystem.

## Decision

Treat podcast episodes as the primary editorial unit. The existing article body is the canonical full transcript, with optional episode number, audio URL, and duration stored through CMS extra frontmatter. Keep the exact affiliation line “A Star Sailors publication” visible, and offer Atlas as the primary contextual continuation from episode surfaces.

## Alternatives Considered

Keep articles primary and add occasional audio embeds; introduce a new podcast collection and migrate existing article URLs; rebrand The Daily Transit as independent from Star Sailors.

## Consequences

Existing /articles URLs and records remain compatible while their UI is reframed as episodes and transcripts. Audio hosting and RSS/feed generation remain separate future work. Future publication surfaces should lead with listening/transcripts and include a relevant Atlas path without obscuring the Star Sailors parent brand.
