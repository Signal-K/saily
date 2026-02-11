"use client";

import { useEffect, useState } from "react";
import * as Switch from "@radix-ui/react-switch";

type Theme = "light" | "dark";

const THEME_COOKIE = "daily_grid_theme";
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
    <Switch.Root
      className="theme-switch"
      data-cy="theme-toggle"
      checked={isDark}
      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <span className="theme-switch-bg" aria-hidden>
        <span className="theme-layer theme-layer-1" />
        <span className="theme-layer theme-layer-2" />
        <span className="theme-layer theme-layer-3" />
        <span className="theme-stars" />
        <span className="theme-cloud theme-cloud-1" />
        <span className="theme-cloud theme-cloud-2" />
        <span className="theme-cloud theme-cloud-3" />
      </span>
      <Switch.Thumb className="theme-switch-thumb">
        <span className="theme-switch-moon-craters" />
      </Switch.Thumb>
    </Switch.Root>
  );
}
