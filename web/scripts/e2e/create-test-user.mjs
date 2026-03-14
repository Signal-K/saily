import { appendFileSync } from "node:fs";

function cleanEnv(value) {
  return (value ?? "").trim().replace(/^"+|"+$/g, "");
}

const url = cleanEnv(process.env.SUPABASE_URL) || "http://127.0.0.1:54321";
const serviceRole = cleanEnv(process.env.SUPABASE_SERVICE_ROLE) || cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

if (!url || !serviceRole) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE");
  process.exit(1);
}
const baseUrl = url.replace(/\/$/, "");

const runId = process.env.GITHUB_RUN_ID ?? `${Date.now()}`;
const runAttempt = process.env.GITHUB_RUN_ATTEMPT ?? "1";
const nonce = `${Math.random().toString(36).slice(2, 8)}`;
const email = `e2e+${runId}-${runAttempt}-${nonce}@dailygrid.test`;
const password = `E2E!${runId}${runAttempt}${nonce}`;

const createRes = await fetch(`${baseUrl}/auth/v1/admin/users`, {
  method: "POST",
  headers: {
    apikey: serviceRole,
    Authorization: `Bearer ${serviceRole}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      e2e: true,
      run_id: runId,
      run_attempt: runAttempt,
    },
  }),
});
const createPayload = await createRes.json().catch(() => ({}));
const user = createPayload.user ?? createPayload;
if (!createRes.ok || !user?.id) {
  console.error("Failed to create E2E user", createPayload?.msg ?? createPayload?.error_description ?? createPayload?.error ?? "unknown error");
  process.exit(1);
}

const outputLines = [
  `TEST_USER_ID=${user.id}`,
  `TEST_USER_EMAIL=${email}`,
  `TEST_USER_PASSWORD=${password}`,
  `TEST_RUN_TAG=e2e-${runId}-${runAttempt}-${nonce}`,
  `CYPRESS_E2E_TEST_EMAIL=${email}`,
  `CYPRESS_E2E_TEST_PASSWORD=${password}`,
  `CYPRESS_E2E_TEST_RUN_TAG=e2e-${runId}-${runAttempt}-${nonce}`,
];

if (process.env.GITHUB_ENV) {
  appendFileSync(process.env.GITHUB_ENV, `${outputLines.join("\n")}\n`, { encoding: "utf8" });
} else {
  console.log(outputLines.join("\n"));
}

console.log(`Created E2E user ${email}`);
