"use client";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingStyles } from "@/components/landing/landing-styles";
import { ProjectSurvey } from "@/components/landing/project-survey";

export default function LandingPage() {
  return (
    <>
      <LandingStyles />
      <main id="top" className="tx-landing">
        <LandingHero />
        <ProjectSurvey />
        <LandingFooter />
      </main>
    </>
  );
}
