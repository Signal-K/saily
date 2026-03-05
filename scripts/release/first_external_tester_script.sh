#!/usr/bin/env bash

set -euo pipefail

echo "Saily v0 - First External Tester Script"
echo "======================================="
echo "1. Open the app and sign in via magic link."
echo "2. Play Today's Puzzle and submit at least one annotation."
echo "3. Open Asteroid Lab and save one annotation draft."
echo "4. Visit Discuss and create one short post."
echo "5. Visit Profile and confirm stats update."
echo "6. Optional: install as PWA from browser prompt/menu."
echo
echo "If any step fails, capture:"
echo "- Page URL"
echo "- Timestamp"
echo "- Action taken"
echo "- Screenshot"
echo
echo "Release rollback trigger:"
echo "- 2 or more testers blocked on sign-in, save, or submit in first 24 hours."
