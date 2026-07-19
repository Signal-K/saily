# File-backed Article Fallback

Published CMS articles normally come from the `cms_articles` PocketBase collection. This folder is a small fallback for launch-critical article content that must be available from the repo even when a local PocketBase has no published rows.

## Format

Create one Markdown file per article:

```md
---
slug: article-slug
title: Article title
status: published
summary: One sentence summary for article cards and tickers.
tags: saily, sprint-10
sources: https://example.test/source
citizenScienceLinks: /games/today, /games/close-approaches
publishedAt: 2026-07-19T12:00:00.000Z
updatedAt: 2026-07-19T12:00:00.000Z
---

Article body.
```

Rules:

- Keep `slug` lowercase and hyphenated.
- Keep `status: published` only for content intended to appear in-app.
- Use comma-separated values for `tags`, `sources`, and `citizenScienceLinks`.
- Put `{{puzzle}}` on its own line to embed the daily puzzle widget.
