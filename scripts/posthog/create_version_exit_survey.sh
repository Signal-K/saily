#!/usr/bin/env bash
set -euo pipefail

# Creates an exit survey in PostHog for the current app version.
# Requires a PERSONAL API key with project write permissions.

if [[ -z "${POSTHOG_PERSONAL_API_KEY:-}" ]]; then
  echo "Missing POSTHOG_PERSONAL_API_KEY"
  exit 1
fi

POSTHOG_HOST="${POSTHOG_HOST:-https://us.posthog.com}"
POSTHOG_PROJECT_ID="${POSTHOG_PROJECT_ID:-199773}"
SURVEY_NAME="${SURVEY_NAME:-DailySail Exit Survey (v1)}"
APP_VERSION="${APP_VERSION:-v1}"
TRIGGER_EVENT="${TRIGGER_EVENT:-exit_survey_triggered}"
TRIGGER_SOURCE="${TRIGGER_SOURCE:-first_game_complete}"

read -r -d '' SURVEY_PAYLOAD <<JSON || true
{
  "name": "${SURVEY_NAME}",
  "description": "Exit survey for DailySail ${APP_VERSION}",
  "type": "popover",
  "questions": [
    {
      "type": "single_choice",
      "question": "How was this version of DailySail?",
      "choices": ["Great", "Okay", "Needs work"],
      "description": "Quick pulse check for ${APP_VERSION}",
      "buttonText": "Next"
    },
    {
      "type": "open",
      "question": "What should we improve next?",
      "description": "Optional free-text feedback",
      "optional": true,
      "buttonText": "Submit"
    }
  ],
  "conditions": {
    "events": {
      "values": [
        {
          "name": "${TRIGGER_EVENT}",
          "propertyFilters": {
            "source": { "values": ["${TRIGGER_SOURCE}"], "operator": "exact" },
            "app_version": { "values": ["${APP_VERSION}"], "operator": "exact" }
          }
        }
      ]
    }
  }
}
JSON

echo "Creating survey in PostHog project ${POSTHOG_PROJECT_ID} (${POSTHOG_HOST})..."

curl -sS -X POST "${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/surveys/" \
  -H "Authorization: Bearer ${POSTHOG_PERSONAL_API_KEY}" \
  -H "Content-Type: application/json" \
  --data "${SURVEY_PAYLOAD}"

echo
echo "If successful, copy the returned survey id into NEXT_PUBLIC_POSTHOG_EXIT_SURVEY_ID."
