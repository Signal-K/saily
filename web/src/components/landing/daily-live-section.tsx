"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Kicker, StatusPill } from "@/components/landing/landing-shared";

type LocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; latitude: number; longitude: number }
  | { status: "error"; message: string };

type BriefingEvent = {
  title: string;
  body: string;
  source: string;
  href: string;
  tag: string;
};

type Briefing = {
  dateLabel: string;
  moonPhase: string;
  apod: {
    copyright: string | null;
    date: string | null;
    explanation: string | null;
    hdUrl: string | null;
    imageUrl: string | null;
    mediaType: string | null;
    sourceUrl: string;
    title: string;
    videoUrl: string | null;
  } | null;
  events: BriefingEvent[];
  network: Array<{ label: string; value: number }>;
};

type BriefingState =
  | { status: "loading"; data: Briefing }
  | { status: "ready"; data: Briefing }
  | { status: "error"; data: Briefing };

const fallbackBriefing: Briefing = {
  dateLabel: new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }),
  moonPhase: "Daily sky",
  apod: null,
  events: [
    {
      title: "Moon and bright planet watch",
      body: "Check the sky after dusk and use the Moon as a brightness guide before choosing faint targets.",
      source: "Daily Transit fallback",
      href: "https://science.nasa.gov/skywatching/",
      tag: "skywatch",
    },
    {
      title: "Spot the Station pass check",
      body: "ISS passes are easiest to see around dawn or dusk. Check today's pass window before heading outside.",
      source: "NASA Spot the Station",
      href: "https://spotthestation.nasa.gov/",
      tag: "satellite",
    },
  ],
  // Real zero, not a fabricated placeholder count — filled in once
  // /api/daily-briefing responds with real PocketBase totals.
  network: [],
};

function getHemisphereCopy(location: LocationState) {
  if (location.status !== "ready") {
    return {
      body: "Share location to tune this to your hemisphere and observing window.",
      label: "Not tailored",
    };
  }

  const direction = location.latitude < 0 ? "north-east to overhead" : "south-east to overhead";

  return {
    body: `Tuned for ${Math.abs(location.latitude).toFixed(1)}deg ${location.latitude < 0 ? "S" : "N"}: start ${direction} after dusk.`,
    label: "Location tuned",
  };
}

function briefingUrl(latitude?: number, longitude?: number) {
  if (typeof latitude !== "number" || typeof longitude !== "number") return "/api/daily-briefing";
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
  });
  return `/api/daily-briefing?${params.toString()}`;
}

export function DailyLiveSection() {
  const [location, setLocation] = useState<LocationState>({ status: "idle" });
  const [briefing, setBriefing] = useState<BriefingState>({ status: "loading", data: fallbackBriefing });
  const locationCopy = getHemisphereCopy(location);
  const leadEvent = briefing.data.events[0] ?? fallbackBriefing.events[0];
  const otherEvents = briefing.data.events.slice(1, 4);
  const sourceLabel = briefing.status === "loading" ? "Updating" : briefing.status === "error" ? "Cached fallback" : "Live sources";

  const apodDescription = useMemo(() => {
    const text = briefing.data.apod?.explanation;
    if (!text) return "NASA's daily image will appear here when the source responds.";
    return text.length > 180 ? `${text.slice(0, 177)}...` : text;
  }, [briefing.data.apod?.explanation]);

  const loadBriefing = useCallback(async (latitude?: number, longitude?: number) => {
    setBriefing((current) => ({ status: "loading", data: current.data }));
    try {
      const response = await fetch(briefingUrl(latitude, longitude), { cache: "no-store" });
      if (!response.ok) throw new Error("Briefing request failed");
      const data = (await response.json()) as Briefing;
      setBriefing({ status: "ready", data });
    } catch {
      setBriefing((current) => ({ status: "error", data: current.data }));
    }
  }, []);

  useEffect(() => {
    void loadBriefing();
  }, [loadBriefing]);

  function requestLocation() {
    if (!("geolocation" in navigator)) {
      setLocation({ status: "error", message: "Location unavailable" });
      return;
    }

    setLocation({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          status: "ready" as const,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(nextLocation);
        void loadBriefing(nextLocation.latitude, nextLocation.longitude);
      },
      () => setLocation({ status: "error", message: "Location permission not granted" }),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 86400000 },
    );
  }

  return (
    <main id="daily" className="tx-section tx-live" aria-label="Daily automated astronomy briefing">
      <div className="tx-live-head">
        <div>
          <Kicker>The Daily Transit</Kicker>
          <h1>{briefing.data.dateLabel}</h1>
          <p>
            Today&apos;s automated astronomy front page: NASA image, sky events, local mode, and Star Sailors activity.
          </p>
        </div>
        <div className="tx-live-status">
          <StatusPill>{briefing.data.moonPhase}</StatusPill>
          <span>{sourceLabel}</span>
        </div>
      </div>

      <div className="tx-live-grid">
        <article className="tx-live-apod">
          {briefing.data.apod?.imageUrl ? (
            <a className="tx-live-image-wrap" href={briefing.data.apod.hdUrl ?? briefing.data.apod.sourceUrl} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="tx-live-image" src={briefing.data.apod.imageUrl} alt={briefing.data.apod.title} />
            </a>
          ) : (
            <a className="tx-live-image-wrap is-empty" href="https://apod.nasa.gov/apod/astropix.html" target="_blank" rel="noreferrer">
              <span>APOD</span>
            </a>
          )}
          <div className="tx-live-apod-copy">
            <Kicker>NASA Astronomy Picture of the Day</Kicker>
            <h2>{briefing.data.apod?.title ?? "Image loading"}</h2>
            <p>{apodDescription}</p>
            <a className="tx-live-link" href={briefing.data.apod?.sourceUrl ?? "https://apod.nasa.gov/apod/astropix.html"} target="_blank" rel="noreferrer">
              Open source
            </a>
          </div>
        </article>

        <aside className="tx-live-side">
          <article className="tx-live-card tx-live-now">
            <Kicker>Today&apos;s watch</Kicker>
            <h2>{leadEvent.title}</h2>
            <p>{leadEvent.body}</p>
            <a href={leadEvent.href} target="_blank" rel="noreferrer">
              {leadEvent.source}
            </a>
          </article>

          <article className="tx-live-card tx-live-local">
            <div>
              <Kicker>Local mode</Kicker>
              <p>{location.status === "error" ? location.message : locationCopy.body}</p>
            </div>
            <button className="tx-live-button" type="button" onClick={requestLocation} disabled={location.status === "loading"}>
              {location.status === "loading" ? "Checking..." : locationCopy.label}
            </button>
          </article>
        </aside>
      </div>

      <div className="tx-live-bottom">
        <section className="tx-live-events" aria-label="Other astronomy events">
          <Kicker>Other events</Kicker>
          <div className="tx-live-event-list">
            {otherEvents.map((event) => (
              <a className="tx-live-event" href={event.href} target="_blank" rel="noreferrer" key={event.title}>
                <span>{event.tag}</span>
                <strong>{event.title}</strong>
                <p>{event.body}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="tx-live-network" aria-label="Star Sailors network activity">
          <Kicker>Star Sailors network</Kicker>
          {briefing.data.network.length > 0 ? (
            <div className="tx-live-ticker">
              {briefing.data.network.map((item) => (
                <div className="tx-live-ticker-item" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">Loading real activity counts…</p>
          )}
        </section>
      </div>
    </main>
  );
}
