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
      className="button theme-toggle-btn"
      data-cy="theme-toggle"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <span className="technical-readout">{isDark ? "DRK" : "LGT"}</span>
    </button>
  );
}
