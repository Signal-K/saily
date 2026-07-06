"use client";

import { LandingStyles } from "@/components/landing/landing-styles";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMasthead } from "@/components/landing/landing-masthead";
import { ReaderBriefingSection } from "@/components/landing/reader-briefing-section";
import { DailyLiveSection } from "@/components/landing/daily-live-section";

export default function LandingPage() {
  return (
    <div className="tx-variant-root tx-v-editorial tx-live-first">
      <LandingStyles />
      <LandingMasthead />
      <DailyLiveSection />
      <ReaderBriefingSection />
      <LandingFooter />
    </div>
  );
}
