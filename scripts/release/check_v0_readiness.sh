#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WEB_DIR="$ROOT_DIR/web"

echo "[v0] Release readiness checks"
echo "[v0] Project root: $ROOT_DIR"

if [[ ! -d "$WEB_DIR" ]]; then
  echo "[v0] error: missing web directory at $WEB_DIR" >&2
  exit 1
fi

pushd "$WEB_DIR" >/dev/null

echo "[v0] Running lint"
npm run lint

echo "[v0] Running production build"
npm run build

echo "[v0] Analytics wiring checks"
if grep -q "\"@vercel/analytics\"" package.json; then
  echo "  - @vercel/analytics dependency present"
else
  echo "  - missing @vercel/analytics dependency" >&2
  exit 1
fi

if grep -q "PostHogRuntime" src/app/layout.tsx; then
  echo "  - PostHog runtime mounted"
else
  echo "  - PostHog runtime missing from layout" >&2
  exit 1
fi

if grep -q "Analytics" src/app/layout.tsx; then
  echo "  - Vercel Analytics mounted"
else
  echo "  - Vercel Analytics missing from layout" >&2
  exit 1
fi

popd >/dev/null

echo "[v0] Ready: lint/build/analytics checks passed"
