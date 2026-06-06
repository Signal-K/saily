"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

type Props = {
  initialTheme: "light" | "dark";
};

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

        .dt-actions {
          display: inline-flex;
          align-items: center;
          justify-self: end;
          gap: 0.45rem;
          min-width: 0;
        }

        @media (max-width: 900px) {
          .dt-masthead-top {
            grid-template-columns: minmax(180px, 1fr) auto;
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

          .dt-brand-sub {
            display: none;
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

          <div className="dt-actions">
            <ThemeToggle initialTheme={initialTheme} />
          </div>
        </div>
      </header>
    </>
  );
}
