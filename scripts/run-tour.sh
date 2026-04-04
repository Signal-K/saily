#!/usr/bin/env bash

set -euo pipefail

echo "Starting Saily E2E Game Tour..."

# Clean up previous runs
rm -f tour-output.log
rm -rf web/cypress/screenshots/tour.cy.ts

# Ensure containers are up
# We use --profile tour to start the tour-tester service
# We run it with 'docker compose run' to capture the output directly

docker compose --env-file .env.docker run --rm tour-tester cypress run --spec cypress/e2e/tour.cy.ts | tee tour-output.log

echo "Processing results..."
node scripts/process-tour-results.mjs

echo "E2E Tour process complete."
