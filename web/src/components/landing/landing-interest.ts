export type InterestPayload = {
  kind: "briefing" | "notify";
  email?: string;
  puzzles?: string[];
  storyHooks?: string[];
  returnDrivers?: string[];
  note?: string;
};

declare global {
  interface Window {
    posthog?: {
      capture?: (eventName: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function generateCallsign() {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return `PV-${1000 + (values[0] % 9000)}`;
  }
  return `PV-${1000 + (Date.now() % 9000)}`;
}

export async function submitInterest(payload: InterestPayload) {
  const response = await fetch("/api/landing-interest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to submit interest");
  }

  if (typeof window !== "undefined" && window.posthog?.capture) {
    window.posthog.capture("daily_transit_landing_interest", {
      kind: payload.kind,
      answered_count: (payload.puzzles?.length ?? 0) + (payload.storyHooks?.length ?? 0) + (payload.returnDrivers?.length ?? 0),
      has_email: Boolean(payload.email),
    });
  }

  return response.json();
}
