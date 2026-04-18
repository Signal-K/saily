"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_COOKIE = "cosmo_theme";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.cookie = `${THEME_COOKIE}=${theme}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function ThemeToggle({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      className="theme-toggle"
      data-cy="theme-toggle"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      role="switch"
      aria-checked={isDark}
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-icon theme-toggle-sun" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </span>
        <span className="theme-toggle-thumb" />
        <span className="theme-toggle-icon theme-toggle-moon" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>
      </span>
      <style jsx>{`
        .theme-toggle {
          display: inline-flex;
          align-items: center;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }
        .theme-toggle-track {
          position: relative;
          display: flex;
          align-items: center;
          width: 56px;
          height: 28px;
          border-radius: 14px;
          background: ${isDark ? "var(--surface-container-high, #2a2d36)" : "var(--surface-container-high, #e8eaf0)"};
          border: 1.5px solid var(--border, rgba(0,0,0,0.15));
          transition: background 0.25s;
          padding: 0 4px;
          justify-content: space-between;
        }
        .theme-toggle-thumb {
          position: absolute;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--primary, #6366f1);
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          left: ${isDark ? "30px" : "3px"};
          top: 2px;
        }
        .theme-toggle-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          z-index: 1;
          transition: opacity 0.2s, color 0.2s;
        }
        .theme-toggle-sun {
          color: ${isDark ? "var(--muted, #888)" : "var(--primary, #6366f1)"};
          opacity: ${isDark ? "0.4" : "1"};
        }
        .theme-toggle-moon {
          color: ${isDark ? "var(--primary, #6366f1)" : "var(--muted, #888)"};
          opacity: ${isDark ? "1" : "0.4"};
        }
      `}</style>
    </button>
  );
}
