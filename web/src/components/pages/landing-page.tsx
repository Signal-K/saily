"use client";

import { VariantProvider, useVariant } from "@/components/landing/landing-variant-context";
import { LandingVariantSwitcher } from "@/components/landing/landing-variant-switcher";
import { LandingStyles } from "@/components/landing/landing-styles";
import { LandingFooter } from "@/components/landing/landing-footer";
import { ReaderBriefingSection } from "@/components/landing/reader-briefing-section";
import { VariantEditorial } from "@/components/landing/variant-editorial";
import { VariantCosmic } from "@/components/landing/variant-cosmic";
import { VariantSolar } from "@/components/landing/variant-solar";
import { VariantMinimal } from "@/components/landing/variant-minimal";

function LandingPageInner() {
  const { variant } = useVariant();

  return (
    <div className={`tx-variant-root tx-v-${variant}`}>
      <LandingStyles />
      {variant === "editorial" && <VariantEditorial />}
      {variant === "deep-space" && <VariantCosmic />}
      {variant === "solar" && <VariantSolar />}
      {variant === "minimal" && <VariantMinimal />}
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
