import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { Analytics } from "@vercel/analytics/react";
import { Source_Serif_4 } from "next/font/google";
import { SWRegister } from "@/components/sw-register";
import { AuthStatus } from "@/components/auth-status";
import { HeaderSearch } from "@/components/header-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { BreadcrumbsNav } from "@/components/breadcrumbs-nav";
import { PostHogRuntime } from "@/components/posthog-runtime";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import "./globals.css";

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const THEME_COOKIE = "cosmo_theme";

type Theme = "light" | "dark";
type TimePeriod = "dawn" | "morning" | "afternoon" | "evening" | "night";

function normalizeTheme(value: string | undefined): Theme {
  return value === "dark" ? "dark" : "light";
}

function getTimePeriod(): TimePeriod {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export const metadata: Metadata = {
  title: "The Daily Sail",
  description: "Citizen Science Daily — hunt planets, survey asteroids, classify Mars",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Daily Sail",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fb" },
    { media: "(prefers-color-scheme: dark)", color: "#001016" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const supabase = await createClient();
  const initialTheme = normalizeTheme(cookieStore.get(THEME_COOKIE)?.value);
  const timePeriod = getTimePeriod();
  const pathname = headerStore.get("x-pathname") ?? "/";
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSignedOutLanding = pathname === "/" && !user;

  return (
    <html
      lang="en"
      data-theme={initialTheme}
      data-period={timePeriod}
      className={sourceSerif4.variable}
    >
      <body>
        <PostHogRuntime />
        <SWRegister />
        {isSignedOutLanding ? (
          <main>{children}</main>
        ) : (
          <>
            <header className="site-header">
              {/* Row 1: brand + search + actions */}
              <div className="header-top-row">
                <div className="header-brand-row">
                  <Link href="/" className="home-icon-link" aria-label="The Daily Sail home">
                    <Image
                      src="/logo-icon.png"
                      alt=""
                      width={34}
                      height={34}
                      className="brand-logo"
                    />
                    <span className="home-brand-label">
                      <span className="home-brand-name">The Daily <em>Sail</em></span>
                      <span className="home-brand-sub">Citizen Science Daily</span>
                    </span>
                  </Link>
                </div>

                <HeaderSearch />

                <div className="header-actions">
                  <ThemeToggle initialTheme={initialTheme} />
                  <AuthStatus />
                </div>
              </div>

              {/* Row 2: main navigation */}
              <div className="header-nav-row">
                <nav className="nav-links desktop-nav" aria-label="Main navigation">
                  <Link href="/games/today" className="header-nav-link" data-cy="nav-today">
                    Today&apos;s Mission
                  </Link>
                  <Link href="/calendar" className="header-nav-link" data-cy="nav-calendar">
                    Calendar
                  </Link>
                  <Link href="/discuss" className="header-nav-link" data-cy="nav-discuss">
                    Discuss
                  </Link>
                </nav>
              </div>
            </header>

            {/* Fixed bottom tab bar — visible only on mobile via CSS */}
            <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
              <Link href="/" className="mobile-tab" data-cy="nav-home-mobile">
                <span className="mobile-tab-icon" aria-hidden>⌂</span>
                <span>Home</span>
              </Link>
              <Link href="/games/today" className="mobile-tab" data-cy="nav-today-mobile">
                <span className="mobile-tab-icon" aria-hidden>🔭</span>
                <span>Mission</span>
              </Link>
              {/* <Link href="/calendar" className="mobile-tab" data-cy="nav-calendar-mobile">
                <span className="mobile-tab-icon" aria-hidden>📅</span>
                <span>Calendar</span>
              </Link> */}
              <Link href="/discuss" className="mobile-tab" data-cy="nav-discuss-mobile">
                <span className="mobile-tab-icon" aria-hidden>💬</span>
                <span>Discuss</span>
              </Link>
            </nav>

            <main className="container page-shell">
              <BreadcrumbsNav />
              {children}
            </main>
          </>
        )}
        <PwaInstallPrompt />
        <Analytics />
      </body>
    </html>
  );
}
