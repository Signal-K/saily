"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type VariantId = "editorial" | "deep-space" | "solar" | "minimal";

export type Variant = {
  id: VariantId;
  label: string;
  tagline: string;
  bodyBg: {
    light: string;
    dark: string;
  };
};

export const VARIANTS: Variant[] = [
  {
    id: "editorial",
    label: "Editorial",
    tagline: "Newspaper grid · Professional",
    bodyBg: { light: "#f7f5ee", dark: "#111316" },
  },
  {
    id: "deep-space",
    label: "Cosmic",
    tagline: "Dark cosmos · Mysterious",
    bodyBg: { light: "#eef7ff", dark: "#06061a" },
  },
  {
    id: "solar",
    label: "Solar",
    tagline: "Warm amber · Adventurous",
    bodyBg: { light: "#fffbf2", dark: "#111316" },
  },
  {
    id: "minimal",
    label: "Minimal",
    tagline: "Black & white · Scientific",
    bodyBg: { light: "#ffffff", dark: "#111316" },
  },
];

type VariantContextType = {
  variant: VariantId;
  setVariant: (v: VariantId) => void;
};

const VariantContext = createContext<VariantContextType>({
  variant: "editorial",
  setVariant: () => {},
});

export function VariantProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<VariantId>("editorial");

  useEffect(() => {
    function syncBodyTheme() {
      const found = VARIANTS.find((v) => v.id === variant);
      const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      if (found) {
        document.body.style.background = found.bodyBg[theme];
        document.body.style.color = theme === "dark" || variant === "deep-space" ? "#e2e8f0" : "";
      }
    }

    syncBodyTheme();
    const observer = new MutationObserver(syncBodyTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      observer.disconnect();
      document.body.style.background = "";
      document.body.style.color = "";
    };
  }, [variant]);

  return (
    <VariantContext.Provider value={{ variant, setVariant }}>
      {children}
    </VariantContext.Provider>
  );
}

export function useVariant() {
  return useContext(VariantContext);
}
