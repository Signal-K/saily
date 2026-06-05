"use client";

import { GamesSection } from "@/components/landing/games-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingStyles } from "@/components/landing/landing-styles";
import { NotifySection } from "@/components/landing/notify-section";

export default function LandingPage() {
  return (
    <>
      <LandingStyles />
      <main id="top" className="tx-landing">
        <LandingHero />
        <GamesSection />
        <NotifySection />
        <LandingFooter />
      </main>
    </>
  );
}
