"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

type Props = {
  initialTheme: "light" | "dark";
};

type MegaItem = {
  href: string;
  label: string;
  description: string;
  tone?: "science" | "puzzle" | "discover" | "community" | "streak" | "ink";
};

const megaSections: Array<{
  label: string;
  href: string;
  columns: MegaItem[][];
}> = [
  {
    label: "Today",
    href: "/games/today",
    columns: [
      [
        { href: "/games/today", label: "Today's Mission", description: "Daily citizen-science puzzle", tone: "science" },
        { href: "/games", label: "All Games", description: "Browse every mission", tone: "discover" },
      ],
      [
        { href: "/discuss", label: "Consensus Desk", description: "Compare field reports", tone: "community" },
        { href: "/calendar", label: "Edition Archive", description: "Replay previous editions", tone: "ink" },
      ],
    ],
  },
  {
    label: "Stories",
    href: "/articles",
    columns: [
      [
        { href: "/articles", label: "Episodes", description: "Narrative dispatches", tone: "science" },
        { href: "/about", label: "About", description: "What The Daily Transit is", tone: "ink" },
      ],
      [
        { href: "/postcards", label: "Postcards", description: "Share a discovery", tone: "discover" },
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
        { href: "/leaderboard", label: "Leaderboard", description: "Top personnel records", tone: "streak" },
      ],
      [
        { href: "/chips", label: "Data Chips", description: "Balance and streak repair", tone: "puzzle" },
        { href: "/search", label: "Registry", description: "Search the archive", tone: "discover" },
      ],
    ],
  },
  {
    label: "Feedback",
    href: "/feedback",
    columns: [
      [
        { href: "/feedback", label: "Suggestions Desk", description: "Review assets, vote on ideas", tone: "community" },
        { href: "/feedback#assets", label: "Asset Review", description: "Rate Landnam room art", tone: "discover" },
      ],
    ],
  },
];

const MOBILE_NAV_LINKS = [
  { href: "/articles", label: "Episodes" },
  { href: "/games/today", label: "Missions" },
  { href: "/games", label: "Games" },
  { href: "/calendar", label: "Archive" },
  { href: "/discuss", label: "Consensus" },
  { href: "/leaderboard", label: "Stats" },
  { href: "/feedback", label: "Feedback" },
  { href: "/search", label: "Registry" },
  { href: "/about", label: "About" },
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
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
          grid-template-columns: minmax(190px, auto) auto;
          align-items: center;
          justify-content: space-between;
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
        .dt-mega-item:hover {
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

        .dt-actions {
          display: inline-flex;
          align-items: center;
          justify-self: end;
          gap: 0.65rem;
          min-width: 0;
        }

        .dt-landnam-cta {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          border: 1px solid var(--primary, #0a82b3);
          background: var(--primary, #0a82b3);
          color: #fff;
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 0.5rem 0.75rem;
        }

        .dt-landnam-cta:hover {
          background: var(--primary-deep, #08658c);
          border-color: var(--primary-deep, #08658c);
          text-decoration: none;
        }

        .dt-atlas-cta {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          border: 1px solid var(--primary, #0a82b3);
          background: transparent;
          color: var(--primary, #0a82b3);
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 0.5rem 0.75rem;
        }

        .dt-atlas-cta:hover {
          background: var(--primary, #0a82b3);
          color: #fff;
          text-decoration: none;
        }

        @media (max-width: 640px) {
          .dt-landnam-cta,
          .dt-atlas-cta {
            display: none;
          }
        }

        .dt-menu-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 2.75rem;
          height: 2.75rem;
          border: 1px solid var(--rule, #d9dde3);
          background: var(--bg-surface, #fff);
          color: var(--ink, #16181c);
          cursor: pointer;
        }

        .dt-menu-toggle span,
        .dt-menu-toggle span::before,
        .dt-menu-toggle span::after {
          display: block;
          width: 18px;
          height: 2px;
          background: currentColor;
          position: relative;
          transition: transform 0.15s ease, opacity 0.15s ease;
        }

        .dt-menu-toggle span::before,
        .dt-menu-toggle span::after {
          content: "";
          position: absolute;
          left: 0;
        }

        .dt-menu-toggle span::before {
          top: -6px;
        }

        .dt-menu-toggle span::after {
          top: 6px;
        }

        .dt-menu-toggle.is-open span {
          background: transparent;
        }

        .dt-menu-toggle.is-open span::before {
          top: 0;
          transform: rotate(45deg);
        }

        .dt-menu-toggle.is-open span::after {
          top: 0;
          transform: rotate(-45deg);
        }

        .dt-mobile-nav {
          display: none;
        }

        .dt-nav {
          position: relative;
          display: flex;
          align-items: stretch;
          width: min(var(--spacing-content-max, 1180px), calc(100% - 2rem));
          margin-inline: auto;
          overflow: visible;
        }

        .dt-nav-item {
          position: relative;
        }

        .dt-nav-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
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

        .dt-nav-caret {
          flex: none;
          display: block;
        }

        .dt-nav-link:hover,
        .dt-nav-item:focus-within .dt-nav-link,
        .dt-nav-item:hover .dt-nav-link,
        .dt-nav-link.is-active {
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
          width: min(480px, calc(100vw - 2rem));
          border: 1px solid var(--ink, #16181c);
          background: var(--bg-surface, #fff);
          box-shadow: 0 16px 32px -18px rgba(7, 41, 56, 0.35);
        }

        .dt-nav-item:hover .dt-mega,
        .dt-nav-item:focus-within .dt-mega {
          display: grid;
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

        @media (max-width: 900px) {
          .dt-masthead-top {
            grid-template-columns: minmax(180px, 1fr) auto;
          }
        }

        @media (max-width: 760px) {
          .dt-masthead-top {
            width: min(100% - 1rem, var(--spacing-content-max, 1180px));
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 0.5rem;
          }

          .dt-nav {
            display: none;
          }

          .dt-menu-toggle {
            display: inline-flex;
          }

          .dt-actions {
            justify-self: end;
          }

          .dt-brand-sub {
            display: none;
          }

          .dt-mobile-nav.is-open {
            display: flex;
          }
        }

        @media (max-width: 640px) {
          .dt-masthead-top {
            gap: 0.4rem;
          }
        }

        .dt-mobile-nav {
          flex-direction: column;
          width: min(var(--spacing-content-max, 1180px), calc(100% - 2rem));
          margin-inline: auto;
          border-top: 1px solid var(--rule, #d9dde3);
          padding: 0.5rem 0;
        }

        .dt-mobile-nav-link {
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--ink, #16181c);
          text-decoration: none;
          padding: 0.85rem 0.25rem;
          min-height: 44px;
          display: flex;
          align-items: center;
        }

        .dt-mobile-nav-link.is-active {
          color: var(--primary, #0a82b3);
        }

        .dt-mobile-nav-link + .dt-mobile-nav-link {
          border-top: 1px solid var(--rule, #d9dde3);
        }
      `}</style>
      <header className="dt-masthead">
        <div className="dt-masthead-top">
          <Link href="/" className="dt-brand" aria-label="The Daily Transit home">
            <Image src="/logo-icon.png" alt="" width={34} height={34} className="dt-brand-mark" />
            <span className="dt-brand-copy">
              <span className="dt-brand-name">The Daily <em>Transit</em></span>
              <span className="dt-brand-sub">A Star Sailors publication</span>
            </span>
          </Link>

          <div className="dt-actions">
            <a
              href="https://youratlas.cc"
              target="_blank"
              rel="noreferrer"
              className="dt-atlas-cta"
            >
              Explore Atlas
            </a>
            <a
              href="https://playlandnam.space"
              target="_blank"
              rel="noreferrer"
              className="dt-landnam-cta"
            >
              Play Landnam
            </a>
            <ThemeToggle initialTheme={initialTheme} />
            <button
              type="button"
              className={`dt-menu-toggle${menuOpen ? " is-open" : ""}`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="dt-mobile-nav"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
            </button>
          </div>
        </div>

        <nav className="dt-nav" aria-label="Main navigation">
          {megaSections.map((section) => (
            <div className="dt-nav-item" key={section.label}>
              <Link
                href={section.href}
                className={`dt-nav-link${pathname.startsWith(section.href) ? " is-active" : ""}`}
              >
                {section.label}
                <svg className="dt-nav-caret" width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden="true">
                  <path d="M0 0.5H8L4 5.5L0 0.5Z" fill="currentColor" />
                </svg>
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
                        </span>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <nav
          id="dt-mobile-nav"
          className={`dt-mobile-nav${menuOpen ? " is-open" : ""}`}
          aria-label="Primary"
        >
          {MOBILE_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`dt-mobile-nav-link${pathname.startsWith(link.href) ? " is-active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://playlandnam.space"
            target="_blank"
            rel="noreferrer"
            className="dt-mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Play Landnam
          </a>
          <a
            href="https://youratlas.cc"
            target="_blank"
            rel="noreferrer"
            className="dt-mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Explore Atlas
          </a>
        </nav>
      </header>
    </>
  );
}
