"use client";

import { LandingStyles } from "@/components/landing/landing-styles";
import { LandingFooter } from "@/components/landing/landing-footer";
import { ReaderBriefingSection } from "@/components/landing/reader-briefing-section";
import { DailyLiveSection } from "@/components/landing/daily-live-section";
import { ProjectSurvey } from "@/components/landing/project-survey";

export default function LandingPage() {
  return (
    <div className="tx-variant-root tx-v-editorial tx-live-first">
      <LandingStyles />
      <DailyLiveSection />
      <ReaderBriefingSection />
      <ProjectSurvey />
      <LandingFooter />
    </div>
  );
}
