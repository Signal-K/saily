export function LandingStyles() {
  return (
    <style jsx global>{`
      /* ── Shared resets & base ───────────────────────────────────────── */

      .tx-variant-root {
        min-height: 100vh;
      }

      /* ── Shared landing typography ──────────────────────────────────── */

      .tx-kicker {
        font-family: ui-monospace, monospace;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--fg-muted);
        margin: 0 0 0.4rem;
      }

      .tx-status {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.25rem 0.65rem;
        border: 1px solid currentColor;
        border-radius: 999px;
        color: var(--fg-2);
        text-decoration: none;
        white-space: nowrap;
      }

      .tx-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        opacity: 0.7;
        flex-shrink: 0;
      }

      .tx-interest-success {
        padding: 0.75rem 1rem;
        border-left: 3px solid var(--primary);
        background: var(--primary-soft);
        border-radius: 0 4px 4px 0;
        font-size: 0.875rem;
      }

      /* ── Toggle chips ────────────────────────────────────────────────── */

      .tx-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.35rem 0.75rem;
        font-size: 0.78rem;
        font-family: ui-monospace, monospace;
        border: 1px solid var(--rule);
        border-radius: 4px;
        background: transparent;
        cursor: pointer;
        color: var(--fg-2);
        transition: background 0.1s, border-color 0.1s;
      }
      .tx-chip:hover { background: var(--newsprint); }
      .tx-chip.is-active {
        background: var(--ink);
        border-color: var(--ink);
        color: #fff;
      }

      /* ── Survey / briefing section ───────────────────────────────────── */

      .tx-section {
        max-width: 900px;
        margin: 0 auto;
        padding: 2.5rem 1.5rem;
      }

      .tx-survey {
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
      }

      .tx-survey-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 1.5rem;
      }

      .tx-question h3 {
        font-size: 1rem;
        font-weight: 600;
        margin: 0.25rem 0 0.75rem;
      }

      .tx-chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .tx-label {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--fg-2);
      }
      .tx-label textarea,
      .tx-label input[type="email"] {
        border: 1px solid var(--rule);
        border-radius: 4px;
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        font-family: inherit;
        resize: vertical;
        background: var(--bg-surface);
        color: var(--ink);
      }
      .tx-label textarea { min-height: 80px; }
      .tx-label textarea:focus,
      .tx-label input[type="email"]:focus {
        outline: 2px solid var(--ink);
        outline-offset: 1px;
        border-color: var(--ink);
      }

      .tx-form-row {
        display: flex;
        gap: 0.75rem;
        align-items: flex-end;
        flex-wrap: wrap;
      }
      .tx-form-row .tx-label { flex: 1 1 200px; }

      .tx-form-note { font-size: 0.8rem; color: var(--fg-muted); }
      .tx-form-note.is-error { color: #dc2626; }

      /* ── Public masthead / menus ───────────────────────────────────── */

      .tx-public-mast {
        max-width: 1120px;
        margin: 0.6rem auto 0;
        padding: 0 1.5rem;
        color: var(--fg-1, #16181c);
      }

      .tx-public-title-row {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.45rem 0 0.55rem;
        border-top: 3px double var(--ink, #16181c);
        border-bottom: 1px solid var(--rule, #d9dde3);
      }

      .tx-brand-public {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        min-width: min-content;
        color: var(--fg-1, #16181c);
        text-decoration: none;
      }

      .tx-brand-public img {
        flex: 0 0 auto;
      }

      .tx-brand-public > span {
        display: grid;
        gap: 0.08rem;
      }

      .tx-brand-public strong {
        font-family: var(--font-display, Georgia, serif);
        font-size: clamp(1.65rem, 3.8vw, 2.75rem);
        font-weight: 800;
        letter-spacing: 0.02em;
        line-height: 1;
      }

      .tx-brand-public strong em {
        color: var(--primary, #0a82b3);
        font-style: italic;
        font-weight: 500;
      }

      .tx-brand-public span span {
        color: var(--fg-muted, #9099a4);
        font-family: ui-monospace, monospace;
        font-size: 0.58rem;
        font-weight: 800;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      .tx-public-title-row .tx-status {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
      }

      .tx-public-nav {
        display: flex;
        align-items: center;
        gap: 0.9rem;
      }

      .tx-public-nav a {
        color: var(--fg-2, #3d4149);
        font-family: ui-monospace, monospace;
        font-size: 0.62rem;
        font-weight: 850;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        text-decoration: none;
      }

      .tx-public-nav-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.45rem 0;
        border-bottom: 3px double var(--ink, #16181c);
      }

      .tx-public-nav-secondary {
        justify-content: flex-end;
        gap: 0.8rem;
        overflow-x: auto;
        white-space: nowrap;
        scrollbar-width: none;
      }

      .tx-public-nav-secondary::-webkit-scrollbar {
        display: none;
      }

      .tx-update-ribbon {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        overflow-x: auto;
        padding: 0.38rem 0 0;
        white-space: nowrap;
        scrollbar-width: none;
      }

      .tx-update-ribbon::-webkit-scrollbar {
        display: none;
      }

      .tx-update-ribbon span,
      .tx-update-ribbon a {
        font-family: ui-monospace, monospace;
        font-size: 0.58rem;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .tx-update-ribbon span {
        color: var(--primary, #0a82b3);
      }

      .tx-update-ribbon a {
        color: var(--fg-2, #3d4149);
        text-decoration: none;
      }

      .tx-update-ribbon a::before {
        content: "·";
        margin-right: 0.65rem;
        color: var(--fg-muted, #9099a4);
      }

      .tx-update-ribbon a:hover,
      .tx-public-nav a:hover {
        color: var(--primary, #0a82b3);
      }

      /* ── Daily live briefing ───────────────────────────────────────── */

      .tx-live {
        max-width: 1120px;
        min-height: auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
      }

      .tx-live-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .tx-live-head h1 {
        margin: 0.25rem 0 0.35rem;
        font-size: clamp(2rem, 4.8vw, 4rem);
        line-height: 0.95;
      }

      .tx-live-head p {
        max-width: 54ch;
        margin: 0;
        color: var(--fg-2, #3d4149);
        line-height: 1.5;
      }

      .tx-live-status {
        display: grid;
        justify-items: end;
        gap: 0.45rem;
      }

      .tx-live-status span {
        color: var(--fg-muted, #9099a4);
        font-family: ui-monospace, monospace;
        font-size: 0.62rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .tx-live-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.75fr);
        gap: 1rem;
      }

      .tx-live-apod,
      .tx-live-card,
      .tx-live-events,
      .tx-live-network {
        border: 1px solid var(--rule, #d9dde3);
        background: var(--surface, #fff);
      }

      .tx-live-apod {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.8fr);
        min-height: 360px;
        border-top: 4px double var(--ink, #16181c);
        overflow: hidden;
      }

      .tx-live-image-wrap {
        min-height: 360px;
        background: #0f172a;
        color: #cbd5e1;
        display: grid;
        place-items: center;
        overflow: hidden;
        text-decoration: none;
      }

      .tx-live-image-wrap.is-empty span {
        font-family: ui-monospace, monospace;
        font-size: 0.8rem;
        font-weight: 900;
        letter-spacing: 0.12em;
      }

      .tx-live-image {
        width: 100%;
        height: 100%;
        min-height: 360px;
        object-fit: cover;
        display: block;
      }

      .tx-live-apod-copy {
        display: grid;
        align-content: center;
        gap: 0.75rem;
        padding: 1.25rem;
      }

      .tx-live-card {
        display: grid;
        align-content: start;
        gap: 0.75rem;
        padding: 1rem;
      }

      .tx-live-side {
        display: grid;
        gap: 1rem;
      }

      .tx-live-apod h2,
      .tx-live-card h2 {
        margin: 0;
        color: var(--fg-1, #16181c);
        font-size: clamp(1.25rem, 2.3vw, 1.8rem);
        line-height: 1.05;
      }

      .tx-live-apod p,
      .tx-live-card p,
      .tx-live-event p {
        margin: 0;
        color: var(--fg-2, #3d4149);
        line-height: 1.55;
      }

      .tx-live-card a,
      .tx-live-meta {
        color: var(--fg-muted, #9099a4);
        font-family: ui-monospace, monospace;
        font-size: 0.62rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        text-decoration: none;
      }

      .tx-live-button,
      .tx-live-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: fit-content;
        border: 1px solid var(--ink, #16181c);
        background: var(--ink, #16181c);
        color: #fff;
        padding: 0.65rem 0.85rem;
        font-family: ui-monospace, monospace;
        font-size: 0.68rem;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        text-decoration: none;
        cursor: pointer;
      }

      .tx-live-link {
        margin-top: 0.15rem;
      }

      .tx-live-button:disabled {
        cursor: wait;
        opacity: 0.72;
      }

      .tx-live-local {
        grid-template-columns: 1fr auto;
        align-items: center;
      }

      .tx-live-bottom {
        display: grid;
        grid-template-columns: minmax(0, 1.35fr) minmax(260px, 0.65fr);
        gap: 1rem;
        margin-top: 1rem;
      }

      .tx-live-events {
        padding: 1rem;
      }

      .tx-live-event-list {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
        margin-top: 0.75rem;
      }

      .tx-live-event {
        display: grid;
        gap: 0.35rem;
        border-left: 2px solid var(--primary, #0a82b3);
        padding-left: 0.75rem;
        color: inherit;
        text-decoration: none;
      }

      .tx-live-event span {
        color: var(--primary, #0a82b3);
        font-family: ui-monospace, monospace;
        font-size: 0.58rem;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .tx-live-event strong {
        color: var(--fg-1, #16181c);
        font-size: 0.95rem;
        line-height: 1.2;
      }

      .tx-live-network {
        padding: 1rem;
      }

      .tx-live-ticker {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.75rem;
        margin-top: 0.75rem;
      }

      .tx-live-ticker-item {
        display: grid;
        gap: 0.25rem;
        border-left: 2px solid var(--primary, #0a82b3);
        padding-left: 0.75rem;
      }

      .tx-live-ticker-item strong {
        color: var(--primary, #0a82b3);
        font-family: ui-monospace, monospace;
        font-size: clamp(1.35rem, 4vw, 2.2rem);
        line-height: 1;
      }

      .tx-live-ticker-item span {
        color: var(--fg-muted, #9099a4);
        font-family: ui-monospace, monospace;
        font-size: 0.62rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .tx-v-deep-space .tx-live-lead,
      .tx-v-deep-space .tx-live-apod,
      .tx-v-deep-space .tx-live-card,
      .tx-v-deep-space .tx-live-events,
      .tx-v-deep-space .tx-live-network {
        background: rgba(255,255,255,0.03);
        border-color: rgba(255,255,255,0.08);
      }

      .tx-v-deep-space .tx-live-apod { border-top-color: #7c3aed; }
      .tx-v-deep-space .tx-live-head p,
      .tx-v-deep-space .tx-live-apod p,
      .tx-v-deep-space .tx-live-card p,
      .tx-v-deep-space .tx-live-event p { color: #94a3b8; }
      .tx-v-deep-space .tx-live-apod h2,
      .tx-v-deep-space .tx-live-card h2,
      .tx-v-deep-space .tx-live-event strong { color: #e2e8f0; }
      .tx-v-deep-space .tx-live-ticker-item { border-left-color: #a78bfa; }
      .tx-v-deep-space .tx-live-ticker-item strong { color: #a78bfa; }
      .tx-v-deep-space .tx-live-button,
      .tx-v-deep-space .tx-live-link {
        background: #e2e8f0;
        border-color: #e2e8f0;
        color: #06061a;
      }

      .tx-v-deep-space .tx-public-mast {
        color: #e2e8f0;
      }

      .tx-v-deep-space .tx-update-ribbon,
      .tx-v-deep-space .tx-public-title-row,
      .tx-v-deep-space .tx-public-nav-row,
      .tx-v-deep-space .tx-public-nav-secondary {
        border-color: rgba(255,255,255,0.08);
      }

      .tx-v-deep-space .tx-brand-public strong,
      .tx-v-deep-space .tx-public-nav a:hover {
        color: #e2e8f0;
      }

      .tx-v-deep-space .tx-brand-public span span,
      .tx-v-deep-space .tx-public-nav a,
      .tx-v-deep-space .tx-update-ribbon a {
        color: #94a3b8;
      }

      .tx-v-deep-space .tx-update-ribbon span {
        color: #a78bfa;
      }

      .tx-v-solar .tx-live-apod { border-top-color: #c27a0e; }
      .tx-v-solar .tx-update-ribbon span { color: #c27a0e; }
      .tx-v-solar .tx-live-ticker-item { border-left-color: #c27a0e; }
      .tx-v-solar .tx-live-ticker-item strong { color: #c27a0e; }

      .tx-v-minimal .tx-live-apod { border-top-color: #000; }

      /* ── Compact briefing controls ─────────────────────────────────── */

      .tx-briefing-panel {
        border: 1px solid var(--rule, #d9dde3);
        background: var(--surface, #fff);
        padding: 1rem;
        display: grid;
        gap: 1rem;
      }

      .tx-briefing-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        border-bottom: 1px solid var(--rule, #d9dde3);
        padding-bottom: 1rem;
      }

      .tx-briefing-head h2 {
        margin: 0.2rem 0 0.25rem;
        font-size: clamp(1.45rem, 3vw, 2.2rem);
        line-height: 1;
      }

      .tx-briefing-head p {
        margin: 0;
        max-width: 48ch;
        color: var(--fg-2, #3d4149);
        line-height: 1.5;
      }

      .tx-briefing-rows {
        display: grid;
        gap: 0.75rem;
      }

      .tx-briefing-question {
        display: grid;
        grid-template-columns: 150px minmax(0, 1fr);
        gap: 1rem;
        align-items: center;
      }

      .tx-briefing-question-head h3 {
        margin: 0;
        font-size: 0.95rem;
      }

      .tx-briefing-submit {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(260px, 0.45fr);
        gap: 1rem;
        align-items: end;
      }

      .tx-briefing-note textarea {
        min-height: 54px;
      }

      .tx-briefing-actions {
        display: grid;
        gap: 0.75rem;
      }

      /* ── Placeholder / lorem sections ──────────────────────────────── */

      .tx-ph-steps {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 2rem;
      }

      .tx-ph-step {
        display: grid;
        grid-template-columns: 3rem 1fr;
        gap: 1.25rem;
        align-items: start;
      }

      .tx-ph-step-n {
        font-family: ui-monospace, monospace;
        font-size: 0.65rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        color: var(--primary, #0a82b3);
        padding-top: 0.2rem;
      }

      .tx-ph-step-head {
        font-size: 1.1rem;
        font-weight: 700;
        margin: 0 0 0.45rem;
        color: var(--fg-1, #16181c);
      }

      .tx-ph-step-body {
        font-size: 0.95rem;
        line-height: 1.7;
        color: var(--fg-2, #3d4149);
        margin: 0;
      }

      .tx-ph-see-all {
        font-family: ui-monospace, monospace;
        font-size: 0.65rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--primary, #0a82b3);
        cursor: pointer;
        white-space: nowrap;
      }

      .tx-ph-card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 1.5rem;
      }

      .tx-ph-card {
        border: 1px solid var(--rule, #d9dde3);
        border-top: 3px solid var(--fg-1, #16181c);
        padding: 1.25rem;
        display: grid;
        gap: 0.5rem;
        background: var(--surface, #fff);
      }

      .tx-ph-card-meta {
        display: flex;
        gap: 0.65rem;
        align-items: center;
      }

      .tx-ph-card-tag {
        font-family: ui-monospace, monospace;
        font-size: 0.58rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--primary, #0a82b3);
      }

      .tx-ph-card-date {
        font-family: ui-monospace, monospace;
        font-size: 0.58rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        color: var(--fg-muted, #9099a4);
      }

      .tx-ph-card-head {
        font-size: 1rem;
        font-weight: 700;
        line-height: 1.35;
        margin: 0;
        color: var(--fg-1, #16181c);
      }

      .tx-ph-card-body {
        font-size: 0.88rem;
        line-height: 1.65;
        color: var(--fg-2, #5b636f);
        margin: 0;
      }

      .tx-ph-card-read {
        font-family: ui-monospace, monospace;
        font-size: 0.58rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--fg-muted, #9099a4);
        margin-top: 0.25rem;
      }

      .tx-ph-two-col {
        display: grid;
        grid-template-columns: minmax(0, 1.5fr) minmax(240px, 0.65fr);
        gap: 3rem;
        align-items: start;
      }

      .tx-ph-prose p {
        font-size: 1rem;
        line-height: 1.75;
        color: var(--fg-2, #2b2f36);
        margin: 0 0 1rem;
      }

      .tx-ph-aside { display: grid; gap: 1.5rem; }

      .tx-ph-aside-block {
        border: 1px solid var(--rule, #d9dde3);
        padding: 1rem;
        background: var(--surface-alt, #f7f5ee);
      }

      .tx-ph-aside-label {
        font-family: ui-monospace, monospace;
        font-size: 0.6rem;
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--fg-muted, #9099a4);
        margin: 0 0 0.75rem;
      }

      .tx-ph-stat-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.85rem;
      }

      .tx-ph-stat-item { display: grid; gap: 0.1rem; }

      .tx-ph-stat-n {
        font-family: ui-monospace, monospace;
        font-size: 1.4rem;
        font-weight: 900;
        color: var(--primary, #0a82b3);
        display: block;
      }

      .tx-ph-stat-label {
        font-family: ui-monospace, monospace;
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--fg-muted, #9099a4);
        display: block;
      }

      .tx-ph-link-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.55rem;
      }

      .tx-ph-link-list li { font-size: 0.88rem; }

      .tx-ph-fake-link {
        color: var(--primary, #0a82b3);
        font-size: 0.85rem;
        line-height: 1.5;
        cursor: pointer;
      }

      .tx-ph-faq-list {
        display: grid;
        gap: 0;
        border-top: 1px solid var(--rule, #d9dde3);
      }

      .tx-ph-faq-item {
        border-bottom: 1px solid var(--rule, #d9dde3);
        padding: 1.25rem 0;
        display: grid;
        grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
        gap: 2rem;
        align-items: start;
      }

      .tx-ph-faq-q {
        font-size: 1rem;
        font-weight: 700;
        color: var(--fg-1, #16181c);
        line-height: 1.4;
        padding-top: 0.1rem;
      }

      .tx-ph-faq-a {
        font-size: 0.92rem;
        line-height: 1.7;
        color: var(--fg-2, #3d4149);
        margin: 0;
      }

      /* Cosmic (deep-space) placeholder overrides */
      .tx-v-deep-space .tx-ph-step-head,
      .tx-v-deep-space .tx-ph-card-head,
      .tx-v-deep-space .tx-ph-faq-q { color: #e2e8f0; }

      .tx-v-deep-space .tx-ph-step-body,
      .tx-v-deep-space .tx-ph-card-body,
      .tx-v-deep-space .tx-ph-prose p,
      .tx-v-deep-space .tx-ph-faq-a { color: #94a3b8; }

      .tx-v-deep-space .tx-ph-card {
        background: rgba(255,255,255,0.03);
        border-color: rgba(255,255,255,0.08);
        border-top-color: #7c3aed;
      }

      .tx-v-deep-space .tx-ph-aside-block {
        background: rgba(255,255,255,0.02);
        border-color: rgba(255,255,255,0.07);
      }

      .tx-v-deep-space .tx-ph-faq-list,
      .tx-v-deep-space .tx-ph-faq-item { border-color: rgba(255,255,255,0.07); }

      .tx-v-deep-space .tx-ph-stat-n,
      .tx-v-deep-space .tx-ph-see-all,
      .tx-v-deep-space .tx-ph-card-tag,
      .tx-v-deep-space .tx-ph-fake-link { color: #a78bfa; }

      /* Solar placeholder overrides */
      .tx-v-solar .tx-ph-card { border-top-color: #c27a0e; }
      .tx-v-solar .tx-ph-stat-n,
      .tx-v-solar .tx-ph-see-all,
      .tx-v-solar .tx-ph-card-tag,
      .tx-v-solar .tx-ph-step-n,
      .tx-v-solar .tx-ph-fake-link { color: #c27a0e; }
      .tx-v-solar .tx-ph-aside-block { background: #fff8ee; border-color: #d4a76a; }
      .tx-v-solar .tx-ph-faq-list,
      .tx-v-solar .tx-ph-faq-item { border-color: #d4a76a; }

      /* Minimal placeholder overrides */
      .tx-v-minimal .tx-ph-card { border-top-color: #000; }
      .tx-v-minimal .tx-ph-aside-block { background: #f5f5f5; border-color: #ddd; }
      .tx-v-minimal .tx-ph-faq-list,
      .tx-v-minimal .tx-ph-faq-item { border-color: #ddd; }

      /* Responsive for placeholder sections */
      @media (max-width: 720px) {
        .tx-ph-two-col { grid-template-columns: 1fr; gap: 2rem; }
        .tx-ph-faq-item { grid-template-columns: 1fr; gap: 0.65rem; }
      }

      @media (max-width: 520px) {
        .tx-ph-step { grid-template-columns: 2.25rem 1fr; gap: 0.75rem; }
      }

      /* ── Sticky bottom tab bar ──────────────────────────────────────── */

      .tx-tab-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        border-top: 2px solid rgba(0,0,0,0.15);
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        box-shadow: 0 -4px 24px rgba(0,0,0,0.08);
      }

      .tx-v-deep-space .tx-tab-bar {
        background: rgba(10, 10, 20, 0.94);
        border-top-color: rgba(255,255,255,0.1);
      }

      .tx-tab-bar-inner {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 0.75rem;
        max-width: 1180px;
        margin: 0 auto;
        padding: 0 1rem;
        height: 56px;
      }

      .tx-tab-bar-label {
        font-family: ui-monospace, monospace;
        font-size: 0.6rem;
        font-weight: 900;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--fg-muted);
        white-space: nowrap;
      }

      .tx-v-deep-space .tx-tab-bar-label { color: #475569; }

      .tx-tab-bar-tabs {
        display: flex;
        gap: 0.25rem;
        justify-content: center;
      }

      .tx-tab {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.1rem;
        padding: 0.4rem 0.75rem;
        border: 1px solid transparent;
        border-radius: 6px;
        background: transparent;
        cursor: pointer;
        transition: background 0.15s ease, border-color 0.15s ease;
      }

      .tx-tab:hover {
        background: rgba(0,0,0,0.06);
      }

      .tx-v-deep-space .tx-tab:hover {
        background: rgba(255,255,255,0.06);
      }

      .tx-tab.is-active {
        border-color: rgba(0,0,0,0.15);
        background: rgba(0,0,0,0.06);
      }

      .tx-v-deep-space .tx-tab.is-active {
        border-color: rgba(255,255,255,0.15);
        background: rgba(255,255,255,0.06);
      }

      .tx-tab-icon {
        font-size: 1.1rem;
        line-height: 1;
      }

      .tx-tab-label {
        font-family: ui-monospace, monospace;
        font-size: 0.58rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--fg-muted);
        white-space: nowrap;
      }

      .tx-tab.is-active .tx-tab-label { color: var(--ink); }

      .tx-v-deep-space .tx-tab-label { color: #6b7a99; }
      .tx-v-deep-space .tx-tab.is-active .tx-tab-label { color: #e2e8f0; }

      .tx-tab-rate-btn {
        border: 1px solid rgba(0,0,0,0.18);
        background: transparent;
        color: var(--ink);
        padding: 0.4rem 0.85rem;
        font-family: ui-monospace, monospace;
        font-size: 0.65rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        cursor: pointer;
        white-space: nowrap;
        border-radius: 4px;
      }

      .tx-tab-rate-btn:hover {
        background: rgba(0,0,0,0.06);
      }

      .tx-v-deep-space .tx-tab-rate-btn {
        border-color: rgba(255,255,255,0.15);
        color: #e2e8f0;
      }

      /* ── Ranking overlay / sheet ────────────────────────────────────── */

      .tx-rank-overlay {
        position: fixed;
        inset: 0;
        z-index: 9998;
        background: rgba(0,0,0,0.45);
        display: flex;
        align-items: flex-end;
      }

      .tx-rank-sheet {
        width: 100%;
        max-height: 85vh;
        overflow-y: auto;
        background: var(--bg-surface);
        border-top: 3px solid var(--ink);
        padding: 1.5rem;
        padding-bottom: calc(1.5rem + 64px);
      }

      .tx-rank-sheet-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.35rem;
      }

      .tx-rank-sheet-title {
        font-family: ui-monospace, monospace;
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        margin: 0;
      }

      .tx-rank-close {
        border: 1px solid var(--rule);
        background: transparent;
        color: var(--fg-muted);
        padding: 0.25rem 0.6rem;
        font-size: 0.8rem;
        cursor: pointer;
        line-height: 1;
      }

      .tx-rank-sheet-sub {
        color: var(--fg-muted);
        font-family: ui-monospace, monospace;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin: 0 0 1rem;
      }

      .tx-rank-list {
        display: grid;
        gap: 0.45rem;
        margin: 0 0 1.25rem;
        padding: 0;
        list-style: none;
      }

      .tx-rank-item {
        display: grid;
        grid-template-columns: 1.75rem 2rem 1fr auto auto;
        align-items: center;
        gap: 0.65rem;
        border: 1px solid var(--rule);
        background: var(--bg-surface-warm);
        padding: 0.6rem 0.85rem;
      }

      .tx-rank-item.is-viewing {
        border-color: var(--ink);
        background: var(--bg-surface);
      }

      .tx-rank-pos {
        font-family: ui-monospace, monospace;
        font-size: 1rem;
        font-weight: 900;
        text-align: center;
      }

      .tx-rank-icon { font-size: 1.2rem; text-align: center; }

      .tx-rank-meta { display: grid; gap: 0.1rem; }
      .tx-rank-meta strong {
        font-family: ui-monospace, monospace;
        font-size: 0.7rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }
      .tx-rank-meta span {
        font-family: ui-monospace, monospace;
        font-size: 0.58rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--fg-muted);
      }

      .tx-rank-arrows { display: flex; flex-direction: column; gap: 0.15rem; }
      .tx-rank-arrows button {
        border: 1px solid var(--rule);
        background: var(--bg-surface);
        color: var(--ink);
        padding: 0.08rem 0.4rem;
        font-size: 0.75rem;
        cursor: pointer;
        line-height: 1.2;
      }
      .tx-rank-arrows button:disabled { opacity: 0.28; cursor: not-allowed; }
      .tx-rank-arrows button:not(:disabled):hover { border-color: var(--ink); }

      .tx-rank-preview-btn {
        border: 1px solid var(--rule);
        background: var(--bg-surface);
        color: var(--fg-muted);
        padding: 0.28rem 0.55rem;
        font-family: ui-monospace, monospace;
        font-size: 0.58rem;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        cursor: pointer;
        white-space: nowrap;
      }
      .tx-rank-preview-btn.is-active {
        border-color: var(--ink);
        background: var(--ink);
        color: #fff;
        cursor: default;
      }

      .tx-rank-sheet-foot { border-top: 1px solid var(--rule); padding-top: 1rem; }

      .tx-rank-submit-btn {
        border: 2px solid var(--ink);
        background: var(--ink);
        color: #fff;
        padding: 0.75rem 1.5rem;
        font-family: ui-monospace, monospace;
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        cursor: pointer;
      }

      .tx-rank-thanks {
        font-family: ui-monospace, monospace;
        font-size: 0.72rem;
        font-weight: 800;
        color: #22c55e;
        margin: 0;
      }

      /* ── Fade-in animation ──────────────────────────────────────────── */

      @keyframes txFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .tx-fade-in { animation: txFadeIn 0.35s ease both; }

      /* ════════════════════════════════════════════════════════════════
         VARIANT 1 — EDITORIAL (Newspaper)
         ════════════════════════════════════════════════════════════════ */

      .tx-ed {
        font-family: Georgia, "Times New Roman", serif;
        color: #16181c;
        background: #fffef9;
        max-width: 1180px;
        margin: 0 auto;
        padding: 0 1.5rem 3rem;
      }

      .tx-ed-mast {
        border-bottom: 4px double #16181c;
        padding: 1rem 0 0.75rem;
        text-align: center;
      }

      .tx-ed-mast-stripe {
        display: flex;
        justify-content: space-between;
        font-family: ui-monospace, monospace;
        font-size: 0.6rem;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #9099a4;
        border-bottom: 1px solid #d9dde3;
        padding-bottom: 0.45rem;
        margin-bottom: 0.65rem;
      }

      .tx-ed-mast-brand h1 {
        font-family: Georgia, serif;
        font-size: clamp(2.4rem, 7vw, 5rem);
        font-weight: 900;
        line-height: 1;
        letter-spacing: -0.02em;
        margin: 0;
      }

      .tx-ed-mast-sub {
        font-size: 0.55em;
        font-style: italic;
        display: block;
        letter-spacing: 0.08em;
        color: #5b636f;
        font-weight: 400;
      }

      .tx-ed-mast-tagline {
        font-size: 0.9rem;
        font-style: italic;
        color: #5b636f;
        margin: 0.35rem 0 0.65rem;
      }

      .tx-ed-mast-nav {
        display: flex;
        justify-content: center;
        gap: 2rem;
        border-top: 1px solid #d9dde3;
        padding-top: 0.65rem;
        margin-top: 0.25rem;
      }

      .tx-ed-mast-nav a {
        font-family: ui-monospace, monospace;
        font-size: 0.65rem;
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #16181c;
        text-decoration: none;
      }

      .tx-ed-mast-nav a:hover { text-decoration: underline; }

      .tx-ed-fold {
        display: grid;
        grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.65fr);
        gap: 2rem;
        border-bottom: 3px double #16181c;
        padding: 1.5rem 0 2rem;
        align-items: start;
      }

      .tx-ed-kicker {
        font-family: ui-monospace, monospace;
        font-size: 0.62rem;
        font-weight: 900;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #0a82b3;
        margin: 0 0 0.5rem;
      }

      .tx-ed-headline {
        font-size: clamp(1.6rem, 4vw, 2.8rem);
        font-weight: 900;
        line-height: 1.1;
        letter-spacing: -0.01em;
        margin: 0 0 0.45rem;
      }

      .tx-ed-byline {
        font-family: ui-monospace, monospace;
        font-size: 0.62rem;
        font-weight: 700;
        color: #9099a4;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin: 0 0 1rem;
      }

      .tx-ed-para {
        font-size: 1.08rem;
        line-height: 1.7;
        margin: 0 0 1rem;
        color: #2b2f36;
      }

      .tx-ed-pull {
        border-left: 4px solid #16181c;
        padding: 0.75rem 1.25rem;
        font-size: 1.25rem;
        font-style: italic;
        line-height: 1.45;
        color: #16181c;
        margin: 1.5rem 0;
        background: #f4efe6;
      }

      .tx-ed-sidebar { display: grid; gap: 1.25rem; }

      .tx-ed-box {
        border: 1px solid #d9dde3;
        border-top: 3px solid #16181c;
        background: #fff;
        padding: 1rem;
      }

      .tx-ed-box p { font-size: 0.92rem; line-height: 1.6; margin: 0 0 0.75rem; }

      .tx-ed-input {
        width: 100%;
        border: 1px solid #d9dde3;
        background: #fff;
        padding: 0.65rem 0.75rem;
        font-family: Georgia, serif;
        font-size: 0.92rem;
        box-sizing: border-box;
      }

      .tx-ed-btn {
        width: 100%;
        border: 2px solid #16181c;
        background: #16181c;
        color: #fff;
        padding: 0.65rem 1rem;
        font-family: ui-monospace, monospace;
        font-size: 0.68rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        cursor: pointer;
      }

      .tx-ed-btn:disabled { opacity: 0.55; cursor: not-allowed; }

      .tx-ed-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        border: 1px solid #d9dde3;
      }

      .tx-ed-stat {
        display: grid;
        gap: 0.2rem;
        padding: 0.85rem;
        border-right: 1px solid #d9dde3;
        text-align: center;
      }

      .tx-ed-stat:last-child { border-right: none; }

      .tx-ed-stat-n {
        font-family: ui-monospace, monospace;
        font-size: 1.5rem;
        font-weight: 900;
        color: #0a82b3;
        display: block;
      }

      .tx-ed-stat span:last-child {
        font-family: ui-monospace, monospace;
        font-size: 0.55rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #9099a4;
      }

      .tx-ed-brief {
        list-style: none;
        margin: 0.5rem 0 0;
        padding: 0;
        display: grid;
        gap: 0.45rem;
      }

      .tx-ed-brief li {
        font-size: 0.82rem;
        line-height: 1.5;
        padding-left: 1rem;
        position: relative;
        color: #2b2f36;
      }

      .tx-ed-brief li::before {
        content: "▸";
        position: absolute;
        left: 0;
        color: #0a82b3;
      }

      .tx-ed-rule-double { border: none; border-top: 3px double #16181c; margin: 0; }
      .tx-ed-rule { border: none; border-top: 1px solid #d9dde3; margin: 2rem 0; }

      .tx-ed-cols {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0;
        padding: 2rem 0;
      }

      .tx-ed-col {
        padding: 0 1.5rem;
        border-right: 1px solid #d9dde3;
        font-size: 0.95rem;
        line-height: 1.65;
        color: #2b2f36;
      }

      .tx-ed-col:first-child { padding-left: 0; }
      .tx-ed-col:last-child { padding-right: 0; border-right: none; }

      .tx-ed-col-head {
        font-size: 1.2rem;
        font-weight: 900;
        line-height: 1.2;
        margin: 0.35rem 0 0.85rem;
      }

      .tx-ed-col p { margin: 0 0 0.85rem; }

      .tx-ed-link {
        font-family: ui-monospace, monospace;
        font-size: 0.68rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #0a82b3;
        text-decoration: none;
      }

      .tx-ed-tag {
        display: inline-block;
        border: 1px solid #d9dde3;
        background: #f4efe6;
        padding: 0.25rem 0.5rem;
        font-family: ui-monospace, monospace;
        font-size: 0.6rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #5b636f;
      }

      .tx-ed-board { padding: 2rem 0; }
      .tx-ed-board-grid {
        display: flex;
        gap: 2.5rem;
        margin-top: 0.75rem;
        flex-wrap: wrap;
      }
      .tx-ed-board-member { display: grid; gap: 0.2rem; }
      .tx-ed-board-member strong { font-size: 1rem; }
      .tx-ed-board-member span {
        font-family: ui-monospace, monospace;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #5b636f;
      }

      /* ════════════════════════════════════════════════════════════════
         VARIANT 2 — COSMIC (Deep Space)
         ════════════════════════════════════════════════════════════════ */

      .tx-cos {
        background: #06061a;
        color: #dde4f0;
        min-height: 100vh;
        position: relative;
        overflow: hidden;
      }

      /* Star field layers */
      .tx-cos-stars,
      .tx-cos-stars::after {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 200vh;
        background-image:
          radial-gradient(1px 1px at 10% 8%, rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 32% 14%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 54% 5%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 76% 22%, rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 91% 11%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 21% 38%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 67% 42%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 44% 61%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 83% 55%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 15% 72%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 39% 85%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 62% 79%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 88% 91%, rgba(255,255,255,0.6) 0%, transparent 100%);
        pointer-events: none;
      }

      .tx-cos-stars-2 {
        background-image:
          radial-gradient(1.5px 1.5px at 7% 19%, rgba(200,180,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 28% 33%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 55% 27%, rgba(200,220,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 73% 48%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(2px 2px at 93% 35%, rgba(255,240,200,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 18% 52%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 46% 68%, rgba(200,180,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 79% 74%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(2px 2px at 35% 92%, rgba(255,240,200,0.4) 0%, transparent 100%);
        opacity: 0.7;
      }

      .tx-cos-stars-3 {
        background-image:
          radial-gradient(3px 3px at 12% 6%, rgba(180,200,255,0.7) 0%, transparent 100%),
          radial-gradient(2px 2px at 88% 17%, rgba(255,240,180,0.7) 0%, transparent 100%),
          radial-gradient(3px 3px at 45% 45%, rgba(200,180,255,0.6) 0%, transparent 100%),
          radial-gradient(2px 2px at 69% 88%, rgba(180,220,255,0.7) 0%, transparent 100%);
        opacity: 0.8;
      }

      .tx-cos-nav {
        position: relative;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 1180px;
        margin: 0 auto;
        padding: 1.25rem 1.5rem;
      }

      .tx-cos-nav-brand {
        font-family: ui-monospace, monospace;
        font-size: 0.75rem;
        font-weight: 900;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #a78bfa;
      }

      .tx-cos-nav-links {
        display: flex;
        gap: 1.75rem;
      }

      .tx-cos-nav-links a {
        font-family: ui-monospace, monospace;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #94a3b8;
        text-decoration: none;
      }

      .tx-cos-nav-links a:hover { color: #e2e8f0; }

      .tx-cos-hero {
        position: relative;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 80vh;
        padding: 4rem 1.5rem;
      }

      .tx-cos-hero-inner {
        text-align: center;
        max-width: 720px;
        position: relative;
        z-index: 2;
      }

      .tx-cos-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 0.65rem;
        font-family: ui-monospace, monospace;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #6b7a99;
        margin-bottom: 1.5rem;
      }

      .tx-cos-ping {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #7c3aed;
        box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4);
        animation: cosPing 2s infinite;
        display: inline-block;
        flex-shrink: 0;
      }

      @keyframes cosPing {
        0% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.5); }
        70% { box-shadow: 0 0 0 12px rgba(124, 58, 237, 0); }
        100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
      }

      .tx-cos-title {
        font-family: "Turret Road", ui-monospace, monospace;
        font-size: clamp(4rem, 12vw, 9rem);
        font-weight: 800;
        line-height: 0.9;
        letter-spacing: -0.02em;
        color: #e2e8f0;
        margin: 0 0 1.5rem;
      }

      .tx-cos-title em {
        font-style: italic;
        background: linear-gradient(135deg, #7c3aed, #a78bfa, #60a5fa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .tx-cos-sub {
        font-size: 1.15rem;
        line-height: 1.65;
        color: #94a3b8;
        max-width: 560px;
        margin: 0 auto 1.2rem;
      }

      .tx-cos-briefs {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin: 0 auto 2rem;
      }

      .tx-cos-briefs span {
        border: 1px solid rgba(167, 139, 250, 0.35);
        background: rgba(124, 58, 237, 0.12);
        color: #c4b5fd;
        padding: 0.35rem 0.65rem;
        font-family: ui-monospace, monospace;
        font-size: 0.62rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .tx-cos-form {
        display: flex;
        gap: 0.65rem;
        max-width: 480px;
        margin: 0 auto;
        flex-wrap: wrap;
        justify-content: center;
      }

      .tx-cos-input {
        flex: 1;
        min-width: 220px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.06);
        color: #e2e8f0;
        padding: 0.75rem 1rem;
        font-family: ui-monospace, monospace;
        font-size: 0.85rem;
        backdrop-filter: blur(8px);
      }

      .tx-cos-input::placeholder { color: #475569; }

      .tx-cos-btn {
        border: 1px solid #7c3aed;
        background: #7c3aed;
        color: #fff;
        padding: 0.75rem 1.5rem;
        font-family: ui-monospace, monospace;
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        cursor: pointer;
        white-space: nowrap;
      }

      .tx-cos-btn:disabled { opacity: 0.55; cursor: not-allowed; }

      .tx-cos-success {
        font-family: ui-monospace, monospace;
        font-size: 0.82rem;
        font-weight: 800;
        color: #a78bfa;
        letter-spacing: 0.08em;
        margin-top: 1rem;
      }

      .tx-cos-err { color: #f87171; font-size: 0.82rem; margin: 0.5rem 0 0; }

      /* Orbital rings */
      .tx-cos-orbit {
        position: absolute;
        border-radius: 50%;
        border: 1px solid rgba(124, 58, 237, 0.12);
        pointer-events: none;
      }
      .tx-cos-orbit-1 {
        width: 500px; height: 500px;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        animation: cosRotate 60s linear infinite;
      }
      .tx-cos-orbit-2 {
        width: 800px; height: 800px;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        border-color: rgba(96, 165, 250, 0.07);
        animation: cosRotate 100s linear infinite reverse;
      }

      @keyframes cosRotate { to { transform: translate(-50%, -50%) rotate(360deg); } }

      .tx-cos-stats {
        position: relative;
        z-index: 10;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1px;
        max-width: 1180px;
        margin: 0 auto;
        padding: 0 1.5rem 4rem;
        background: rgba(255,255,255,0.05);
      }

      .tx-cos-card {
        display: grid;
        gap: 0.3rem;
        padding: 2rem;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
        backdrop-filter: blur(8px);
        text-align: center;
      }

      .tx-cos-card-n {
        font-family: ui-monospace, monospace;
        font-size: 2.5rem;
        font-weight: 900;
        color: #a78bfa;
        display: block;
      }

      .tx-cos-card-label {
        font-family: ui-monospace, monospace;
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #e2e8f0;
        display: block;
      }

      .tx-cos-card-sub {
        font-size: 0.82rem;
        color: #475569;
        display: block;
      }

      .tx-cos-log {
        position: relative;
        z-index: 10;
        max-width: 1180px;
        margin: 0 auto;
        padding: 3rem 1.5rem;
        border-top: 1px solid rgba(255,255,255,0.06);
      }

      .tx-cos-log-kicker {
        font-family: ui-monospace, monospace;
        font-size: 0.62rem;
        font-weight: 900;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #475569;
        margin: 0 0 1.5rem;
      }

      .tx-cos-log-grid { display: grid; gap: 1px; }

      .tx-cos-log-item {
        display: grid;
        grid-template-columns: 5rem 1fr auto;
        gap: 1.25rem;
        align-items: start;
        padding: 1.25rem;
        border: 1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.02);
      }

      .tx-cos-log-id {
        font-family: ui-monospace, monospace;
        font-size: 0.65rem;
        font-weight: 900;
        letter-spacing: 0.12em;
        color: #475569;
        padding-top: 0.2rem;
      }

      .tx-cos-log-item h3 {
        font-size: 1.05rem;
        font-weight: 700;
        color: #e2e8f0;
        margin: 0 0 0.5rem;
      }

      .tx-cos-log-item p {
        font-size: 0.88rem;
        line-height: 1.6;
        color: #6b7a99;
        margin: 0 0 0.65rem;
      }

      .tx-cos-link {
        font-family: ui-monospace, monospace;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #a78bfa;
        text-decoration: none;
      }

      .tx-cos-status {
        font-family: ui-monospace, monospace;
        font-size: 0.6rem;
        font-weight: 900;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #475569;
        border: 1px solid currentColor;
        padding: 0.25rem 0.5rem;
        white-space: nowrap;
        align-self: start;
      }

      .tx-cos-status-live { color: #4ade80; border-color: #4ade80; }

      .tx-cos-crew {
        position: relative;
        z-index: 10;
        max-width: 1180px;
        margin: 0 auto;
        padding: 3rem 1.5rem;
        border-top: 1px solid rgba(255,255,255,0.06);
      }

      .tx-cos-crew-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1px;
        margin-top: 1.5rem;
        background: rgba(255,255,255,0.05);
      }

      .tx-cos-crew-card {
        display: grid;
        gap: 0.3rem;
        padding: 1.25rem;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.06);
      }

      .tx-cos-crew-callsign {
        font-family: ui-monospace, monospace;
        font-size: 0.6rem;
        font-weight: 900;
        letter-spacing: 0.16em;
        color: #475569;
        text-transform: uppercase;
      }

      .tx-cos-crew-card strong {
        font-size: 1.05rem;
        color: #e2e8f0;
      }

      .tx-cos-crew-card span {
        font-family: ui-monospace, monospace;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #6b7a99;
      }


      /* ════════════════════════════════════════════════════════════════
         VARIANT 4 — SOLAR (Explorer Magazine)
         ════════════════════════════════════════════════════════════════ */

      .tx-sol {
        background: #fffbf2;
        color: #1c0e04;
        font-family: Georgia, "Times New Roman", serif;
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 1.5rem 3rem;
      }

      .tx-sol-top-rule {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        padding: 0.85rem 0;
        border-bottom: 2px solid #c27a0e;
        font-family: ui-monospace, monospace;
        font-size: 0.6rem;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #9a7040;
        flex-wrap: wrap;
      }

      .tx-sol-header {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(220px, 0.6fr);
        gap: 3rem;
        align-items: start;
        padding: 3rem 0 2.5rem;
        border-bottom: 1px solid #d4a76a;
      }

      .tx-sol-category {
        font-family: ui-monospace, monospace;
        font-size: 0.62rem;
        font-weight: 900;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #c27a0e;
        margin: 0 0 0.85rem;
      }

      .tx-sol-title {
        font-size: clamp(4rem, 11vw, 8rem);
        font-weight: 900;
        line-height: 0.9;
        letter-spacing: -0.03em;
        margin: 0 0 1.25rem;
        color: #1c0e04;
      }

      .tx-sol-title em {
        font-style: italic;
        color: #c27a0e;
      }

      .tx-sol-standfirst {
        font-size: 1.2rem;
        line-height: 1.65;
        color: #3d2010;
        max-width: 58ch;
        margin: 0;
      }

      .tx-sol-header-aside { display: grid; gap: 1rem; }

      .tx-sol-field-note {
        border-left: 3px solid #c27a0e;
        padding: 0.65rem 0.85rem;
        background: rgba(194, 122, 14, 0.06);
      }

      .tx-sol-note-label {
        font-family: ui-monospace, monospace;
        font-size: 0.6rem;
        font-weight: 900;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #c27a0e;
        margin: 0 0 0.35rem;
      }

      .tx-sol-field-note p {
        font-size: 0.88rem;
        line-height: 1.6;
        margin: 0;
        color: #6b4c2a;
      }

      .tx-sol-divider {
        text-align: center;
        color: #c27a0e;
        letter-spacing: 0.6em;
        font-size: 0.9rem;
        padding: 1.5rem 0;
        border-top: 1px solid #d4a76a;
        border-bottom: 1px solid #d4a76a;
        margin: 2rem 0;
      }

      .tx-sol-body {
        display: grid;
        grid-template-columns: minmax(0, 1.5fr) minmax(220px, 0.65fr);
        gap: 3rem;
        align-items: start;
      }

      .tx-sol-text { max-width: 68ch; }

      .tx-sol-section-head {
        font-size: 1.6rem;
        font-weight: 900;
        letter-spacing: -0.01em;
        margin: 2rem 0 0.85rem;
        padding-bottom: 0.45rem;
        border-bottom: 2px solid #1c0e04;
      }

      .tx-sol-section-head:first-child { margin-top: 0; }

      .tx-sol-drop-cap::first-letter {
        float: left;
        font-size: 4.5rem;
        line-height: 0.8;
        padding-right: 0.1em;
        font-weight: 900;
        color: #c27a0e;
      }

      .tx-sol-text p {
        font-size: 1.05rem;
        line-height: 1.75;
        margin: 0 0 1.1rem;
        color: #2c1a08;
      }

      .tx-sol-blockquote {
        margin: 2rem 0;
        padding: 1.25rem 1.5rem;
        border-left: 4px solid #c27a0e;
        background: rgba(194, 122, 14, 0.07);
      }

      .tx-sol-blockquote p {
        font-size: 1.25rem;
        font-style: italic;
        line-height: 1.55;
        margin: 0;
        color: #1c0e04;
      }

      .tx-sol-expeditions { display: grid; gap: 1.5rem; margin-top: 1rem; }

      .tx-sol-expedition {
        display: grid;
        grid-template-columns: 2.5rem 1fr;
        gap: 1rem;
        border-top: 1px solid #d4a76a;
        padding-top: 1.25rem;
      }

      .tx-sol-exp-num {
        font-family: Georgia, serif;
        font-size: 2.5rem;
        font-weight: 900;
        color: #d4a76a;
        line-height: 1;
      }

      .tx-sol-expedition h3 {
        font-size: 1.25rem;
        font-weight: 900;
        margin: 0 0 0.2rem;
      }

      .tx-sol-exp-status {
        font-family: ui-monospace, monospace;
        font-size: 0.6rem;
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #c27a0e;
        margin: 0 0 0.65rem;
      }

      .tx-sol-expedition p {
        font-size: 0.95rem;
        line-height: 1.65;
        color: #6b4c2a;
        margin: 0 0 0.65rem;
      }

      .tx-sol-link {
        font-family: ui-monospace, monospace;
        font-size: 0.65rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #c27a0e;
        text-decoration: none;
      }

      .tx-sol-margin { display: grid; gap: 1.5rem; align-content: start; }

      .tx-sol-margin-block {
        border: 1px solid #d4a76a;
        background: #fff8ee;
        padding: 1rem;
      }

      .tx-sol-margin-block .tx-sol-note-label { margin-bottom: 0.55rem; }
      .tx-sol-margin-block p { font-size: 0.92rem; line-height: 1.6; color: #6b4c2a; }

      .tx-sol-margin-quote p {
        font-style: italic;
        font-size: 1.05rem;
        color: #1c0e04;
        line-height: 1.55;
      }

      .tx-sol-input {
        width: 100%;
        border: 1px solid #d4a76a;
        background: #fff;
        color: #1c0e04;
        padding: 0.65rem 0.75rem;
        font-family: Georgia, serif;
        font-size: 0.92rem;
        box-sizing: border-box;
      }

      .tx-sol-btn {
        width: 100%;
        border: 2px solid #c27a0e;
        background: #c27a0e;
        color: #fff;
        padding: 0.65rem 1rem;
        font-family: ui-monospace, monospace;
        font-size: 0.68rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        cursor: pointer;
      }

      .tx-sol-btn:disabled { opacity: 0.55; cursor: not-allowed; }

      .tx-sol-crew-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.35rem;
      }

      .tx-sol-crew-list li { font-size: 0.9rem; color: #6b4c2a; line-height: 1.5; }
      .tx-sol-crew-list strong { color: #1c0e04; }

      .tx-sol-footer {
        border-top: 2px solid #c27a0e;
        padding: 1rem 0;
        font-family: ui-monospace, monospace;
        font-size: 0.62rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #9a7040;
        text-align: center;
        margin-top: 2rem;
      }

      /* ════════════════════════════════════════════════════════════════
         VARIANT 5 — MINIMAL (Brutalist)
         ════════════════════════════════════════════════════════════════ */

      .tx-min {
        background: #fff;
        color: #000;
        max-width: 640px;
        margin: 0 auto;
        padding: 3rem 1.5rem 4rem;
        font-family: -apple-system, "Helvetica Neue", Arial, sans-serif;
      }

      .tx-min-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        border-bottom: 2px solid #000;
        padding-bottom: 1rem;
        margin-bottom: 2.5rem;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .tx-min-brand {
        font-size: 1rem;
        font-weight: 700;
        letter-spacing: -0.01em;
      }

      .tx-min-status {
        font-size: 0.75rem;
        color: #555;
        font-weight: 400;
      }

      .tx-min-h1 {
        font-size: clamp(2rem, 6vw, 3.2rem);
        font-weight: 700;
        line-height: 1.15;
        letter-spacing: -0.02em;
        margin: 0 0 2rem;
        color: #000;
      }

      .tx-min-form {
        display: flex;
        gap: 0;
        margin-bottom: 2.5rem;
      }

      .tx-min-input {
        flex: 1;
        border: 1.5px solid #000;
        border-right: none;
        background: #fff;
        color: #000;
        padding: 0.75rem 1rem;
        font-family: inherit;
        font-size: 1rem;
        outline: none;
      }

      .tx-min-input:focus { background: #f9f9f9; }

      .tx-min-btn {
        border: 1.5px solid #000;
        background: #000;
        color: #fff;
        padding: 0.75rem 1.25rem;
        font-family: inherit;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
      }

      .tx-min-btn:disabled { opacity: 0.55; cursor: not-allowed; }

      .tx-min-sent {
        margin-bottom: 2.5rem;
        font-size: 0.9rem;
        font-weight: 600;
        color: #555;
      }

      .tx-min-err { color: #c00; font-size: 0.82rem; margin: 0.5rem 0 0; }

      .tx-min-body { margin-bottom: 0; }

      .tx-min-body p {
        font-size: 1rem;
        line-height: 1.7;
        color: #222;
        margin: 0 0 1.1rem;
      }

      .tx-min-rule {
        border: none;
        border-top: 1px solid #ddd;
        margin: 2rem 0;
      }

      .tx-min-h2 {
        font-size: 1rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin: 0 0 0.85rem;
        color: #000;
      }

      .tx-min-list {
        margin: 0 0 1.5rem;
        padding-left: 1.25rem;
        display: grid;
        gap: 0.35rem;
      }

      .tx-min-list li {
        font-size: 0.95rem;
        line-height: 1.6;
        color: #222;
      }

      .tx-min-team {
        display: grid;
        gap: 0.65rem;
        margin: 0;
      }

      .tx-min-team > div {
        display: flex;
        gap: 1rem;
        align-items: baseline;
      }

      .tx-min-team dt {
        font-weight: 700;
        font-size: 0.95rem;
        white-space: nowrap;
      }

      .tx-min-team dd {
        font-size: 0.88rem;
        color: #555;
        margin: 0;
      }

      .tx-min-cta-copy {
        font-size: 0.95rem;
        color: #555;
        margin: 0 0 1rem;
      }

      .tx-min-foot {
        border-top: 1px solid #ddd;
        margin-top: 3rem;
        padding-top: 1rem;
        display: flex;
        gap: 0.75rem;
        font-size: 0.8rem;
        color: #999;
        flex-wrap: wrap;
      }

      .tx-min-foot a { color: #555; text-decoration: none; }
      .tx-min-foot a:hover { text-decoration: underline; }

      /* ── Footer ─────────────────────────────────────────────────────── */

      .tx-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.5rem;
        border-top: 2px solid #d9dde3;
        background: #fffef9;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 64px; /* above sticky tab bar */
      }

      .tx-footer-brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .tx-footer-brand > span {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
      }

      .tx-footer-brand strong {
        font-family: Georgia, serif;
        font-size: 0.92rem;
        color: #16181c;
      }

      .tx-footer-brand em { font-style: italic; }

      .tx-footer-brand > span > span {
        font-family: ui-monospace, monospace;
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #9099a4;
      }

      .tx-footer-links {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
        align-items: center;
      }

      .tx-footer-links a {
        font-family: ui-monospace, monospace;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #5b636f;
        text-decoration: none;
      }

      .tx-footer-links a:hover { color: #16181c; text-decoration: underline; }

      /* Dark variant footer */
      .tx-v-deep-space .tx-footer {
        background: #06061a;
        border-top-color: rgba(255,255,255,0.08);
      }
      .tx-v-deep-space .tx-footer-brand strong { color: #e2e8f0; }
      .tx-v-deep-space .tx-footer-brand > span > span { color: #475569; }
      .tx-v-deep-space .tx-footer-links a { color: #6b7a99; }
      .tx-v-deep-space .tx-footer-links a:hover { color: #e2e8f0; }

      .tx-v-solar .tx-footer { background: #fffbf2; border-top-color: #c27a0e; }
      .tx-v-solar .tx-footer-links a { color: #9a7040; }
      .tx-v-solar .tx-footer-links a:hover { color: #1c0e04; }

      /* ── Responsive ─────────────────────────────────────────────────── */

      @media (max-width: 860px) {
        .tx-public-title-row {
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .tx-public-title-row .tx-status {
          position: static;
          transform: none;
        }
        .tx-public-nav-row {
          overflow-x: auto;
          scrollbar-width: none;
        }
        .tx-public-nav-row::-webkit-scrollbar {
          display: none;
        }
        .tx-public-nav-primary,
        .tx-public-nav-secondary {
          justify-content: flex-start;
          white-space: nowrap;
        }
        .tx-live { min-height: auto; }
        .tx-live-grid,
        .tx-live-bottom,
        .tx-live-apod,
        .tx-briefing-submit {
          grid-template-columns: 1fr;
        }
        .tx-live-event-list { grid-template-columns: 1fr; }
        .tx-live-image-wrap,
        .tx-live-image {
          min-height: 280px;
        }
        .tx-briefing-question {
          grid-template-columns: 1fr;
          gap: 0.45rem;
          align-items: start;
        }
        .tx-ed-fold { grid-template-columns: 1fr; }
        .tx-ed-cols { grid-template-columns: 1fr; }
        .tx-ed-col { padding: 0; border-right: none; border-bottom: 1px solid #d9dde3; padding-bottom: 1.5rem; margin-bottom: 0.5rem; }
        .tx-ed-mast-stripe { flex-wrap: wrap; gap: 0.35rem; justify-content: center; }
        .tx-ed-mast-nav { flex-wrap: wrap; gap: 1rem; }
        .tx-cos-stats { grid-template-columns: 1fr; }
        .tx-cos-crew-grid { grid-template-columns: 1fr; }
        .tx-cos-log-item { grid-template-columns: 1fr; }
        .tx-sol-header { grid-template-columns: 1fr; }
        .tx-sol-body { grid-template-columns: 1fr; }
        .tx-sol-title { font-size: clamp(3rem, 9vw, 6rem); }
      }

      @media (max-width: 520px) {
        .tx-section { padding: 1.25rem 1rem; }
        .tx-public-mast {
          padding-left: 1rem;
          padding-right: 1rem;
          margin-top: 0.5rem;
        }
        .tx-brand-public img {
          width: 34px;
          height: 34px;
        }
        .tx-brand-public strong {
          font-size: 1.45rem;
        }
        .tx-brand-public span span {
          display: none;
        }
        .tx-public-title-row .tx-status {
          display: none;
        }
        .tx-public-nav {
          gap: 0.8rem;
        }
        .tx-live-head,
        .tx-briefing-head {
          display: grid;
        }
        .tx-live-status {
          justify-items: start;
        }
        .tx-live-apod-copy,
        .tx-live-card,
        .tx-live-events,
        .tx-live-network,
        .tx-briefing-panel {
          padding: 0.85rem;
        }
        .tx-live-local {
          grid-template-columns: 1fr;
        }
        .tx-live-ticker {
          grid-template-columns: 1fr;
        }
        .tx-chip-row {
          gap: 0.4rem;
        }
        /* Tab bar — 4 tabs fit well; shrink padding slightly */
        .tx-tab-rate-btn { padding: 0.45rem 0.65rem; flex-shrink: 0; }
        .tx-tab-label { font-size: 0.52rem; }
        .tx-tab { padding: 0.4rem 0.55rem; }

        /* Ranking sheet — touch-friendly arrows; hide preview btn */
        .tx-rank-item { grid-template-columns: 1.5rem 1.6rem 1fr auto; gap: 0.45rem; }
        .tx-rank-arrows { display: flex; flex-direction: row; gap: 0.4rem; }
        .tx-rank-arrows button { padding: 0.6rem 0.75rem; font-size: 1rem; min-width: 2.75rem; min-height: 2.75rem; }
        .tx-rank-preview-btn { display: none; }

        /* Editorial */
        .tx-ed { padding: 0 1rem 2rem; }
        .tx-ed-mast-stripe { display: none; }
        .tx-ed-mast-nav { gap: 0.65rem; }
        .tx-ed-mast-nav a { font-size: 0.58rem; }
        .tx-ed-pull { font-size: 1.05rem; padding: 0.6rem 0.9rem; }

        /* Cosmic */
        .tx-cos-nav { padding: 1rem; }
        .tx-cos-nav-links { display: none; }
        .tx-cos-hero { padding: 2rem 1rem; }
        .tx-cos-stats { padding: 0 1rem 2rem; }
        .tx-cos-log { padding: 2rem 1rem; }
        .tx-cos-crew { padding: 2rem 1rem; }
        .tx-cos-form { flex-direction: column; align-items: stretch; }
        .tx-cos-input { min-width: 0; }
        .tx-cos-btn { width: 100%; }

        /* Solar */
        .tx-sol { padding: 0 1rem 2rem; }
        .tx-sol-title { font-size: clamp(2.5rem, 9vw, 4rem); }
        .tx-sol-drop-cap::first-letter { font-size: 2.5rem; }
        .tx-sol-header { padding: 1.5rem 0 1.5rem; }
        .tx-sol-top-rule { display: none; }

        /* Minimal */
        .tx-min { padding: 1.5rem 1rem 4rem; }
        .tx-min-form { flex-direction: column; }
        .tx-min-input { border-right: 1.5px solid #000; border-bottom: none; }
        .tx-min-btn { width: 100%; }

        /* Footer */
        .tx-footer { padding: 1rem; flex-direction: column; align-items: flex-start; }
      }

      @media (max-width: 380px) {
        /* Very narrow: hide Style Lab label, tighten inner layout */
        .tx-tab-bar-label { display: none; }
        .tx-tab-bar-inner { grid-template-columns: 1fr auto; }
        .tx-tab { padding: 0.35rem 0.4rem; }
        .tx-tab-label { font-size: 0.48rem; }
        .tx-ed-stats { grid-template-columns: 1fr; }
        .tx-ed-stat { border-right: none; border-bottom: 1px solid #d9dde3; }
        .tx-ed-stat:last-child { border-bottom: none; }
      }

      /* ── Dark mode overrides ────────────────────────────────────────── */

      [data-theme="dark"] .tx-tab-bar {
        background: rgba(17, 19, 22, 0.95);
        border-top-color: rgba(255,255,255,0.08);
      }
      [data-theme="dark"] .tx-tab.is-active {
        background: rgba(255,255,255,0.08);
        border-color: rgba(255,255,255,0.15);
      }
      [data-theme="dark"] .tx-tab-rate-btn {
        border-color: rgba(255,255,255,0.15);
      }
      [data-theme="dark"] .tx-tab-rate-btn:hover { background: rgba(255,255,255,0.07); }

      [data-theme="dark"] .tx-chip.is-active { background: #ecedf0; border-color: #ecedf0; color: #111316; }
      [data-theme="dark"] .tx-rank-item.is-viewing { border-color: #6ec0e3; }
      [data-theme="dark"] .tx-rank-preview-btn.is-active { background: #0e2832; color: #6ec0e3; border-color: #6ec0e3; }
      [data-theme="dark"] .tx-rank-submit-btn { background: #ecedf0; border-color: #ecedf0; color: #111316; }
      [data-theme="dark"] .tx-rank-overlay { background: rgba(0,0,0,0.65); }

      /* Editorial dark */
      [data-theme="dark"] .tx-ed {
        background: #111316;
        color: #ecedf0;
      }
      [data-theme="dark"] .tx-ed-mast,
      [data-theme="dark"] .tx-ed-fold,
      [data-theme="dark"] .tx-ed-rule-double { border-color: #2a2f37; }
      [data-theme="dark"] .tx-ed-mast-brand h1,
      [data-theme="dark"] .tx-ed-headline,
      [data-theme="dark"] .tx-ed-col-head,
      [data-theme="dark"] .tx-ed-board-member strong { color: #ecedf0; }
      [data-theme="dark"] .tx-ed-mast-sub,
      [data-theme="dark"] .tx-ed-mast-tagline,
      [data-theme="dark"] .tx-ed-board-member span { color: #a7adb8; }
      [data-theme="dark"] .tx-ed-mast-stripe {
        background: transparent;
        border-bottom-color: #2a2f37;
        color: #8a93a0;
      }
      [data-theme="dark"] .tx-ed-mast-nav { border-top-color: #2a2f37; }
      [data-theme="dark"] .tx-ed-mast-nav a { color: #8a93a0; }
      [data-theme="dark"] .tx-ed-mast-nav a:hover { color: #ecedf0; }
      [data-theme="dark"] .tx-ed-byline { color: #5e6671; }
      [data-theme="dark"] .tx-ed-para,
      [data-theme="dark"] .tx-ed-col,
      [data-theme="dark"] .tx-ed-brief li { color: #c5c9d2; }
      [data-theme="dark"] .tx-ed-pull {
        border-left-color: #6ec0e3;
        background: #1a1d22;
        color: #ecedf0;
      }
      [data-theme="dark"] .tx-ed-box {
        background: #1a1d22;
        border-color: #2a2f37;
        border-top-color: #6ec0e3;
        color: #ecedf0;
      }
      [data-theme="dark"] .tx-ed-box p { color: #c5c9d2; }
      [data-theme="dark"] .tx-ed-input {
        background: #1a1d22;
        border-color: #2a2f37;
        color: #ecedf0;
      }
      [data-theme="dark"] .tx-ed-input::placeholder { color: #5e6671; }
      [data-theme="dark"] .tx-ed-btn {
        background: #ecedf0;
        color: #111316;
        border-color: #ecedf0;
      }
      [data-theme="dark"] .tx-ed-stats,
      [data-theme="dark"] .tx-ed-stat,
      [data-theme="dark"] .tx-ed-col,
      [data-theme="dark"] .tx-ed-rule { border-color: #2a2f37; }
      [data-theme="dark"] .tx-ed-tag {
        background: #1a1d22;
        border-color: #2a2f37;
        color: #a7adb8;
      }

      [data-theme="light"] .tx-cos {
        background:
          radial-gradient(circle at 50% 15%, rgba(255,255,255,0.98), rgba(219,234,254,0.88) 35%, rgba(186,230,253,0.72) 70%),
          #dff5ff;
        color: #0f172a;
      }
      [data-theme="light"] .tx-cos-nav-brand,
      [data-theme="light"] .tx-cos-card-n,
      [data-theme="light"] .tx-cos-link,
      [data-theme="light"] .tx-cos-success { color: #0369a1; }
      [data-theme="light"] .tx-cos-nav-links a,
      [data-theme="light"] .tx-cos-eyebrow,
      [data-theme="light"] .tx-cos-card-sub,
      [data-theme="light"] .tx-cos-log-kicker,
      [data-theme="light"] .tx-cos-log-id,
      [data-theme="light"] .tx-cos-crew-callsign,
      [data-theme="light"] .tx-cos-crew-card span { color: #475569; }
      [data-theme="light"] .tx-cos-title,
      [data-theme="light"] .tx-cos-card-label,
      [data-theme="light"] .tx-cos-log-item h3,
      [data-theme="light"] .tx-cos-crew-card strong { color: #0f172a; }
      [data-theme="light"] .tx-cos-title em {
        background: linear-gradient(135deg, #f59e0b, #0284c7, #7c3aed);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      [data-theme="light"] .tx-cos-sub,
      [data-theme="light"] .tx-cos-log-item p { color: #334155; }
      [data-theme="light"] .tx-cos-card,
      [data-theme="light"] .tx-cos-log-item,
      [data-theme="light"] .tx-cos-crew-card {
        background: rgba(255,255,255,0.6);
        border-color: rgba(15, 23, 42, 0.12);
      }
      [data-theme="light"] .tx-cos-stats,
      [data-theme="light"] .tx-cos-crew-grid { background: rgba(15, 23, 42, 0.08); }
      [data-theme="light"] .tx-cos-input {
        background: rgba(255,255,255,0.72);
        border-color: rgba(15, 23, 42, 0.18);
        color: #0f172a;
      }
      [data-theme="light"] .tx-cos-input::placeholder { color: #64748b; }
      [data-theme="light"] .tx-cos-btn {
        background: #0369a1;
        border-color: #0369a1;
      }
      [data-theme="light"] .tx-cos-briefs span {
        background: rgba(255,255,255,0.72);
        border-color: rgba(3, 105, 161, 0.24);
        color: #0369a1;
      }

      /* Solar dark */
      [data-theme="dark"] .tx-sol {
        background: #111316;
        color: #ecedf0;
      }
      [data-theme="dark"] .tx-sol-title,
      [data-theme="dark"] .tx-sol-section-head,
      [data-theme="dark"] .tx-sol-blockquote p,
      [data-theme="dark"] .tx-sol-expedition h3,
      [data-theme="dark"] .tx-sol-margin-quote p { color: #ecedf0; }
      [data-theme="dark"] .tx-sol-title em,
      [data-theme="dark"] .tx-sol-category,
      [data-theme="dark"] .tx-sol-note-label,
      [data-theme="dark"] .tx-sol-link,
      [data-theme="dark"] .tx-sol-divider { color: #6ec0e3; }
      [data-theme="dark"] .tx-sol-drop-cap::first-letter,
      [data-theme="dark"] .tx-sol-exp-num { color: #6ec0e3; }
      [data-theme="dark"] .tx-sol-top-rule,
      [data-theme="dark"] .tx-sol-header,
      [data-theme="dark"] .tx-sol-divider,
      [data-theme="dark"] .tx-sol-section-head,
      [data-theme="dark"] .tx-sol-expedition,
      [data-theme="dark"] .tx-sol-footer { border-color: #2a2f37; }
      [data-theme="dark"] .tx-sol-top-rule,
      [data-theme="dark"] .tx-sol-footer { color: #8a93a0; }
      [data-theme="dark"] .tx-sol-header { border-bottom-color: #2a2f37; }
      [data-theme="dark"] .tx-sol-standfirst,
      [data-theme="dark"] .tx-sol-text p,
      [data-theme="dark"] .tx-sol-expedition p,
      [data-theme="dark"] .tx-sol-field-note p { color: #c5c9d2; }
      [data-theme="dark"] .tx-sol-field-note,
      [data-theme="dark"] .tx-sol-blockquote {
        background: #1a1d22;
        border-color: #6ec0e3;
      }
      [data-theme="dark"] .tx-sol-margin-block {
        background: #1a1d22;
        border-color: #2a2f37;
      }
      [data-theme="dark"] .tx-sol-margin-block p { color: #8a93a0; }
      [data-theme="dark"] .tx-sol-crew-list li { color: #c5c9d2; }
      [data-theme="dark"] .tx-sol-crew-list strong { color: #ecedf0; }
      [data-theme="dark"] .tx-sol-body { color: #c5c9d2; }
      [data-theme="dark"] .tx-sol-input {
        background: #1a1d22;
        border-color: #2a2f37;
        color: #ecedf0;
      }
      [data-theme="dark"] .tx-sol-btn {
        background: #ecedf0;
        color: #111316;
        border-color: #ecedf0;
      }

      /* Minimal dark */
      [data-theme="dark"] .tx-min {
        background: #111316;
        color: #ecedf0;
      }
      [data-theme="dark"] .tx-min-header { border-bottom-color: #ecedf0; }
      [data-theme="dark"] .tx-min-brand,
      [data-theme="dark"] .tx-min-h1,
      [data-theme="dark"] .tx-min-h2,
      [data-theme="dark"] .tx-min-team dt { color: #ecedf0; }
      [data-theme="dark"] .tx-min-status,
      [data-theme="dark"] .tx-min-sent,
      [data-theme="dark"] .tx-min-team dd,
      [data-theme="dark"] .tx-min-cta-copy { color: #a7adb8; }
      [data-theme="dark"] .tx-min-body p,
      [data-theme="dark"] .tx-min-list li { color: #c5c9d2; }
      [data-theme="dark"] .tx-min-rule { border-top-color: #2a2f37; }
      [data-theme="dark"] .tx-min-input {
        background: #1a1d22;
        border-color: #ecedf0;
        color: #ecedf0;
      }
      [data-theme="dark"] .tx-min-input::placeholder { color: #5e6671; }
      [data-theme="dark"] .tx-min-btn {
        background: #ecedf0;
        color: #111316;
      }
      [data-theme="dark"] .tx-min-foot { border-top-color: #2a2f37; color: #5e6671; }
      [data-theme="dark"] .tx-min-foot a { color: #8a93a0; }
    `}</style>
  );
}
