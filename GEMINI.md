# GEMINI

Compatibility entrypoint for runtimes that auto-detect `GEMINI.md`.

<!-- KNOWNS GUIDELINES START -->

**CRITICAL: Start with Knowns MCP `initial` when available. Use `help("tool.*")` or `help("workflow.*")` for domain details on demand.**

## Runtime Guidance

- Knowns is the repository memory layer for humans and the AI-friendly working layer for agents.
- MCP `initial` is the primary AI bootstrap: project state, tool domains, code rules, and workflow routing.
- MCP `help` is the primary on-demand source for action schemas and recipes.
- Treat this file only as a lightweight compatibility entrypoint.

## Minimum Rules

- Use Knowns as the canonical system for tasks, docs, templates, and workflow state.
- Never manually edit Knowns-managed task or doc markdown.
- Search first, then read only relevant docs and code.
- Use `search` for discovery; use MCP `retrieve` tool when a workflow needs structured context with citations. Fall back to CLI `knowns retrieve` if MCP is unavailable.
- For code operations, use `code` tool: `find`/`symbols` for structure, `references`/`definition` for navigation, `rename`/`replace`/`replace_body`/`insert`/`delete` for editing. Use `help("code.*")` or `help("workflow.code-edit")` for details.
- Plan before implementation unless the user explicitly overrides that workflow.
- Validate before considering work complete.
- Use memory tools: `memory({ action: "list" })` at session start, `memory({ action: "add" })` after tasks for reusable knowledge.
- Proactively capture durable memory when scope and durability are clear.

## Quick Reference

```bash
knowns doc list --plain               # List docs
knowns task list --plain              # List tasks
knowns task <id> --plain              # View task
knowns doc "<path>" --plain --smart  # View doc
knowns search "query" --plain        # Search docs/tasks
knowns retrieve "query" --json      # Retrieve structured context pack (CLI fallback)
```


## Tickets & Sprints

**Sprint label format: `sprint-YYYY-MM-DD` where the date is the Saturday ending the sprint.**
Never use numbered sprints (`sprint-6`, `sprint-7`, etc.) — always use the end date.

```bash
# Create a ticket assigned to the current sprint
knowns task create "Title"   --priority high   --label "project-landnam"   --label "sprint-2026-06-27"

# Add sprint label to an existing ticket
knowns task edit <id> --labels "project-landnam,sprint-2026-06-27,other-labels"

# List tickets in the current sprint
knowns task list --plain --label "sprint-2026-06-27"

# Mark a ticket in-progress when starting work
knowns task status <id> in-progress

# Mark done when complete
knowns task status <id> done
```

**Required labels on every ticket:**
- Project label: `project-landnam`, `project-saily`, `project-compass`, etc.
- Sprint label: `sprint-YYYY-MM-DD` (only for work scheduled this sprint)

**Compass** is the macOS task board at `/Applications/Compass.app`. It reads from `~/Navigation/.knowns/`. The "This Week" board view shows tasks whose labels match the current sprint. After editing task labels via CLI, Compass auto-refreshes within ~2 seconds.

<!-- KNOWNS GUIDELINES END -->
