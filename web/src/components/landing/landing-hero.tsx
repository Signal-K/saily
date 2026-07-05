"use client";

import { useState, FormEvent } from "react";
import { InterestSuccessNote, Kicker } from "@/components/landing/landing-shared";
import { submitInterest } from "@/components/landing/landing-interest";
import { useVariant, type VariantId } from "@/components/landing/landing-variant-context";

type HeroContent = {
  kicker: string;
  titleLine1: string;
  titleLine2: string;
  titleItalic?: boolean;
  lede: string;
  tag1: string;
  tag2: string;
  tag3: string;
  consoleTitle: string;
  consoleStat: string;
  consoleDarkTitle: string;
  consoleDarkBody: string;
  ctaLabel: string;
  inputPlaceholder: string;
};

const HERO_CONTENT: Record<VariantId, HeroContent> = {
  editorial: {
    kicker: "The Universe in Play · Star Sailors",
    titleLine1: "Star",
    titleLine2: "Sailors",
    titleItalic: true,
    lede: "A collection of citizen-science games and interactive dispatches. From hunting exoplanets to classifying coral reefs, we turn real scientific data into meaningful play.",
    tag1: "Citizen Science",
    tag2: "Interactive Data",
    tag3: "Real Discoveries",
    consoleTitle: "Discoveries",
    consoleStat: "Active",
    consoleDarkTitle: "Star Sailors Hub",
    consoleDarkBody: "We are building a unified home for all Star Sailors experiences. Sign up for early access and updates.",
    ctaLabel: "Join Mission",
    inputPlaceholder: "Enter your email for launch updates",
  },
  "deep-space": {
    kicker: "Beyond the Known · Star Sailors",
    titleLine1: "Into",
    titleLine2: "the Dark",
    titleItalic: false,
    lede: "Humanity's next chapter is written in starlight. Hunt real exoplanet signals in telescope data, trace stellar patterns across sectors, and join a crew where your observations become permanent history.",
    tag1: "Exoplanet Hunting",
    tag2: "Signal Analysis",
    tag3: "Deep Field Data",
    consoleTitle: "Active Signals",
    consoleStat: "Scanning",
    consoleDarkTitle: "Sector 7-G",
    consoleDarkBody: "New lightcurve data incoming. Transit candidates awaiting classification. Your eyes on the data make the difference.",
    ctaLabel: "Enter the Dark",
    inputPlaceholder: "Your email · Receive mission briefings",
  },
  solar: {
    kicker: "Chase the Light · Star Sailors",
    titleLine1: "Follow",
    titleLine2: "the Stars",
    titleItalic: true,
    lede: "From ancient navigators reading constellations by firelight to today's planet hunters poring over telescope feeds — curiosity is humanity's oldest instrument. Your journey into real science begins here.",
    tag1: "Wonder & Discovery",
    tag2: "Guided Exploration",
    tag3: "Living Atlas",
    consoleTitle: "Active Missions",
    consoleStat: "Open",
    consoleDarkTitle: "The Next Horizon",
    consoleDarkBody: "Every great voyage begins with a single bearing. Join us and be among the first to see what the data reveals.",
    ctaLabel: "Start Exploring",
    inputPlaceholder: "Your email · First to know",
  },
  minimal: {
    kicker: "Star Sailors — Citizen Science Initiative",
    titleLine1: "Science.",
    titleLine2: "Play.",
    titleItalic: false,
    lede: "We transform peer-reviewed astronomical datasets into interactive experiences. Participation is open. Methodology is transparent. Discoveries are real and credited.",
    tag1: "Peer-reviewed data",
    tag2: "Open participation",
    tag3: "Credited results",
    consoleTitle: "Data integrity",
    consoleStat: "Verified",
    consoleDarkTitle: "Research protocol",
    consoleDarkBody: "Classification consensus: 3 independent observers required. All records are public. Your contribution is permanent.",
    ctaLabel: "Register interest",
    inputPlaceholder: "Email address",
  },
};

export function LandingHero() {
  const { variant } = useVariant();
  const content = HERO_CONTENT[variant];
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || state === "sending") return;
    setState("sending");
    try {
      await submitInterest({ kind: "notify", email: email.trim() });
      setState("sent");
      setEmail("");
    } catch (error) {
      console.error("[landing-interest] hero signup failed", error);
      setState("error");
    }
  }

  return (
    <section className="tx-hero-public" aria-label="Star Sailors ecosystem">
      <div>
        <Kicker>{content.kicker}</Kicker>
        <h1 className="tx-hero-title">
          {content.titleLine1}{" "}
          {content.titleItalic ? <em>{content.titleLine2}</em> : content.titleLine2}
        </h1>
        <p className="tx-lede">{content.lede}</p>

        {state === "sent" ? (
          <InterestSuccessNote>We&apos;ll notify you of new missions.</InterestSuccessNote>
        ) : (
          <form className="tx-hero-signup" onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={content.inputPlaceholder}
              required
              disabled={state === "sending"}
              className="tx-hero-input"
            />
            <button type="submit" className="button button-primary" disabled={state === "sending"}>
              {state === "sending" ? "Sending..." : content.ctaLabel}
            </button>
            {state === "error" && (
              <p className="tx-form-note is-error">Something went wrong. Please try again.</p>
            )}
          </form>
        )}

        <div className="tx-tag-row" aria-label="Star Sailors features">
          <span className="tx-tag">{content.tag1}</span>
          <span className="tx-tag">{content.tag2}</span>
          <span className="tx-tag">{content.tag3}</span>
        </div>
      </div>

      <aside className="tx-console" aria-label="Ecosystem status">
        <div className="tx-console-card">
          <div className="tx-console-head">
            <span>{content.consoleTitle}</span>
            <span className="tx-console-value">{content.consoleStat}</span>
          </div>
          <div className="tx-bars" aria-hidden>
            {[28, 46, 38, 58, 42, 68].map((height, i) => (
              <span key={i} style={{ height }} />
            ))}
          </div>
          <div className="tx-console-head">
            <span>Data Feeds</span>
            <span className="tx-console-value">Live</span>
          </div>
        </div>
        <div className="tx-console-card is-dark">
          <div className="tx-console-head">
            <span>{content.consoleDarkTitle}</span>
            <span>Coming Soon</span>
          </div>
          <p>
            {content.consoleDarkBody}
          </p>
        </div>
      </aside>
    </section>
  );
}
