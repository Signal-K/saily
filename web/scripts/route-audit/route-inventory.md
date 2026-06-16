# Saily Route Inventory

Generated: 2026-06-17. For product review — findings listed without fixes applied.

---

## Route List

| Route | File | Status | Findings |
|-------|------|--------|----------|
| `/` | `src/app/page.tsx` → `landing-page.tsx` | Functional | Re-exports LandingPage; authenticated users see home-page with daily mission CTA, unauthenticated see landing. Works. |
| `/games/today` | `src/app/games/today/page.tsx` → `mission-flow-page.tsx` | Functional | Full mission flow: briefing → Planet Hunt minigame → Mars classification → narrative update → complete screen. Requires auth; unauthenticated users redirected to sign-in. |
| `/games/mars` | `src/app/games/mars/page.tsx` → `mars-game-page.tsx` | Functional | Standalone Mars rover-photo classification. Loads images from `/api/mars/daily`. Requires auth. Falls back to static images on API error. |
| `/games/insight` | `src/app/games/insight/` (dir only, no `page.tsx`) | **Broken/Placeholder** | Directory exists but has no `page.tsx`. Visiting `/games/insight` returns a 404. Needs either a page or directory removal. |
| `/auth/sign-in` | `src/app/auth/sign-in/page.tsx` | Functional | Sign-in form. Auth callback route also present (`/auth/callback`). |
| `/calendar` | `src/app/calendar/page.tsx` → `calendar-page.tsx` | Functional | Streak repair + archive unlock UI. Requires auth for chip balance and repair actions. |
| `/chips` | `src/app/chips/page.tsx` | Functional | Data chips balance, streak repair, and archive unlock. Duplicates some calendar-page functionality — may need deduplication review. |
| `/discuss` | `src/app/discuss/page.tsx` → `discuss-page.tsx` | Functional | Forum/discussion by game date. E2E auth bypass via `?e2eAuth=1` env flag. |
| `/leaderboard` | `src/app/leaderboard/page.tsx` | Functional | Global rankings from `user_stats`. Shows "No scores yet" when empty — this will be the state in dev/staging until real gameplay data exists. |
| `/articles` | `src/app/articles/page.tsx` | **Empty state** | Lists published articles from CMS (`listPublishedArticles()`). Renders "No articles published yet." when CMS has no content. CMS content pipeline not yet active. |
| `/articles/[slug]` | `src/app/articles/[slug]/page.tsx` | **Empty state** | Individual article. Will 404 or show empty until CMS articles exist. |
| `/postcards` | `src/app/postcards/page.tsx` | **Auth-gated / incomplete** | Redirects unauthenticated users to sign-in. Shows storyline postcards after storyline completion. Likely shows empty state for users who haven't completed any storyline yet. |
| `/profile` | `src/app/profile/page.tsx` → `profile-page.tsx` | Functional | User profile. Requires auth. |
| `/search` | `src/app/search/page.tsx` → `search-page.tsx` | Unknown | Re-exports search-page component. Full functionality not inspected. |
| `/source/lightcurve` | `src/app/source/lightcurve/page.tsx` | **Internal utility** | Lightcurve source link viewer — reads query params (anomalyId, ticId, sourceName, sourceUrl). Used as an outbound link target from within the Planet Hunt game. Not a user-navigable route. |
| `/offline` | `src/app/offline/page.tsx` | Functional | PWA offline fallback. Static page. |
| `/reels/[slug]` | `src/app/reels/[slug]/` | **Placeholder/unknown** | Directory with `[slug]` subdirectory exists. No `page.tsx` found at `/reels`. Route likely 404s at `/reels`; `[slug]` page not inspected. |

---

## Findings Grouped for Product Review

### 1. Broken/Stub Routes (needs decision: add page or remove directory)

- **`/games/insight`** — Directory exists, no page file. Currently 404s. If this was a planned third minigame (cloudspotting / insight), it needs either a placeholder page or removal until ready.
- **`/reels`** — Top-level `/reels` has no `page.tsx`. The `[slug]` subdirectory exists but wasn't fully inspected. Root reels route likely 404s.

### 2. Empty-state Routes (functional code, no real content yet)

- **`/articles`** and **`/articles/[slug]`** — CMS pipeline not active; shows "No articles published yet." Once CMS content is live these will auto-populate.
- **`/leaderboard`** — Shows "No scores yet." Works correctly but will look empty until gameplay data accumulates.
- **`/postcards`** — Requires storyline completion. First-time users and dev environments will always see an empty/redirect state.

### 3. Potential Duplication

- **`/calendar`** and **`/chips`** — Both surface streak repair and archive unlock. May be intentional (chips = economy focus, calendar = date focus) but worth a product check.

### 4. Internal/Utility Routes (not user-facing)

- **`/source/lightcurve`** — Deep-link target from Planet Hunt game. Not discoverable from nav; no standalone UX needed.

### 5. Fully Functional Routes

`/`, `/games/today`, `/games/mars`, `/auth/sign-in`, `/discuss`, `/profile`, `/offline`, `/calendar`, `/chips`

---

## Notes

- Routes were inspected by reading source files; no live server was run for this audit.
- Auth-required routes redirect to `/auth/sign-in?next=<route>` consistently.
- Demo/seed data: leaderboard, articles, and postcards all depend on real data not yet seeded.
