"use client";

import { VariantProvider, useVariant } from "@/components/landing/landing-variant-context";
import { LandingVariantSwitcher } from "@/components/landing/landing-variant-switcher";
import { LandingStyles } from "@/components/landing/landing-styles";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMasthead } from "@/components/landing/landing-masthead";
import { ReaderBriefingSection } from "@/components/landing/reader-briefing-section";
import { DailyLiveSection } from "@/components/landing/daily-live-section";

function LandingPageInner() {
  const { variant } = useVariant();

  return (
    <div className={`tx-variant-root tx-v-${variant} tx-live-first`}>
      <LandingStyles />
      <LandingMasthead />
      <DailyLiveSection />
      <ReaderBriefingSection />
      <LandingFooter />
      <LandingVariantSwitcher />
    </div>
  );
}

export default function LandingPage() {
  return (
    <VariantProvider>
      <LandingPageInner />
    </VariantProvider>
  );
}
