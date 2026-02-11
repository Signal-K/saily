import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { SWRegister } from "@/components/sw-register";
import { AuthStatus } from "@/components/auth-status";
import { HeaderSearch } from "@/components/header-search";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

const THEME_COOKIE = "daily_grid_theme";

type Theme = "light" | "dark";

function normalizeTheme(value: string | undefined): Theme {
  return value === "dark" ? "dark" : "light";
}

export const metadata: Metadata = {
  title: "Daily Grid",
  description: "NYT-style daily game hub built with Next.js + Supabase",
  manifest: "/manifest.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialTheme = normalizeTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <html lang="en" data-theme={initialTheme}>
      <body>
        <SWRegister />
        <header className="site-header">
          <div className="container">
            <div className="header-shell">
              <div className="header-top-row">
                <div className="header-brand-row">
                  <Link href="/" className="home-icon-link" aria-label="Go home">
                    <span aria-hidden>⌂</span>
                  </Link>
                  <nav className="nav-links desktop-nav" aria-label="Main navigation">
                    <Link href="/games/today" className="header-nav-link" data-cy="nav-today">
                      Today&apos;s Puzzle
                    </Link>
                    <Link href="/calendar" className="header-nav-link" data-cy="nav-calendar">
                      Calendar
                    </Link>
                    <Link href="/discuss" className="header-nav-link" data-cy="nav-discuss">
                      Discuss
                    </Link>
                  </nav>
                </div>

                <HeaderSearch />

                <div className="header-actions">
                  <ThemeToggle initialTheme={initialTheme} />
                  <AuthStatus />
                </div>
              </div>

              <nav className="nav-links mobile-nav" aria-label="Mobile navigation">
                <Link href="/games/today" className="header-nav-link" data-cy="nav-today-mobile">
                  Today&apos;s Puzzle
                </Link>
                <Link href="/calendar" className="header-nav-link" data-cy="nav-calendar-mobile">
                  Calendar
                </Link>
                <Link href="/discuss" className="header-nav-link" data-cy="nav-discuss-mobile">
                  Discuss
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="container page-shell">{children}</main>
      </body>
    </html>
  );
}
