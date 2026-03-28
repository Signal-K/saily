#!/usr/bin/env bash
set -euo pipefail

# Create lightweight mechanic surveys (max 2 questions) in PostHog.
# Required:
#   POSTHOG_PERSONAL_API_KEY
# Optional:
#   POSTHOG_HOST (default https://us.posthog.com)
#   POSTHOG_PROJECT_ID (default 199773)
#   APP_VERSION (default v1)

if [[ -z "${POSTHOG_PERSONAL_API_KEY:-}" ]]; then
  echo "Missing POSTHOG_PERSONAL_API_KEY"
  exit 1
fi

POSTHOG_HOST="${POSTHOG_HOST:-https://us.posthog.com}"
POSTHOG_PROJECT_ID="${POSTHOG_PROJECT_ID:-199773}"
APP_VERSION="${APP_VERSION:-v1}"
TRIGGER_EVENT="mechanic_feedback_triggered"

create_survey() {
  local source="$1"
  local survey_name="$2"
  local question_one="$3"
  local choices_csv="$4"
  local question_two="$5"

  local payload
  payload="$(cat <<JSON
{
  "name": "${survey_name}",
  "description": "Mechanic feedback survey (${source}) for ${APP_VERSION}",
  "type": "popover",
  "questions": [
    {
      "type": "single_choice",
      "question": "${question_one}",
      "choices": [${choices_csv}],
      "description": "Quick check-in (1 tap)",
      "buttonText": "Next"
    },
    {
      "type": "open",
      "question": "${question_two}",
      "description": "Optional",
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
            "source": { "values": ["${source}"], "operator": "exact" },
            "app_version": { "values": ["${APP_VERSION}"], "operator": "exact" }
          }
        }
      ]
    }
  }
}
JSON
)"

  local response
  response="$(curl -sS -X POST "${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/surveys/" \
    -H "Authorization: Bearer ${POSTHOG_PERSONAL_API_KEY}" \
    -H "Content-Type: application/json" \
    --data "${payload}")"

  local survey_id
  survey_id="$(printf '%s' "${response}" | node -e "const fs=require('fs');const raw=fs.readFileSync(0,'utf8');try{const j=JSON.parse(raw);process.stdout.write(j.id?String(j.id):'');}catch{process.stdout.write('');}")"

  if [[ -z "${survey_id}" ]]; then
    echo "Failed creating survey for source=${source}"
    echo "${response}"
    exit 1
  fi

  echo "${source}=${survey_id}"
}

echo "Creating mechanic surveys in PostHog project ${POSTHOG_PROJECT_ID} (${POSTHOG_HOST})..."

create_survey "planet_transit" "Cosmo Feedback: Transit Analysis" \
  "How clear did the transit signal interaction feel?" \
  "\"Very clear\", \"Mostly clear\", \"Confusing\"" \
  "What one change would make the transit step smoother?"

create_survey "planet_no_detection" "Cosmo Feedback: No Planet Outcome" \
  "Was it easy to report that no planet was detected?" \
  "\"Very easy\", \"Acceptable\", \"Not clear\"" \
  "What made the no-planet decision hard, if anything?"

create_survey "asteroid_mapping" "Cosmo Feedback: Asteroid Mapping" \
  "How satisfying was marking asteroid anomalies?" \
  "\"Very satisfying\", \"Okay\", \"Too fiddly\"" \
  "What would improve the asteroid mapping flow?"

create_survey "mars_classification" "Cosmo Feedback: Surface Classification" \
  "How intuitive was terrain classification?" \
  "\"Very intuitive\", \"Mostly\", \"Needs clarity\"" \
  "What confused you in surface classification?"

create_survey "narrative_flow" "Cosmo Feedback: Mission Story Flow" \
  "Did the mission story pacing work for this session?" \
  "\"Great pacing\", \"Okay\", \"Too repetitive\"" \
  "What would make the narrative flow more engaging?"

create_survey "archive_unlock" "Cosmo Feedback: Archive Unlocks" \
  "Was unlocking a past mission worth the chip cost?" \
  "\"Yes\", \"Maybe\", \"No\"" \
  "What would make archive missions more useful?"

create_survey "discussion_flow" "Cosmo Feedback: Discussion Flow" \
  "How useful did the discussion area feel after playing?" \
  "\"Very useful\", \"Somewhat\", \"Not useful\"" \
  "What would make the discussion space more worth using?"

create_survey "streak_repair" "Cosmo Feedback: Streak Repair" \
  "Did the streak repair option feel fair?" \
  "\"Fair\", \"Borderline\", \"Not fair\"" \
  "What would make streak repair clearer or better?"

create_survey "insight_weather" "Cosmo Feedback: InSight Weather Desk" \
  "How clear was the weather anomaly puzzle?" \
  "\"Very clear\", \"Mostly clear\", \"Confusing\"" \
  "What would improve the InSight weather desk?"

echo
echo "Set these env vars in web runtime:"
echo "NEXT_PUBLIC_POSTHOG_SURVEY_PLANET_ID=<planet_transit id>"
echo "NEXT_PUBLIC_POSTHOG_SURVEY_NO_PLANET_ID=<planet_no_detection id>"
echo "NEXT_PUBLIC_POSTHOG_SURVEY_ASTEROID_ID=<asteroid_mapping id>"
echo "NEXT_PUBLIC_POSTHOG_SURVEY_MARS_ID=<mars_classification id>"
echo "NEXT_PUBLIC_POSTHOG_SURVEY_NARRATIVE_ID=<narrative_flow id>"
echo "NEXT_PUBLIC_POSTHOG_SURVEY_ARCHIVE_ID=<archive_unlock id>"
echo "NEXT_PUBLIC_POSTHOG_SURVEY_DISCUSS_ID=<discussion_flow id>"
echo "NEXT_PUBLIC_POSTHOG_SURVEY_STREAK_ID=<streak_repair id>"
echo "NEXT_PUBLIC_POSTHOG_SURVEY_INSIGHT_ID=<insight_weather id>"
