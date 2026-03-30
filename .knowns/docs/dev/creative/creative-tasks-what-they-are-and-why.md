---
title: Creative tasks — what they are and why
createdAt: '2026-03-30T11:45:40.854Z'
updatedAt: '2026-03-30T11:45:40.854Z'
description: >-
  Overview of all open creative tasks across Saily and Planet Hunters: who
  they're for, what unblocks, and what format output should take
tags:
  - creative
  - writing
  - design
  - liam
---
# Creative Tasks — What They Are and Why

Creative tasks are work items that require **human authorship** — writing, design direction, or editorial judgment that an engineer can't generate from code alone. They block implementation tickets and should be completed before (or alongside) the engineering that depends on them.

---

## Why they exist

The codebase has systems that render content — dialogue, UI copy, reward screens, celebration beats — but the *content itself* hasn't been written. These tasks are placeholders or gaps that show up as empty strings, placeholder text, or TODO comments in the code.

Without this content:
- Screens show blank or fallback text in production
- Implementation tickets can't be marked done (they depend on copy being handed off)
- Narrative coherence breaks (characters feel empty or generic)

---

## Saily — open creative tasks

| Task ID | Title | Unblocks |
|---------|-------|----------|
| `33dtin` | Write briefingExpression dialogue for all 4 character arcs | Avatar expression system |
| `nm3efx` | Write arc-completion reward screen copy (all arcs) | Arc reward screen |
| `2pqc1e` | Draft chapter beat outlines for Story Arc 2 | Arc 2 content |
| `wnmktw` | Write mission control helper copy for puzzle actions | In-game UX guidance |
| `8rv9kf` | Design arc-complete celebration beat + reward screen spec | Reward moment UX |
| `8fy0rk` | Design InSight Weather Desk explanation and result copy | InSight mission UX |
| `94d73g` | Write science-value framing for each mission type | Onboarding, home hub, helpers |
| `5hakbo` | Sketch the character selection / briefing screen layout | Briefing screen implementation |

> Closed as merged: `lccgj7` → `33dtin`, `magq2n` → `nm3efx`, `tohsuq` → `8rv9kf`

**Characters**: Zix, Brix, Pip, The Cartographer (Carta). Each has a distinct voice and arc position — match tone accordingly.

**Output format**: Plain text lines ready to drop into `lib/storylines.ts` or the relevant scene file. If it's copy for a screen, include the headline and body separately.

---

## Saily — new design tasks (proposed)

| Task ID | Title | What it enables |
|---------|-------|-----------------|
| `xnbvs1` | Design postcard gallery screen | Give collected postcards a home; surface player history |
| `uq7odn` | Write character science-reaction lines | Short in-universe lines when player annotates a notable target |
| `730tww` | Design streak-repair / archive day visual flow | Unspecced today — players use it, nothing celebrates it |

---

## Planet Hunters — status

All Planet Hunters creative tasks from the previous sprint are **complete**:

| Task ID | Title | Status |
|---------|-------|--------|
| `49fr2b` | Write in-game button guide copy (mining, debrief, launchpad) | ✓ Done |
| `gu5376` | Write copy and flow for the SR2 unlock screen | ✓ Done |
| `ps6nfy` | Design the SR2 unlock celebration beat | ✓ Done |

No open creative tasks remain in Planet Hunters as of 2026-03-30.

---

## How to hand off

1. Write copy directly into the task notes (`knowns task edit <id> --append-notes "..."`)
2. Or drop it in a comment in the relevant source file and link the task
3. Mark AC done when copy is finalised: `knowns task edit <id> --check-ac N`
4. Ping engineering — these tasks block specific implementation tickets listed above
