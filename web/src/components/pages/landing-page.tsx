"use client";

import { CitizenScienceSection } from "@/components/landing/citizen-science-section";
import { GamesSection } from "@/components/landing/games-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingStyles } from "@/components/landing/landing-styles";
import { NewsroomSection } from "@/components/landing/newsroom-section";
import { NotifySection } from "@/components/landing/notify-section";
import { ReaderBriefingSection } from "@/components/landing/reader-briefing-section";
import { TeamSection } from "@/components/landing/team-section";

export default function LandingPage() {
  return (
    <>
      <LandingStyles />
      <main id="top" className="tx-landing">
        <LandingHero />
        <ReaderBriefingSection />
        <CitizenScienceSection />
        <NewsroomSection />
        <GamesSection />
        <TeamSection />
        <NotifySection />
        <LandingFooter />
      </main>
    </>
  );
}
