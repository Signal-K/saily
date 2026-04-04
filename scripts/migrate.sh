#!/usr/bin/env bash
# Applies all migrations and seed to the running compose postgres instance.
# Usage: ./scripts/migrate.sh
set -euo pipefail

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-54322}"
DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASS:-postgres}"
DB_NAME="${DB_NAME:-postgres}"

MIGRATIONS_DIR="$(dirname "$0")/../supabase/migrations"
SEED_FILE="$(dirname "$0")/../supabase/seed.sql"

export PGPASSWORD="$DB_PASS"

echo "Applying migrations..."
for f in "$MIGRATIONS_DIR"/*.sql; do
  echo "  -> $(basename "$f")"
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$f"
done

if [[ -f "$SEED_FILE" ]]; then
  echo "Applying seed..."
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SEED_FILE"
fi

echo "Done."
