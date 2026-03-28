"use client";

import { track } from "@vercel/analytics";

type EventProps = Record<string, string | number | boolean | undefined>;

export function trackGameplayEvent(event: string, properties?: EventProps) {
  try {
    track(event, properties);
  } catch {
    // Non-fatal analytics path.
  }
}
