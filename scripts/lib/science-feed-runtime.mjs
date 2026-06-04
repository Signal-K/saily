import "dotenv/config";

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
  void table;
  void onConflict;

  if (!rows.length) {
    return { count: 0 };
  }

  throw new Error("Science feed ingestion is pending PocketBase migration.");
}
