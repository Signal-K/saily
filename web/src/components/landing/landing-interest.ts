import posthog from "posthog-js";

export type InterestPayload = {
  kind: "briefing" | "notify";
  email?: string;
  puzzles?: string[];
  storyHooks?: string[];
  returnDrivers?: string[];
  note?: string;
};

function maskEmail(email?: string) {
  if (!email) return "";
  const [local = "", domain = ""] = email.split("@");
  const maskedLocal = local.length <= 2 ? `${local.slice(0, 1)}*` : `${local.slice(0, 2)}***${local.slice(-1)}`;
  return domain ? `${maskedLocal}@${domain}` : maskedLocal;
}

function logLandingInterest(message: string, data: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  console.info(`[landing-interest] ${message}`, {
    page: window.location.href,
    posthogLoaded: Boolean(posthog),
    ...data,
  });
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
  logLandingInterest("submitting email form", {
    kind: payload.kind,
    emailMasked: maskEmail(payload.email),
    hasEmail: Boolean(payload.email),
    selectedPuzzles: payload.puzzles?.length ?? 0,
  });

  const response = await fetch("/api/landing-interest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const responsePayload = await response.json().catch(() => null);
  logLandingInterest("API response received", {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    response: responsePayload,
  });

  if (!response.ok) {
    throw new Error(`Unable to submit interest (${response.status})`);
  }

  if (typeof window !== "undefined") {
    if (payload.email) {
      posthog.identify(payload.email.toLowerCase(), {
        email: payload.email,
        is_interest_signup: true,
      });
    }

    posthog.capture("daily_transit_landing_interest", {
      kind: payload.kind,
      email: payload.email,
      answered_count: (payload.puzzles?.length ?? 0) + (payload.storyHooks?.length ?? 0) + (payload.returnDrivers?.length ?? 0),
      has_email: Boolean(payload.email),
    });

    logLandingInterest("client PostHog capture queued", {
      kind: payload.kind,
      hasEmail: Boolean(payload.email),
    });
  }

  return responsePayload;
}
