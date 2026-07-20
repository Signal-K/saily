"use client";

const ECOSYSTEM_LINKS = [
  { href: "https://playlandnam.space", label: "Landnam" },
  { href: "https://youratlas.cc", label: "Atlas" },
  { href: "https://starsailors.space", label: "Star Sailors" },
  { href: "https://github.com/signal-k", label: "GitHub" },
];

export function EcosystemBar() {
  return (
    <div className="dt-ecosystem-bar">
      <style jsx global>{`
        .dt-ecosystem-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          width: min(var(--spacing-content-max, 1180px), calc(100% - 2rem));
          margin-inline: auto;
          padding: 0.4rem 0;
          border-bottom: 1px solid var(--rule, #d9dde3);
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .dt-ecosystem-links {
          display: inline-flex;
          gap: 1rem;
        }

        .dt-ecosystem-links a,
        .dt-ecosystem-imprint a {
          color: var(--fg-faded, #9099a4);
          text-decoration: none;
        }

        .dt-ecosystem-links a:hover,
        .dt-ecosystem-imprint a:hover {
          color: var(--primary, #0a82b3);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
      `}</style>
      <span className="dt-ecosystem-links">
        {ECOSYSTEM_LINKS.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
            {link.label}
          </a>
        ))}
      </span>
      <span className="dt-ecosystem-imprint">
        <a href="/imprint">Imprint</a>
      </span>
    </div>
  );
}
