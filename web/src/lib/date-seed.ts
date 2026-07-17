// Deterministic string hash used to seed date-based selection/shuffling.
// Same djb2-style hash already duplicated in web/src/lib/cloudspotting-mars.ts
// and web/src/lib/active-asteroids.ts (pre-existing, untouched here) — new
// callers should use this shared copy instead of adding a fourth.
export function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
