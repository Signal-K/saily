import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

function cleanEnv(value) {
  return (value ?? "").trim().replace(/^"+|"+$/g, "");
}

export function parseArgs(argv = process.argv.slice(2)) {
  const options = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      options[key] = true;
      continue;
    }

    options[key] = next;
    i += 1;
  }

  return options;
}

export function getSupabaseAdminClient() {
  const url = cleanEnv(process.env.SUPABASE_URL) || cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = cleanEnv(process.env.SUPABASE_SERVICE_ROLE) || cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE/SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function parseInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function isoDateOffset(startDate, offset) {
  const date = new Date(`${startDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function defaultStartDate() {
  return new Date().toISOString().slice(0, 10);
}

export function cycleDailyRows(subjects, days, startDate, rowBuilder) {
  if (!subjects.length) return [];

  const rows = [];
  for (let i = 0; i < days; i += 1) {
    const subject = subjects[i % subjects.length];
    rows.push(rowBuilder(subject, isoDateOffset(startDate, i), i));
  }
  return rows;
}

export async function upsertRows({ table, rows, onConflict }) {
  if (!rows.length) {
    return { count: 0 };
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  return { count: rows.length };
}
