---
title: Knowns Document Standards
createdAt: '2026-02-10T06:19:00.810Z'
updatedAt: '2026-02-10T06:19:15.726Z'
description: Rules all Knowns docs must follow
tags:
  - governance
  - docs
  - knowns
  - docid-bb3edb
---
# Knowns Document Standards

## Mandatory Metadata Rule
Every document in Knowns must include exactly one unique 6-character UUID token in YAML front matter, represented as a tag in this format:

- `docid-<6 hex chars>`

Examples:
- `docid-05e2a4`
- `docid-8eb29e`

## Constraints
- Must be lowercase hex: `0-9` and `a-f`
- Must be exactly 6 characters after `docid-`
- Must be unique across all docs
- Must live in front matter metadata (`tags`)

## Required Workflow
When creating a new document:
1. Generate a new 6-char ID.
2. Add it to the document tags as `docid-xxxxxx` at creation time (or immediately after).
3. Confirm no other document uses that same ID.

## Compliance
Current documents have been updated to include this metadata rule.
