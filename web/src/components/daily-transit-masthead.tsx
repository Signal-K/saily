"use client";

import Image from "next/image";
import Link from "next/link";
import { AuthStatus } from "@/components/auth-status";
import { HeaderSearch } from "@/components/header-search";
import { ThemeToggle } from "@/components/theme-toggle";

type Props = {
  initialTheme: "light" | "dark";
};

type MegaItem = {
  href: string;
  label: string;
  description: string;
  tone?: "science" | "puzzle" | "discover" | "community" | "streak" | "ink";
  status?: string;
};

const megaSections: Array<{
  label: string;
  href: string;
  badge?: string;
  columns: MegaItem[][];
}> = [
  {
    label: "Today",
    href: "/games/today",
    columns: [
      [
        { href: "/games/today", label: "Transit Spotting", description: "TESS lightcurves · daily mission", tone: "science", status: "Active" },
        { href: "/games/mars", label: "Water-Ice on Mars", description: "MRO tile classification", tone: "discover" },
      ],
      [
        { href: "/discuss", label: "Consensus Desk", description: "Compare field reports", tone: "community" },
        { href: "/calendar", label: "Edition Archive", description: "Replay previous missions", tone: "ink" },
      ],
    ],
  },
  {
    label: "Puzzles",
    href: "/games/today",
    badge: "+1",
    columns: [
      [
        { href: "/games/today", label: "Transit Scan", description: "Annotate repeating dips", tone: "science" },
        { href: "/calendar", label: "Mission Archive", description: "Replay previous editions", tone: "ink" },
      ],
      [
        { href: "/leaderboard", label: "Leaderboard", description: "Top personnel records", tone: "streak" },
        { href: "/chips", label: "Data Chips", description: "Balance and streak repair", tone: "puzzle" },
      ],
    ],
  },
  {
    label: "Discover",
    href: "/search",
    columns: [
      [
        { href: "/source/lightcurve", label: "Lightcurve Lab", description: "Raw telemetry viewer", tone: "science" },
        { href: "/postcards", label: "Postcards", description: "Share a discovery", tone: "discover" },
      ],
      [
        { href: "/discuss", label: "Field Notes", description: "Community research threads", tone: "community" },
        { href: "/profile", label: "Personnel File", description: "Progress, badges, history", tone: "ink" },
      ],
    ],
  },
  {
    label: "Progress",
    href: "/calendar",
    columns: [
      [
        { href: "/calendar", label: "All Editions", description: "Browse by mission date", tone: "ink" },
        { href: "/postcards", label: "Postcards", description: "Unlocked mission keepsakes", tone: "discover" },
      ],
      [
        { href: "/leaderboard", label: "Leaderboard", description: "Top personnel records", tone: "streak" },
        { href: "/profile", label: "Personnel File", description: "Progress, badges, history", tone: "ink" },
      ],
    ],
  },
];

function MegaIcon({ tone = "science" }: { tone?: MegaItem["tone"] }) {
  const glyphs = {
    science: "◎",
    puzzle: "◫",
    discover: "◌",
    community: "§",
    streak: "†",
    ink: "¶",
  };
  return <span className={`dt-mega-icon is-${tone}`} aria-hidden>{glyphs[tone]}</span>;
}

export function DailyTransitMasthead({ initialTheme }: Props) {
  return (
    <>
      <style jsx global>{`
        .dt-masthead {
          position: sticky;
          top: 0;
          z-index: 70;
          border-bottom: 3px double var(--ink, #16181c);
          background: color-mix(in oklab, var(--bg-surface, #fff) 96%, white);
          backdrop-filter: blur(10px);
        }

        .dt-masthead-top {
          display: grid;
          grid-template-columns: minmax(190px, auto) minmax(220px, 1fr) auto auto;
          align-items: center;
          gap: 0.75rem;
          width: min(var(--spacing-content-max, 1180px), calc(100% - 2rem));
          margin-inline: auto;
          padding: 0.6rem 0;
          border-bottom: 1px solid var(--rule, #d9dde3);
        }

        .dt-brand {
          display: inline-flex;
          align-items: center;
          min-width: 0;
          gap: 0.65rem;
          color: inherit;
          text-decoration: none;
        }

        .dt-brand:hover,
        .dt-nav-link:hover,
        .dt-mega-item:hover,
        .sign-in-pill:hover {
          text-decoration: none;
        }

        .dt-brand-mark {
          border: 1px solid var(--rule, #d9dde3);
          background: var(--bg-surface, #fff);
          flex: none;
        }

        .dt-brand-copy {
          display: grid;
          min-width: 0;
          gap: 0.1rem;
        }

        .dt-brand-name {
          font-family: var(--font-display, "Turret Road", Georgia, serif);
          font-size: clamp(1.05rem, 2vw, 1.35rem);
          font-weight: 700;
          line-height: 1;
          color: var(--ink, #16181c);
          white-space: nowrap;
        }

        .dt-brand-name em {
          color: var(--primary, #0a82b3);
          font-style: italic;
        }

        .dt-brand-sub {
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.56rem;
          font-weight: 500;
          line-height: 1.2;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--fg-faded, #9099a4);
          white-space: nowrap;
        }

        .header-search-wrap {
          position: relative;
          min-width: 0;
        }

        .header-search {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          min-width: 0;
          border: 1px solid var(--rule, #d9dde3);
          background: var(--bg-surface-warm, #f4efe6);
        }

        .header-search input {
          min-width: 0;
          border: 0;
          background: transparent;
          color: var(--ink, #16181c);
          padding: 0.62rem 0.75rem;
          outline: 0;
        }

        .header-search button,
        .header-search-all {
          border: 0;
          border-left: 1px solid var(--rule, #d9dde3);
          background: var(--primary, #0a82b3);
          color: #fff;
          padding: 0.65rem 0.9rem;
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.72rem;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .header-search-dropdown {
          position: absolute;
          left: 0;
          right: 0;
          top: calc(100% + 0.35rem);
          z-index: 90;
          border: 1px solid var(--ink, #16181c);
          background: var(--bg-surface, #fff);
          box-shadow: 0 16px 32px -18px rgba(7, 41, 56, 0.35);
        }

        .header-search-results {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .header-search-status,
        .header-search-result,
        .header-search-all {
          width: 100%;
          padding: 0.75rem 0.85rem;
        }

        .header-search-result {
          display: grid;
          gap: 0.2rem;
          border: 0;
          border-bottom: 1px solid var(--rule, #d9dde3);
          background: transparent;
          text-align: left;
          cursor: pointer;
        }

        .dt-ecosystem,
        .dt-nav-item,
        .profile-menu {
          position: relative;
        }

        .dt-ecosystem-trigger {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          border: 1px solid var(--ink, #16181c);
          background: var(--ink, #16181c);
          color: #fff;
          padding: 0.62rem 0.8rem;
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.62rem;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
        }

        .dt-led {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: var(--color-glacier-200, #a4d8ef);
          box-shadow: 0 0 7px var(--color-glacier-200, #a4d8ef);
        }

        .dt-actions {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          min-width: 0;
        }

        .dt-nav {
          position: relative;
          display: flex;
          align-items: stretch;
          width: min(var(--spacing-content-max, 1180px), calc(100% - 2rem));
          margin-inline: auto;
          overflow: visible;
        }

        .dt-nav-link {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.7rem 0.95rem;
          border-bottom: 2px solid transparent;
          color: var(--fg-muted, #5b636f);
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.72rem;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          text-decoration: none;
          white-space: nowrap;
        }

        .dt-nav-link:hover,
        .dt-nav-item:focus-within .dt-nav-link,
        .dt-nav-item:hover .dt-nav-link {
          border-bottom-color: var(--primary, #0a82b3);
          color: var(--primary, #0a82b3);
        }

        .dt-mega {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 95;
          display: none;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          width: min(560px, calc(100vw - 2rem));
          border: 1px solid var(--ink, #16181c);
          background: var(--bg-surface, #fff);
          box-shadow: 0 16px 32px -18px rgba(7, 41, 56, 0.35);
        }

        .dt-nav-item:hover .dt-mega,
        .dt-nav-item:focus-within .dt-mega,
        .dt-ecosystem:hover .dt-mega,
        .dt-ecosystem:focus-within .dt-mega {
          display: grid;
        }

        .dt-mega-ecosystem {
          right: 0;
          left: auto;
          top: calc(100% + 0.35rem);
        }

        .dt-mega-head {
          grid-column: 1 / -1;
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          border-bottom: 1px solid var(--rule, #d9dde3);
          background: var(--bg-surface-warm, #f4efe6);
          padding: 0.65rem 0.8rem;
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.62rem;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink, #16181c);
        }

        .dt-mega-head em {
          color: var(--primary, #0a82b3);
          font-style: normal;
        }

        .dt-mega-col {
          display: grid;
          align-content: start;
          gap: 0.15rem;
          padding: 0.65rem;
        }

        .dt-mega-col + .dt-mega-col {
          border-left: 1px solid var(--rule, #d9dde3);
        }

        .dt-mega-item {
          display: grid;
          grid-template-columns: 2rem minmax(0, 1fr);
          gap: 0.65rem;
          align-items: start;
          color: inherit;
          padding: 0.55rem;
          text-decoration: none;
        }

        .dt-mega-item:hover {
          background: var(--bg-surface-warm, #f4efe6);
        }

        .dt-mega-icon {
          display: grid;
          place-items: center;
          width: 2rem;
          height: 2rem;
          border: 1px solid var(--rule, #d9dde3);
          background: var(--primary-soft, #cfeaf6);
          color: var(--primary, #0a82b3);
          font-family: var(--font-data, ui-monospace, monospace);
          font-weight: 800;
        }

        .dt-mega-item strong {
          display: block;
          font-family: var(--font-display, "Turret Road", Georgia, serif);
          font-size: 0.95rem;
          line-height: 1.1;
          color: var(--ink, #16181c);
        }

        .dt-mega-item small {
          display: block;
          margin-top: 0.15rem;
          color: var(--fg-muted, #5b636f);
          font-size: 0.78rem;
          line-height: 1.3;
        }

        .dt-mega-item b {
          display: block;
          margin-top: 0.2rem;
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.56rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--primary, #0a82b3);
        }

        .profile-skeleton,
        .profile-trigger,
        .sign-in-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 2.25rem;
          border: 1px solid var(--rule, #d9dde3);
          background: var(--bg-surface, #fff);
          color: var(--ink, #16181c);
        }

        .profile-skeleton,
        .profile-trigger {
          width: 2.25rem;
        }

        .profile-trigger {
          cursor: pointer;
          padding: 0.2rem;
        }

        .profile-avatar {
          border: 1px solid var(--primary, #0a82b3);
        }

        .sign-in-pill {
          padding: 0 0.85rem;
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.62rem;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
        }

        .profile-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 0.4rem);
          z-index: 100;
          min-width: 220px;
          border: 1px solid var(--ink, #16181c);
          background: var(--bg-surface, #fff);
          box-shadow: 0 16px 32px -18px rgba(7, 41, 56, 0.35);
        }

        .profile-dropdown a,
        .profile-dropdown button,
        .profile-menu-header {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 0.5rem;
          border: 0;
          border-bottom: 1px solid var(--rule, #d9dde3);
          background: transparent;
          color: var(--ink, #16181c);
          padding: 0.75rem 0.85rem;
          text-align: left;
          text-decoration: none;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .dt-masthead-top {
            grid-template-columns: minmax(180px, 1fr) auto auto;
          }

          .dt-masthead-top .header-search-wrap {
            grid-column: 1 / -1;
            grid-row: 2;
          }

          .dt-ecosystem {
            display: none;
          }

          .dt-nav {
            overflow-x: auto;
            scrollbar-width: thin;
          }
        }

        @media (max-width: 640px) {
          .dt-masthead-top {
            width: min(100% - 1rem, var(--spacing-content-max, 1180px));
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 0.5rem;
          }

          .dt-actions {
            justify-self: end;
          }

          .dt-brand-sub,
          .header-search button {
            display: none;
          }

          .header-search {
            grid-template-columns: minmax(0, 1fr);
          }

          .dt-nav {
            width: min(100% - 1rem, var(--spacing-content-max, 1180px));
          }

          .dt-nav-link {
            padding-inline: 0.7rem;
            font-size: 0.62rem;
          }

          .dt-mega {
            display: none !important;
          }
        }
      `}</style>
      <header className="dt-masthead">
        <div className="dt-masthead-top">
          <Link href="/" className="dt-brand" aria-label="The Daily Transit home">
            <Image src="/logo-icon.png" alt="" width={34} height={34} className="dt-brand-mark" />
            <span className="dt-brand-copy">
              <span className="dt-brand-name">The Daily <em>Transit</em></span>
              <span className="dt-brand-sub">Citizen Science Daily</span>
            </span>
          </Link>

          <HeaderSearch />

          <div className="dt-ecosystem">
            <button className="dt-ecosystem-trigger" type="button">
              <span className="dt-led" aria-hidden />
              Star Sailors
              <span aria-hidden>▾</span>
            </button>
            <div className="dt-mega dt-mega-ecosystem">
              <div className="dt-mega-head">
                <span>The <em>Star Sailors</em> Ecosystem</span>
                <span>Network</span>
              </div>
              <div className="dt-mega-col">
                <Link href="/" className="dt-mega-item">
                  <MegaIcon tone="science" />
                  <span><strong>The Daily Transit</strong><small>News and daily puzzles</small></span>
                </Link>
                <Link href="/games/mars" className="dt-mega-item">
                  <MegaIcon tone="discover" />
                  <span><strong>Mars Atlas</strong><small>MRO cloud library</small></span>
                </Link>
              </div>
              <div className="dt-mega-col">
                <Link href="/source/lightcurve" className="dt-mega-item">
                  <MegaIcon tone="puzzle" />
                  <span><strong>Lightcurve Lab</strong><small>Advanced TESS analysis</small></span>
                </Link>
                <Link href="/profile" className="dt-mega-item">
                  <MegaIcon tone="ink" />
                  <span><strong>Personnel Files</strong><small>Profiles and leaderboard</small></span>
                </Link>
              </div>
            </div>
          </div>

          <div className="dt-actions">
            <ThemeToggle initialTheme={initialTheme} />
            <AuthStatus />
          </div>
        </div>

        <nav className="dt-nav" aria-label="Main navigation">
          {megaSections.map((section) => (
            <div className="dt-nav-item" key={section.label}>
              <Link href={section.href} className="dt-nav-link">
                {section.label}
                {section.badge ? <span>{section.badge}</span> : null}
                <span aria-hidden>▾</span>
              </Link>
              <div className="dt-mega">
                <div className="dt-mega-head">
                  <span>{section.label} <em>Desk</em></span>
                  <span>Daily Transit</span>
                </div>
                {section.columns.map((column, index) => (
                  <div className="dt-mega-col" key={`${section.label}-${index}`}>
                    {column.map((item) => (
                      <Link href={item.href} className="dt-mega-item" key={item.label}>
                        <MegaIcon tone={item.tone} />
                        <span>
                          <strong>{item.label}</strong>
                          <small>{item.description}</small>
                          {item.status ? <b>{item.status}</b> : null}
                        </span>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </header>
    </>
  );
}
