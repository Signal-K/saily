"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

type Props = {
  initialTheme: "light" | "dark";
};

const NAV_LINKS = [
  { href: "/articles", label: "Stories" },
  { href: "/games/today", label: "Missions" },
  { href: "/games", label: "Games" },
  { href: "/calendar", label: "Archive" },
  { href: "/discuss", label: "Consensus" },
  { href: "/leaderboard", label: "Stats" },
  { href: "/search", label: "Registry" },
  { href: "/about", label: "About" },
];

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
          grid-template-columns: minmax(190px, auto) 1fr auto;
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

        .dt-brand:hover {
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

        .dt-primary-nav {
          display: inline-flex;
          align-items: center;
          gap: 1.1rem;
          min-width: 0;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .dt-primary-nav::-webkit-scrollbar {
          display: none;
        }

        .dt-primary-nav-link {
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--fg-faded, #9099a4);
          text-decoration: none;
          white-space: nowrap;
          padding: 0.35rem 0.1rem;
        }

        .dt-primary-nav-link:hover,
        .dt-primary-nav-link.is-active {
          color: var(--ink, #16181c);
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

        @media (max-width: 900px) {
          .dt-masthead-top {
            grid-template-columns: minmax(180px, 1fr) auto auto;
          }
        }

        @media (max-width: 760px) {
          .dt-masthead-top {
            width: min(100% - 1rem, var(--spacing-content-max, 1180px));
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 0.5rem;
          }

          .dt-primary-nav {
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
              <span className="dt-brand-sub">Citizen Science Daily</span>
            </span>
          </Link>

          <nav className="dt-primary-nav" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`dt-primary-nav-link${pathname.startsWith(link.href) ? " is-active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="dt-actions">
            <a
              href="https://youratlas.cc"
              target="_blank"
              rel="noreferrer"
              className="dt-atlas-cta"
            >
              Visit Atlas
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

        <nav
          id="dt-mobile-nav"
          className={`dt-mobile-nav${menuOpen ? " is-open" : ""}`}
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => (
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
            Visit Atlas
          </a>
        </nav>
      </header>
    </>
  );
}
