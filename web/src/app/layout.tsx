import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/react";
import { SWRegister } from "@/components/sw-register";
import { BreadcrumbsNav } from "@/components/breadcrumbs-nav";
import { DailyTransitMasthead } from "@/components/daily-transit-masthead";
import { BreakingNewsTicker } from "@/components/breaking-news-ticker";
import { EcosystemBar } from "@/components/ecosystem-bar";
import { PostHogRuntime } from "@/components/posthog-runtime";
import "./globals.css";

const THEME_COOKIE = "cosmo_theme";

type Theme = "light" | "dark";
type TimePeriod = "dawn" | "morning" | "afternoon" | "evening" | "night";

function normalizeTheme(value: string | undefined): Theme {
  return value === "dark" ? "dark" : "light";
}

function getTimePeriod(): TimePeriod {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export const metadata: Metadata = {
  title: "The Daily Transit",
  description: "Citizen Science Daily — hunt planets and classify Mars",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Daily Transit",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5ee" },
    { media: "(prefers-color-scheme: dark)", color: "#111316" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialTheme = normalizeTheme(cookieStore.get(THEME_COOKIE)?.value);
  const timePeriod = getTimePeriod();

  return (
    <html
      lang="en"
      data-theme={initialTheme}
      data-period={timePeriod}
    >
      <body>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .dt-page-shell {
                width: min(var(--spacing-content-max, 1180px), calc(100% - 3rem));
                margin-inline: auto;
                padding: 1rem 0 5rem;
              }

              .breadcrumbs-shell {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                margin: 0 0 1rem;
                border: 1px solid var(--rule, #d9dde3);
                border-top: 3px double var(--ink, #16181c);
                background: var(--bg-surface, #fff);
                padding: 0.65rem 0.8rem;
                flex-wrap: wrap;
              }

              .breadcrumbs-shell:empty {
                display: none;
              }

              .discovery-headline {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                min-width: 0;
                color: inherit;
                text-decoration: none;
              }

              .discovery-headline:hover .discovery-headline-text {
                text-decoration: underline;
                text-underline-offset: 3px;
              }

              .discovery-headline-dot {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: var(--primary, #0a82b3);
                flex: none;
              }

              .discovery-headline-label {
                font-family: var(--font-data, ui-monospace, monospace);
                font-size: 0.68rem;
                font-weight: 700;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                color: var(--primary, #0a82b3);
                flex: none;
              }

              .discovery-headline-text {
                font-family: var(--font-display, "Turret Road", Georgia, serif);
                font-size: 0.95rem;
                color: var(--ink, #16181c);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                min-width: 0;
              }

              .dt-breaking-news {
                display: flex;
                align-items: center;
                gap: 1.5rem;
                flex-wrap: wrap;
                width: min(var(--spacing-content-max, 1180px), calc(100% - 2rem));
                margin-inline: auto;
                padding: 0.5rem 0;
                border-bottom: 1px solid var(--rule, #d9dde3);
              }

              .dt-breaking-news-item {
                min-width: 0;
                max-width: 100%;
              }

              .breadcrumbs-back {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                border: 0;
                background: transparent;
                color: var(--ink, #16181c);
                font-family: var(--font-data, ui-monospace, monospace);
                font-size: 0.68rem;
                font-weight: 700;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                cursor: pointer;
              }

              .breadcrumbs-nav ol {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 0.4rem;
                margin: 0;
                padding: 0;
                list-style: none;
              }

              .breadcrumbs-nav li {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                color: var(--fg-muted, #5b636f);
                font-family: var(--font-data, ui-monospace, monospace);
                font-size: 0.68rem;
                font-weight: 700;
                letter-spacing: 0.12em;
                text-transform: uppercase;
              }

              .breadcrumbs-nav li + li::before {
                content: "/";
                color: var(--fg-faded, #9099a4);
              }

              .breadcrumbs-nav a {
                color: var(--fg-muted, #5b636f);
                text-decoration: none;
              }

              .breadcrumbs-nav a:hover {
                color: var(--primary, #0a82b3);
                text-decoration: underline;
                text-underline-offset: 3px;
              }

              .breadcrumbs-nav .is-current {
                color: var(--primary, #0a82b3);
              }

              .breadcrumbs-nav .is-muted {
                color: var(--fg-faded, #9099a4);
              }

              .panel,
              .card {
                border: 1px solid var(--rule, #d9dde3);
                background: var(--bg-surface, #fff);
                padding: clamp(1rem, 3vw, 1.5rem);
                box-shadow: var(--shadow-card, 0 1px 0 #d9dde3, 0 8px 24px -12px rgba(7, 41, 56, 0.18));
              }

              .panel > h1:first-child,
              .panel h1 {
                margin-top: 0;
              }

              .calendar-page-shell,
              .search-page-shell {
                display: grid;
                gap: 1rem;
                width: 100%;
              }

              .calendar-page-shell > .panel:first-child,
              .search-page-header,
              .search-empty-state,
              .search-error-panel,
              .search-section {
                border-top: 3px double var(--ink, #16181c);
              }

              .calendar-page-header,
              .search-page-header {
                display: flex;
                align-items: end;
                justify-content: space-between;
                gap: 1rem;
              }

              .calendar-page-toolbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                border-bottom: 1px solid var(--rule, #d9dde3);
                padding-bottom: 1rem;
                margin-bottom: 1rem;
              }

              .calendar-page-toolbar-right {
                display: flex;
                gap: 0.5rem;
              }

              .calendar-page-month {
                margin: 0;
                font-family: var(--font-display, Georgia, serif);
                font-size: clamp(1.4rem, 3vw, 2rem);
                font-weight: 700;
              }

              .calendar-page-nav-btn {
                border: 1px solid var(--ink, #16181c);
                background: var(--bg-surface, #fff);
                color: var(--ink, #16181c);
                padding: 0.5rem 0.75rem;
                font-family: var(--font-data, ui-monospace, monospace);
                font-size: 0.68rem;
                font-weight: 700;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                text-decoration: none;
              }

              .calendar-page-nav-btn:hover {
                border-color: var(--primary, #0a82b3);
                color: var(--primary, #0a82b3);
                text-decoration: none;
              }

              .calendar-page-nav-subtle {
                border-color: var(--rule, #d9dde3);
                color: var(--fg-muted, #5b636f);
              }

              .calendar-page-weekdays,
              .calendar-page-grid {
                display: grid;
                grid-template-columns: repeat(7, minmax(0, 1fr));
                gap: 0.35rem;
              }

              .calendar-page-weekdays {
                margin-bottom: 0.35rem;
              }

              .calendar-page-weekdays span {
                color: var(--fg-muted, #5b636f);
                font-family: var(--font-data, ui-monospace, monospace);
                font-size: 0.65rem;
                font-weight: 700;
                letter-spacing: 0.12em;
                text-align: center;
                text-transform: uppercase;
              }

              .calendar-page-cell {
                display: grid;
                min-height: 72px;
                place-items: center;
                border: 1px solid var(--rule, #d9dde3);
                background: var(--bg-surface-warm, #f4efe6);
                color: var(--ink, #16181c);
                font-family: var(--font-data, ui-monospace, monospace);
                font-weight: 700;
                text-decoration: none;
              }

              .calendar-page-cell.is-empty {
                border-color: transparent;
                background: transparent;
              }

              .calendar-page-cell.is-done {
                border-color: var(--color-moss-400, #5e944a);
                background: color-mix(in oklab, var(--color-moss-200, #c9dfb8) 40%, white);
              }

              .calendar-page-cell.is-partial {
                border-color: var(--color-solar-400, #f1a417);
                background: var(--color-solar-50, #fff5dc);
              }

              .calendar-page-cell:hover {
                border-color: var(--primary, #0a82b3);
                color: var(--primary, #0a82b3);
                text-decoration: none;
              }

              .calendar-page-legend {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                margin-top: 1rem;
                color: var(--fg-muted, #5b636f);
                font-family: var(--font-data, ui-monospace, monospace);
                font-size: 0.7rem;
                letter-spacing: 0.08em;
                text-transform: uppercase;
              }

              .legend-item {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
              }

              .legend-item .dot {
                width: 0.7rem;
                height: 0.7rem;
                border: 1px solid var(--rule, #d9dde3);
                background: var(--bg-surface-warm, #f4efe6);
              }

              .legend-item .dot.done { background: var(--color-moss-400, #5e944a); }
              .legend-item .dot.partial { background: var(--color-solar-400, #f1a417); }

              @media (max-width: 760px) {
                .dt-page-shell {
                  width: min(100% - 1rem, var(--spacing-content-max, 1180px));
                }

                .breadcrumbs-shell,
                .calendar-page-toolbar,
                .calendar-page-header,
                .search-page-header {
                  align-items: flex-start;
                  flex-direction: column;
                }

                .calendar-page-cell {
                  min-height: 48px;
                }
              }

              @media (max-width: 380px) {
                .search-page-header h1 {
                  overflow-wrap: anywhere;
                }

                .search-page-header .muted,
                .search-empty-state .muted,
                .search-error-panel .muted {
                  font-size: 0.9rem;
                  line-height: 1.45;
                }

                .search-meta-row {
                  grid-template-columns: 1fr;
                  gap: 0.5rem;
                }

                .search-meta-pill {
                  min-width: 0;
                }

                .calendar-page-weekdays,
                .calendar-page-grid {
                  gap: 0.2rem;
                }

                .calendar-page-cell {
                  min-height: 38px;
                  font-size: 0.85rem;
                }

                .calendar-page-toolbar-right {
                  gap: 0.35rem;
                }

                .calendar-page-nav-btn {
                  padding: 0.4rem 0.55rem;
                  font-size: 0.6rem;
                }

                .calendar-page-legend {
                  gap: 0.6rem;
                }
              }
            `,
          }}
        />
        <PostHogRuntime />
        <SWRegister />

        <DailyTransitMasthead initialTheme={initialTheme} />
        <BreakingNewsTicker />
        <EcosystemBar />

        <main className="dt-page-shell">
          <BreadcrumbsNav />
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  );
}
