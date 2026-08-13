"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { DisplaySurveyType } from "posthog-js/lib/src/posthog-surveys-types";
import { Kicker } from "@/components/landing/landing-shared";

// Live PostHog survey 019ffa0b-21f7-0000-2799-28882f7430ad (project 199773).
// Kept public because a PostHog survey is rendered in the browser; this is an
// identifier, not a credential.
const TERRAIN_LAB_SURVEY_ID = "019ffa0b-21f7-0000-2799-28882f7430ad";

export function TerrainLabSurvey() {
  const [opened, setOpened] = useState(false);

  function openSurvey() {
    posthog.capture("rail_atlas_terrain_survey_opened", {
      surface: "daily_transit",
      experiment: "procedural_terrain_lab",
    });
    posthog.surveys.displaySurvey(TERRAIN_LAB_SURVEY_ID, {
      displayType: DisplaySurveyType.Popover,
      ignoreConditions: true,
      ignoreDelay: true,
      properties: { surface: "daily_transit", experiment: "procedural_terrain_lab" },
    });
    setOpened(true);
  }

  return (
    <section id="rail-atlas-terrain" className="tx-section tx-survey">
      <div>
        <Kicker>Rail Atlas field note</Kicker>
        <h2>Help us choose the next landscape.</h2>
        <p style={{ margin: "0.5rem 0 1.5rem", color: "var(--fg-muted, #5b636f)", maxWidth: "58ch", lineHeight: "1.6" }}>
          Rail Atlas is testing procedural countryside with animated water, ground texture and foliage. Tell us which terrain and rail-side details would make you want to keep exploring.
        </p>
      </div>
      <div className="tx-question" style={{ maxWidth: "42rem" }}>
        <h3>Two quick questions</h3>
        <p>The survey opens only when you choose it. It never appears over a game.</p>
        <button className="button button-primary" type="button" onClick={openSurvey}>
          {opened ? "Survey opened" : "Share terrain preferences"}
        </button>
      </div>
    </section>
  );
}
