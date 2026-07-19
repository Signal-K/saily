#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import {
  DEFAULT_ROUND_SIZE,
  buildCadApiUrl,
  normalizeCadPayload,
  toPocketBaseRows,
} from "./close-approaches/normalizer.mjs";

function argValue(args, name, fallback = null) {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a value`);
  return value;
}

function hasFlag(args, name) {
  return args.includes(name);
}

function usage() {
  return `
Usage:
  node scripts/ingest-close-approaches.mjs --date-min YYYY-MM-DD --date-max YYYY-MM-DD [--game-date YYYY-MM-DD] [--limit 5] [--dry-run]
  node scripts/ingest-close-approaches.mjs --fixture path/to/cad.json --game-date YYYY-MM-DD --dry-run
  node scripts/ingest-close-approaches.mjs --date-min YYYY-MM-DD --date-max YYYY-MM-DD --write

Options:
  --fixture <path>      Read a NASA/JPL CAD JSON fixture instead of calling the live API.
  --dry-run            Print normalized rows without writing PocketBase.
  --write              Upsert normalized rows into PocketBase.
  --collection <name>  PocketBase collection name. Defaults to close_approach_daily.
`;
}

async function loadPayload({ fixturePath, dateMin, dateMax, limit }) {
  if (fixturePath) {
    return JSON.parse(await readFile(fixturePath, "utf8"));
  }

  const response = await fetch(buildCadApiUrl({ dateMin, dateMax, limit }));
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`NASA/JPL CAD request failed (${response.status}): ${text}`);
  }
  return response.json();
}

async function authenticatePocketBase(baseUrl) {
  const email = process.env.SAILY_PB_SUPERUSER_EMAIL?.trim();
  const password = process.env.SAILY_PB_SUPERUSER_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error("SAILY_PB_SUPERUSER_EMAIL and SAILY_PB_SUPERUSER_PASSWORD are required for --write");
  }

  const response = await fetch(`${baseUrl}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: email, password }),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`PocketBase superuser auth failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  return data.token;
}

async function pocketBaseJson(baseUrl, token, path, init) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok && response.status !== 404) {
    const text = await response.text().catch(() => "");
    throw new Error(`PocketBase request failed (${response.status}) ${path}: ${text}`);
  }
  if (response.status === 404) return null;
  return response.json();
}

function quotePocketBaseValue(value) {
  return `'${String(value).replace(/'/g, "\\'")}'`;
}

async function upsertPocketBaseRows(rows, { collection }) {
  const baseUrl = (process.env.SAILY_POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090").replace(/\/$/, "");
  const token = await authenticatePocketBase(baseUrl);
  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const filter = [
      `game_date = ${quotePocketBaseValue(row.game_date)}`,
      `mode = ${quotePocketBaseValue(row.mode)}`,
      `source_record_id = ${quotePocketBaseValue(row.source_record_id)}`,
    ].join(" && ");
    const query = new URLSearchParams({ filter, perPage: "1" }).toString();
    const existing = await pocketBaseJson(baseUrl, token, `/api/collections/${collection}/records?${query}`);
    const existingId = existing?.items?.[0]?.id;

    if (existingId) {
      await pocketBaseJson(baseUrl, token, `/api/collections/${collection}/records/${existingId}`, {
        method: "PATCH",
        body: JSON.stringify(row),
      });
      updated += 1;
    } else {
      await pocketBaseJson(baseUrl, token, `/api/collections/${collection}/records`, {
        method: "POST",
        body: JSON.stringify(row),
      });
      created += 1;
    }
  }

  return { created, updated };
}

async function main() {
  const args = process.argv.slice(2);
  if (hasFlag(args, "--help") || args.length === 0) {
    console.log(usage().trim());
    return;
  }

  const fixturePath = argValue(args, "--fixture");
  const dateMin = argValue(args, "--date-min");
  const dateMax = argValue(args, "--date-max");
  const gameDate = argValue(args, "--game-date", dateMin);
  const collection = argValue(args, "--collection", "close_approach_daily");
  const limit = Number(argValue(args, "--limit", String(DEFAULT_ROUND_SIZE)));
  const dryRun = hasFlag(args, "--dry-run");
  const write = hasFlag(args, "--write");

  if (!gameDate) throw new Error("--game-date is required when --fixture is used without --date-min");
  if (!fixturePath && (!dateMin || !dateMax)) throw new Error("--date-min and --date-max are required without --fixture");
  if (!dryRun && !write) throw new Error("Choose --dry-run or --write");
  if (!Number.isInteger(limit) || limit <= 0) throw new Error("--limit must be a positive integer");

  const payload = await loadPayload({ fixturePath, dateMin, dateMax, limit });
  const round = normalizeCadPayload(payload, {
    dateMin: dateMin ?? gameDate,
    dateMax: dateMax ?? gameDate,
    gameDate,
    limit,
    ingestedAt: new Date().toISOString(),
  });
  const rows = toPocketBaseRows(round);

  if (!round.available) {
    console.error(`Close Approach Ranker ingest produced too few records: ${rows.length}`);
    process.exitCode = 2;
  }

  if (dryRun) {
    console.log(JSON.stringify({ round: { ...round, records: undefined }, rows }, null, 2));
  }

  if (write) {
    const result = await upsertPocketBaseRows(rows, { collection });
    console.log(JSON.stringify({ collection, rows: rows.length, ...result }, null, 2));
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
