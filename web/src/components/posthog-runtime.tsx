"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { DisplaySurveyType } from "posthog-js/lib/src/posthog-surveys-types";
import { dequeueExitSurvey } from "@/lib/posthog/exit-survey";

function getPosthogHost() {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";
}

function getPosthogKey() {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() || "";
}

export function PostHogRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    const key = getPosthogKey();
    if (!key) return;

    posthog.init(key, {
      api_host: getPosthogHost(),
      persistence: "localStorage+cookie",
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: true,
    });
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    const key = getPosthogKey();
    if (!key) return;

    const queued = dequeueExitSurvey();
    if (!queued) return;

    const properties = {
      source: queued.source,
      app_version: queued.version,
      game_date: queued.gameDate,
      score: queued.score,
    };

    posthog.capture("exit_survey_triggered", properties);

    const surveyId = process.env.NEXT_PUBLIC_POSTHOG_EXIT_SURVEY_ID?.trim();
    if (!surveyId) return;

    posthog.surveys.displaySurvey(surveyId, {
      displayType: DisplaySurveyType.Popover,
      ignoreConditions: false,
      ignoreDelay: false,
      properties,
    });
  }, [pathname]);

  return null;
}
