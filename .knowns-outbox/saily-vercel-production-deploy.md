# Proposal: Deploy Saily to Vercel production from main

## Canonical Task

- `@task-j4h6kd` in `~/Navigation`
- Status: `in-review`
- Sprint label: `sprint-saily-0620`

## Context

Saily / The Daily Sail needs a GitHub Actions workflow that deploys the linked Vercel project `thedailysail` to production whenever `main` receives a push.

The Vercel project is already linked locally in `web/.vercel/project.json`, but that file should not be committed. GitHub repository secrets already exist for:

- `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`
- `VERCEL_TEAM_ID`

The Vercel CLI expects the team/org value as `VERCEL_ORG_ID`, so the workflow maps `secrets.VERCEL_TEAM_ID` into that environment variable.

## Implemented Change

- Added `.github/workflows/deploy-vercel-prod.yml`
- Workflow triggers on pushes to `main` and via manual dispatch.
- Workflow runs from `web`, installs dependencies with `npm ci`, verifies the Vercel token with `vercel whoami`, pulls the production Vercel environment, builds with `vercel build --prod`, and deploys with `vercel deploy --prebuilt --prod`.

## Current Blocker

The first GitHub Actions run failed before build/deploy because the existing `VERCEL_TOKEN` secret is invalid:

```text
Error: The token provided via `--token` argument is not valid.
```

Next external action: replace the GitHub Actions `VERCEL_TOKEN` secret with a fresh Vercel access token and rerun the workflow.
