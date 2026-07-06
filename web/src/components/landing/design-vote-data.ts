export type VariantId = "editorial" | "deep-space" | "solar" | "minimal";

export type VariantOption = {
  id: VariantId;
  label: string;
  tagline: string;
  icon: string;
};

export const VARIANT_OPTIONS: VariantOption[] = [
  { id: "editorial", label: "Editorial", tagline: "Newspaper grid · Professional", icon: "📰" },
  { id: "deep-space", label: "Cosmic", tagline: "Dark cosmos · Mysterious", icon: "🌌" },
  { id: "solar", label: "Solar", tagline: "Warm amber · Adventurous", icon: "☀️" },
  { id: "minimal", label: "Minimal", tagline: "Black & white · Scientific", icon: "◻" },
];

export const VARIANT_LABELS: Record<string, string> = Object.fromEntries(
  VARIANT_OPTIONS.map(v => [v.id, `${v.icon} ${v.label}`])
);
