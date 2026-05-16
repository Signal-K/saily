---
title: Saily Project Specifications Index
description: ''
createdAt: '2026-05-15T02:31:20.333Z'
updatedAt: '2026-05-15T02:31:20.333Z'
tags: []
---

# Saily Project Specifications

This directory contains specifications for **Saily (The Daily Sail)** — the daily citizen science puzzle app.

> **Note:** Several docs that were previously stored here (deployment-system, mineral-deposits, inventory-management, game-economy, auth-onboarding, classification-workflows, complete-user-flow-megadoc) described Star Sailors web client features, not Saily features. They have been moved to `client/specs/`.

## Saily-Specific Docs

- [Product Specification](saily-product-spec.md) — High-level vision, daily puzzle format, and product goals.
- [System Specification](saily-system-spec.md) — Technical architecture, Supabase schema, and system design.
- [Characters & Storylines](characters-storylines.md) — Narrative elements and character backgrounds. **⚠ Stale — describes Zix/Brix/Pip/Carta who were replaced by Gizmo (task mrwlmf). Needs rewrite.**

## What Saily Is (Not)

Saily is a **Wordle-style daily science puzzle app**. It does NOT have:
- Telescope / satellite / rover deployments (→ client project)
- Mineral deposits or extraction (→ client project)
- Stardust economy (→ client project)
- Research upgrade trees (→ client project)
- Inventory management (→ client project)

Saily has: daily missions (3 mini-games), Data Chips economy, storyline chapters (Gizmo), streak tracking, science data feeds (TESS, Mars, asteroids).
