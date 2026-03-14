"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { DisplaySurveyType } from "posthog-js/lib/src/posthog-surveys-types";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { dequeueSurveyTrigger, markSurveyShown, type SurveyTriggerSource } from "@/lib/posthog/survey-queue";

function getPosthogHost() {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";
}

function getPosthogKey() {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() || "";
}

export function PostHogRuntime() {
  const pathname = usePathname();

  function surveyIdForSource(source: SurveyTriggerSource) {
    const map: Record<SurveyTriggerSource, string> = {
      planet_transit: process.env.NEXT_PUBLIC_POSTHOG_SURVEY_PLANET_ID?.trim() || "",
      planet_no_detection: process.env.NEXT_PUBLIC_POSTHOG_SURVEY_NO_PLANET_ID?.trim() || "",
      asteroid_mapping: process.env.NEXT_PUBLIC_POSTHOG_SURVEY_ASTEROID_ID?.trim() || "",
      mars_classification: process.env.NEXT_PUBLIC_POSTHOG_SURVEY_MARS_ID?.trim() || "",
      narrative_flow: process.env.NEXT_PUBLIC_POSTHOG_SURVEY_NARRATIVE_ID?.trim() || "",
    };
    return map[source] || "";
  }

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

    const supabase = createSupabaseClient();
    void supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      posthog.identify(data.user.id, {
        email: data.user.email,
      });
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) return;
      posthog.identify(session.user.id, {
        email: session.user.email,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    const key = getPosthogKey();
    if (!key) return;

    const queued = dequeueSurveyTrigger();
    if (!queued) return;

    const properties = {
      source: queued.source,
      app_version: queued.version,
      game_date: queued.gameDate,
      score: queued.score,
      user_id: posthog.get_distinct_id(),
    };

    posthog.capture("mechanic_feedback_triggered", properties);
    const surveyId = surveyIdForSource(queued.source);
    if (!surveyId) return;

    posthog.surveys.displaySurvey(surveyId, {
      displayType: DisplaySurveyType.Popover,
      ignoreConditions: false,
      ignoreDelay: false,
      properties,
    });
    markSurveyShown(queued.source);
  }, [pathname]);

  return null;
}
