export function LandingStyles() {
  return (
    <style jsx global>{`
      .tx-landing {
        width: min(var(--spacing-content-max, 1180px), calc(100% - 3rem));
        margin-inline: auto;
        padding: 1rem 0 4rem;
      }

      .tx-public-mast {
        position: sticky;
        top: 0;
        z-index: 20;
        margin-inline: calc((100vw - 100%) / -2);
        border-bottom: 3px double var(--ink, #16181c);
        background: color-mix(in oklab, var(--bg-surface, #fff) 96%, white);
        backdrop-filter: blur(10px);
      }

      .tx-public-mast-inner {
        display: grid;
        grid-template-columns: minmax(220px, auto) 1fr auto;
        align-items: center;
        gap: 1rem;
        width: min(var(--spacing-content-max, 1180px), calc(100% - 2rem));
        margin-inline: auto;
        padding: 0.7rem 0;
      }

      .tx-brand-public,
      .tx-footer-brand {
        display: inline-flex;
        align-items: center;
        gap: 0.65rem;
        color: inherit;
        text-decoration: none;
      }

      .tx-brand-public img {
        border: 1px solid var(--rule, #d9dde3);
        background: #fff;
      }

      .tx-brand-public strong,
      .tx-footer-brand strong {
        display: block;
        font-family: var(--font-display, "Turret Road", Georgia, serif);
        font-size: clamp(1.05rem, 2vw, 1.35rem);
        line-height: 1;
      }

      .tx-brand-public em,
      .tx-footer-brand em,
      .tx-hero-title em {
        color: var(--primary, #0a82b3);
        font-style: italic;
      }

      .tx-brand-public span,
      .tx-footer-brand span {
        display: block;
        color: var(--fg-faded, #9099a4);
        font-family: var(--font-data, ui-monospace, monospace);
        font-size: 0.58rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .tx-public-nav,
      .tx-footer-links {
        display: flex;
        flex-wrap: wrap;
        gap: clamp(0.75rem, 3vw, 2rem);
      }

      .tx-public-nav {
        justify-content: center;
        overflow-x: auto;
      }

      .tx-footer-links {
        justify-content: flex-end;
      }

      .tx-public-nav a,
      .tx-footer-links a {
        color: var(--fg-muted, #5b636f);
        font-family: var(--font-data, ui-monospace, monospace);
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-decoration: none;
        text-transform: uppercase;
        white-space: nowrap;
      }

      .tx-public-nav a:hover,
      .tx-footer-links a:hover {
        color: var(--primary, #0a82b3);
      }

      .tx-status {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        width: fit-content;
        border: 1px solid var(--primary, #0a82b3);
        background: var(--bg-surface-cool, #eaf6fb);
        color: var(--primary, #0a82b3);
        padding: 0.5rem 0.75rem;
        font-family: var(--font-data, ui-monospace, monospace);
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        text-decoration: none;
        white-space: nowrap;
      }

      .tx-dot {
        width: 0.48rem;
        height: 0.48rem;
        border-radius: 999px;
        background: var(--primary, #0a82b3);
        box-shadow: 0 0 0 0 color-mix(in oklab, var(--primary, #0a82b3) 42%, transparent);
        animation: txPulse 2.2s infinite;
      }

      @keyframes txPulse {
        70% { box-shadow: 0 0 0 10px transparent; }
        100% { box-shadow: 0 0 0 0 transparent; }
      }

      .tx-landing .button,
      .tx-landing button.button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 42px;
        border: 1px solid var(--ink, #16181c);
        background: var(--bg-surface, #fff);
        color: var(--ink, #16181c);
        padding: 0.72rem 1rem;
        font-family: var(--font-data, ui-monospace, monospace);
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-decoration: none;
        text-transform: uppercase;
        cursor: pointer;
      }

      .tx-landing .button-primary,
      .tx-landing button.button-primary {
        border-color: var(--primary, #0a82b3);
        background: var(--primary, #0a82b3);
        color: #fff;
      }

      .tx-landing .button:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .tx-hero-public {
        display: grid;
        grid-template-columns: minmax(0, 1.35fr) minmax(290px, 0.9fr);
        gap: 2rem;
        align-items: stretch;
        margin-top: 1rem;
        border: 1px solid var(--rule, #d9dde3);
        border-top: 3px double var(--ink, #16181c);
        background:
          linear-gradient(90deg, color-mix(in oklab, var(--primary, #0a82b3) 7%, transparent) 1px, transparent 1px),
          linear-gradient(0deg, color-mix(in oklab, var(--primary, #0a82b3) 6%, transparent) 1px, transparent 1px),
          var(--bg-surface, #fff);
        background-size: 38px 38px;
        padding: clamp(1.35rem, 4vw, 2.6rem);
      }

      .tx-hero-title {
        max-width: 11ch;
        margin: 0.7rem 0 1rem;
        font-family: var(--font-display, "Turret Road", Georgia, serif);
        font-size: clamp(3rem, 8vw, 6.5rem);
        font-weight: 800;
        line-height: 0.92;
        letter-spacing: 0;
      }

      .tx-lede {
        max-width: 64ch;
        margin: 0;
        color: var(--fg-2, #2b2f36);
        font: var(--type-lede, 400 1.16rem/1.58 Georgia, serif);
      }

      .tx-hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;
        margin-top: 1.35rem;
      }

      .tx-hero-signup {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.8rem;
        max-width: 500px;
        margin-top: 1.8rem;
      }

      .tx-hero-input {
        min-height: 48px;
        border: 1px solid var(--rule, #d9dde3);
        background: var(--bg-surface, #fff);
        padding: 0 1rem;
        font-family: inherit;
        font-size: 1rem;
      }

      .tx-hero-signup-success {
        margin-top: 1.8rem;
        border-left: 3px solid var(--primary, #0a82b3);
        background: var(--bg-surface-cool, #eaf6fb);
        padding: 1rem;
      }

      .tx-hero-signup-success p {
        margin: 0;
        color: var(--primary, #0a82b3);
      }

      .tx-tag-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
        margin-top: 1.2rem;
      }

      .tx-tag {
        border: 1px solid var(--rule, #d9dde3);
        background: var(--bg-surface, #fff);
        color: var(--fg-muted, #5b636f);
        padding: 0.42rem 0.65rem;
        font-family: var(--font-data, ui-monospace, monospace);
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .tx-console {
        display: grid;
        gap: 1rem;
      }

      .tx-console-card {
        border: 1px solid var(--rule, #d9dde3);
        background: var(--bg-surface-cool, #eaf6fb);
        padding: 1rem;
      }

      .tx-console-card.is-dark {
        background: var(--ink, #16181c);
        color: #fff;
      }

      .tx-console-head {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        color: var(--fg-muted, #5b636f);
        font-family: var(--font-data, ui-monospace, monospace);
        font-size: 0.68rem;
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .tx-console-card.is-dark .tx-console-head {
        color: var(--fg-faded, #9099a4);
      }

      .tx-console-value {
        color: var(--primary, #0a82b3);
      }

      .tx-bars {
        display: flex;
        align-items: end;
        gap: 0.65rem;
        height: 72px;
        margin: 0.85rem 0;
      }

      .tx-bars span {
        flex: 1;
        min-width: 22px;
        background: var(--primary, #0a82b3);
      }

      .tx-console-card.is-dark p {
        margin: 0.75rem 0 0;
        font-family: var(--font-data, ui-monospace, monospace);
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        line-height: 1.65;
        text-transform: uppercase;
      }

      .tx-section {
        margin-top: clamp(2.4rem, 6vw, 4rem);
      }

      .tx-section-head {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 1rem;
        border-bottom: 3px solid var(--ink, #16181c);
        padding-bottom: 0.75rem;
      }

      .tx-section-head h2,
      .tx-notify h2 {
        margin: 0;
        font-family: var(--font-display, "Turret Road", Georgia, serif);
        font-size: clamp(1.85rem, 4vw, 2.8rem);
        line-height: 1.05;
      }

      .tx-section-head p {
        max-width: 56ch;
        margin: 0.45rem 0 0;
        color: var(--fg-muted, #5b636f);
        line-height: 1.55;
      }

      .tx-kicker {
        margin: 0;
        color: var(--primary, #0a82b3);
        font-family: var(--font-data, ui-monospace, monospace);
        font-size: 0.68rem;
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .tx-survey {
        display: grid;
        gap: 1.35rem;
        border: 1px solid var(--rule, #d9dde3);
        border-top: 3px double var(--ink, #16181c);
        background: var(--bg-surface, #fff);
        padding: clamp(1.1rem, 3vw, 1.65rem);
      }

      .tx-survey-grid,
      .tx-games-grid,
      .tx-news-grid,
      .tx-team-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1rem;
      }

      .tx-question,
      .tx-game-card,
      .tx-news-card,
      .tx-team-card,
      .tx-thanks-card,
      .tx-step {
        border: 1px solid var(--rule, #d9dde3);
        background: var(--bg-surface, #fff);
        padding: 1rem;
      }

      .tx-question h3,
      .tx-game-card h3,
      .tx-news-card h3,
      .tx-step h3,
      .tx-team-card h3,
      .tx-thanks-card h3 {
        margin: 0.35rem 0 0.45rem;
        font-family: var(--font-display, "Turret Road", Georgia, serif);
        font-size: 1.35rem;
        line-height: 1.1;
      }

      .tx-question p,
      .tx-game-card p,
      .tx-news-card p,
      .tx-step p,
      .tx-team-card p,
      .tx-thanks-card p {
        margin: 0;
        color: var(--fg-muted, #5b636f);
        line-height: 1.55;
      }

      .tx-chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        margin-top: 0.8rem;
      }

      .tx-chip {
        border: 1px solid var(--rule, #d9dde3);
        background: var(--bg-surface-warm, #f4efe6);
        color: var(--fg-muted, #5b636f);
        padding: 0.45rem 0.55rem;
        font-family: var(--font-data, ui-monospace, monospace);
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        cursor: pointer;
      }

      .tx-chip.is-active {
        border-color: var(--primary, #0a82b3);
        background: var(--bg-surface-cool, #eaf6fb);
        color: var(--primary, #0a82b3);
      }

      .tx-question.is-chosen {
        border-color: var(--primary, #0a82b3);
        background: var(--bg-surface-cool, #eaf6fb);
      }

      @keyframes txFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .tx-fade-in {
        animation: txFadeIn 0.45s ease both;
      }

      .tx-landnam-invite {
        margin-top: 1.5rem;
        border: 1px solid var(--primary, #0a82b3);
        background: var(--bg-surface-cool, #eaf6fb);
        padding: clamp(1.1rem, 3vw, 1.6rem);
      }

      .tx-play-reveal {
        margin-top: 1.25rem;
        border: 1px solid var(--ink, #16181c);
        border-top: 3px solid var(--ink, #16181c);
        background: var(--ink, #16181c);
        color: #fff;
        padding: clamp(1.1rem, 3vw, 1.6rem);
      }

      .tx-play-reveal em {
        color: var(--primary, #0a82b3);
        font-style: italic;
      }

      .tx-play-reveal .tx-kicker {
        color: var(--bg-surface-cool, #eaf6fb);
        opacity: 0.7;
      }

      .tx-play-reveal p {
        color: var(--fg-faded, #9099a4);
      }

      .tx-play-reveal .button-primary {
        border-color: var(--primary, #0a82b3);
        background: var(--primary, #0a82b3);
        color: #fff;
      }

      .tx-survey textarea,
      .tx-survey input,
      .tx-notify input {
        width: 100%;
        min-height: 44px;
        border: 1px solid var(--rule, #d9dde3);
        background: var(--bg-surface, #fff);
        color: var(--ink, #16181c);
        padding: 0.8rem;
        font: inherit;
      }

      .tx-survey textarea {
        min-height: 110px;
        resize: vertical;
      }

      .tx-form-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.8rem;
        align-items: end;
      }

      .tx-label {
        display: grid;
        gap: 0.35rem;
        color: var(--fg-muted, #5b636f);
        font-family: var(--font-data, ui-monospace, monospace);
        font-size: 0.68rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .tx-form-note {
        margin: 0;
        color: var(--fg-muted, #5b636f);
        font-size: 0.92rem;
      }

      .tx-form-note.is-error {
        color: var(--color-rust-400, #d76131);
      }

      .tx-citizen-grid {
        display: grid;
        grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
        gap: 1rem;
        align-items: start;
        margin-top: 1rem;
      }

      .tx-citizen-copy {
        border-left: 3px solid var(--primary, #0a82b3);
        padding-left: 1rem;
      }

      .tx-citizen-copy p {
        color: var(--fg-2, #2b2f36);
        font-size: 1.05rem;
        line-height: 1.65;
      }

      .tx-step-grid {
        display: grid;
        gap: 0.8rem;
      }

      .tx-step {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.85rem;
      }

      .tx-step-num {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 42px;
        border: 1px solid var(--primary, #0a82b3);
        background: var(--bg-surface-cool, #eaf6fb);
        color: var(--primary, #0a82b3);
        font-family: var(--font-data, ui-monospace, monospace);
        font-weight: 900;
      }

      .tx-team-card {
        display: grid;
        gap: 0.65rem;
      }

      .tx-team-avatar {
        display: block;
        width: 64px;
        height: 64px;
        border: 1px solid var(--primary, #0a82b3);
        background: var(--bg-surface-cool, #eaf6fb);
      }

      .tx-team-avatar-small {
        width: 48px;
        height: 48px;
      }

      .tx-thanks-list {
        display: grid;
        gap: 0.75rem;
        margin-top: 1rem;
      }

      .tx-thanks-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1rem;
      }

      .tx-thanks-card {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.75rem;
        align-items: center;
      }

      .tx-thanks-card h3 {
        font-size: 1.05rem;
      }

      .tx-game-card {
        display: grid;
        gap: 0.8rem;
        color: inherit;
        text-decoration: none;
      }

      .tx-game-card:hover {
        border-color: var(--primary, #0a82b3);
        text-decoration: none;
      }

      .tx-game-image {
        display: flex;
        align-items: center;
        min-height: 92px;
      }

      .tx-notify {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(280px, 0.72fr);
        gap: 1rem;
        align-items: center;
        border: 1px solid var(--ink, #16181c);
        background: var(--bg-surface-cool, #eaf6fb);
        padding: clamp(1.1rem, 3vw, 1.6rem);
      }

      .tx-notify h2 {
        margin: 0.35rem 0 0.55rem;
      }

      .tx-footer {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 1rem;
        margin-top: 3rem;
        border-top: 3px double var(--ink, #16181c);
        padding-top: 1rem;
      }

      @media (max-width: 980px) {
        .tx-public-mast-inner,
        .tx-hero-public,
        .tx-citizen-grid,
        .tx-notify,
        .tx-hero-signup {
          grid-template-columns: 1fr;
        }

        .tx-public-nav {
          justify-content: start;
        }

        .tx-survey-grid,
        .tx-games-grid,
        .tx-news-grid,
        .tx-team-grid,
        .tx-thanks-grid {
          grid-template-columns: 1fr;
        }

        .tx-form-row {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .tx-landing {
          width: min(var(--spacing-content-max, 1180px), calc(100% - 1rem));
        }

        .tx-section-head,
        .tx-footer {
          align-items: start;
          flex-direction: column;
        }
      }
    `}</style>
  );
}
