import { appendFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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

async function readPocketBaseJson(response) {
  return response.json().catch(() => ({}));
}

async function authenticateSuperuser(baseUrl, email, password) {
  const response = await fetch(`${baseUrl}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: email, password }),
  });
  const payload = await readPocketBaseJson(response);
  if (!response.ok || !payload?.token) {
    throw new Error(payload?.message || payload?.error || `superuser auth failed (${response.status})`);
  }
  return payload.token;
}

const sharedUrl = env("SHARED_PB_URL", "NEXT_PUBLIC_SHARED_PB_URL", "POCKETBASE_URL") || "http://127.0.0.1:8090";
const sharedSuperuserEmail = env("SHARED_PB_SUPERUSER_EMAIL", "POCKETBASE_SUPERUSER_EMAIL");
const sharedSuperuserPassword = env("SHARED_PB_SUPERUSER_PASSWORD", "POCKETBASE_SUPERUSER_PASSWORD");

if (!sharedSuperuserEmail || !sharedSuperuserPassword) {
  console.error("Missing SHARED_PB_SUPERUSER_EMAIL or SHARED_PB_SUPERUSER_PASSWORD");
  process.exit(1);
}

const baseUrl = sharedUrl.replace(/\/$/, "");
const runId = process.env.GITHUB_RUN_ID ?? `${Date.now()}`;
const runAttempt = process.env.GITHUB_RUN_ATTEMPT ?? "1";
const nonce = `${Math.random().toString(36).slice(2, 8)}`;
const email = `e2e+${runId}-${runAttempt}-${nonce}@dailygrid.test`;
const password = `E2E!${runId}${runAttempt}${nonce}`;
const runTag = `e2e-${runId}-${runAttempt}-${nonce}`;

try {
  const token = await authenticateSuperuser(baseUrl, sharedSuperuserEmail, sharedSuperuserPassword);
  const createRes = await fetch(`${baseUrl}/api/collections/users/records`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      emailVisibility: true,
      verified: true,
      name: `E2E Tester ${nonce}`,
      password,
      passwordConfirm: password,
    }),
  });
  const user = await readPocketBaseJson(createRes);
  if (!createRes.ok || !user?.id) {
    throw new Error(user?.message || user?.error || `user create failed (${createRes.status})`);
  }

  const outputLines = [
    `TEST_USER_ID=${user.id}`,
    `TEST_USER_EMAIL=${email}`,
    `TEST_USER_PASSWORD=${password}`,
    `TEST_RUN_TAG=${runTag}`,
    `CYPRESS_E2E_TEST_EMAIL=${email}`,
    `CYPRESS_E2E_TEST_PASSWORD=${password}`,
    `CYPRESS_E2E_TEST_RUN_TAG=${runTag}`,
  ];

  if (process.env.GITHUB_ENV) {
    appendFileSync(process.env.GITHUB_ENV, `${outputLines.join("\n")}\n`, { encoding: "utf8" });
  } else {
    const scriptDir = dirname(fileURLToPath(import.meta.url));
    const webDir = join(scriptDir, "..", "..");
    const envPath = join(webDir, ".env.e2e.local");
    writeFileSync(envPath, `${outputLines.join("\n")}\n`, { encoding: "utf8" });
    console.log(`Wrote E2E env to ${envPath}`);
  }

  console.log(`Created E2E user ${email}`);
} catch (error) {
  console.error("Failed to create E2E user", error instanceof Error ? error.message : String(error));
  process.exit(1);
}
