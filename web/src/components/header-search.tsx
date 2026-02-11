"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SearchSuggestion = {
  kind: string;
  title: string;
  subtitle: string;
  href: string;
};

export function HeaderSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const trimmed = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=8`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as { results?: SearchSuggestion[] };
        if (!response.ok) {
          setResults([]);
          return;
        }
        setResults(payload.results ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setIsOpen(true);
        }
      }
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [trimmed]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trimmed) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="header-search-wrap" onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}>
      <form className="header-search" onSubmit={onSubmit} role="search" aria-label="Site search">
        <label className="sr-only" htmlFor="header-search-input">
          Search Daily Grid
        </label>
        <input
          data-cy="header-search-input"
          id="header-search-input"
          type="search"
          placeholder="Search everything"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button data-cy="header-search-submit" type="submit">Search</button>
      </form>

      {isOpen && trimmed.length >= 2 ? (
        <div className="header-search-dropdown" role="listbox" aria-label="Live search suggestions" data-cy="header-search-dropdown">
          {loading ? <p className="header-search-status">Searching...</p> : null}
          {!loading && results.length === 0 ? <p className="header-search-status">No quick matches</p> : null}

          {!loading && results.length > 0 ? (
            <ul className="header-search-results">
              {results.map((result, idx) => (
                <li key={`${result.kind}-${idx}`}>
                  <button
                    type="button"
                    className="header-search-result"
                    data-cy="header-search-result"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery("");
                      router.push(result.href);
                    }}
                  >
                    <span className="header-search-result-title">{result.title}</span>
                    <span className="header-search-result-subtitle">{result.subtitle}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <button
            type="button"
            className="header-search-all"
            data-cy="header-search-view-all"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setIsOpen(false);
              router.push(`/search?q=${encodeURIComponent(trimmed)}`);
            }}
          >
            View all results for &ldquo;{trimmed}&rdquo;
          </button>
        </div>
      ) : null}
    </div>
  );
}
