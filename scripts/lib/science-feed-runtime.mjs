import "dotenv/config";

function cleanEnv(value) {
  return (value ?? "").trim().replace(/^"+|"+$/g, "");
}

function env(...names) {
  for (const name of names) {
    const value = cleanEnv(process.env[name]);
    if (value) return value;
  }
  return "";
}

function quoteFilterValue(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

async function readPocketBaseJson(response) {
  return response.json().catch(() => ({}));
}

async function authenticateSailySuperuser(baseUrl) {
  const email = env("SAILY_PB_SUPERUSER_EMAIL");
  const password = env("SAILY_PB_SUPERUSER_PASSWORD");

  if (!email || !password) {
    throw new Error("Missing SAILY_PB_SUPERUSER_EMAIL or SAILY_PB_SUPERUSER_PASSWORD.");
  }

  const response = await fetch(`${baseUrl}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: email, password }),
  });
  const payload = await readPocketBaseJson(response);
  if (!response.ok || !payload?.token) {
    throw new Error(payload?.message || payload?.error || `Saily PocketBase superuser auth failed (${response.status})`);
  }
  return payload.token;
}

async function findExistingRecord(baseUrl, token, table, conflictFields, row) {
  const filter = conflictFields
    .map((field) => {
      if (row[field] === undefined || row[field] === null || row[field] === "") {
        throw new Error(`Cannot upsert ${table}: missing conflict field ${field}.`);
      }
      return `${field} = ${quoteFilterValue(row[field])}`;
    })
    .join(" && ");

  const url = new URL(`${baseUrl}/api/collections/${table}/records`);
  url.searchParams.set("filter", filter);
  url.searchParams.set("perPage", "1");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await readPocketBaseJson(response);
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || `${table} lookup failed (${response.status})`);
  }
  return Array.isArray(payload?.items) ? payload.items[0] : null;
}

async function writeRecord(baseUrl, token, table, row, existingId) {
  const response = await fetch(
    existingId
      ? `${baseUrl}/api/collections/${table}/records/${existingId}`
      : `${baseUrl}/api/collections/${table}/records`,
    {
      method: existingId ? "PATCH" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(row),
    },
  );
  const payload = await readPocketBaseJson(response);
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || `${table} write failed (${response.status})`);
  }
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
  if (!rows.length) {
    return { count: 0 };
  }

  const conflictFields = String(onConflict ?? "")
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean);
  if (!table || !conflictFields.length) {
    throw new Error("upsertRows requires table and onConflict fields.");
  }

  const baseUrl = (env("SAILY_PB_URL", "NEXT_PUBLIC_SAILY_PB_URL") || "http://127.0.0.1:8092").replace(/\/$/, "");
  const token = await authenticateSailySuperuser(baseUrl);

  let count = 0;
  for (const row of rows) {
    const existing = await findExistingRecord(baseUrl, token, table, conflictFields, row);
    await writeRecord(baseUrl, token, table, row, existing?.id);
    count += 1;
  }

  return { count };
}
