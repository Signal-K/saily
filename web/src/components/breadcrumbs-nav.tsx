"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Crumb = {
  label: string;
  href: string;
};

const LABELS: Record<string, string> = {
  games: "Games",
  today: "Today's Puzzle",
  discuss: "Discuss",
  calendar: "Calendar",
  search: "Search",
  profile: "Profile",
  auth: "Auth",
  "sign-in": "Sign In",
  offline: "Offline",
};

function labelForSegment(segment: string) {
  return LABELS[segment] ?? segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function isSafeInternalRoute(value: string | null) {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\"));
}

export function BreadcrumbsNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ label: "Home", href: "/" }];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    crumbs.push({
      label: labelForSegment(segment),
      href: currentPath,
    });
  }

  const date = searchParams.get("date");
  const query = searchParams.get("q")?.trim();

  if (pathname === "/games/today" && date) {
    crumbs.push({ label: `Puzzle ${date}`, href: `${pathname}?date=${encodeURIComponent(date)}` });
  }

  if (pathname === "/discuss" && date) {
    crumbs.push({ label: `Date ${date}`, href: `${pathname}?date=${encodeURIComponent(date)}` });
  }

  if (pathname === "/search" && query) {
    crumbs.push({ label: `Results: ${query}`, href: `${pathname}?q=${encodeURIComponent(query)}` });
  }

  const backTo = searchParams.get("returnTo") ?? searchParams.get("from");
  const fallback = crumbs.length > 1 ? crumbs[crumbs.length - 2]?.href ?? "/" : "/";

  function onBack() {
    if (isSafeInternalRoute(backTo)) {
      router.push(backTo!);
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallback);
  }

  const compactCrumbs = crumbs.length > 4 ? [crumbs[0], { label: "…", href: "" }, ...crumbs.slice(-2)] : crumbs;

  return (
    <div className="breadcrumbs-shell" data-cy="breadcrumbs-shell">
      <button type="button" className="breadcrumbs-back" onClick={onBack} data-cy="breadcrumbs-back">
        ←
        <span>Back</span>
      </button>

      <nav aria-label="Breadcrumb" className="breadcrumbs-nav">
        <ol>
          {compactCrumbs.map((crumb, index) => {
            const isCurrent = index === compactCrumbs.length - 1;
            return (
              <li key={`${crumb.href}-${index}`}>
                {crumb.label === "…" ? (
                  <span className="is-muted">…</span>
                ) : isCurrent ? (
                  <span className="is-current">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href}>{crumb.label}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
