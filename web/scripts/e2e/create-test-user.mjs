import { createClient } from "@supabase/supabase-js";
import { appendFileSync } from "node:fs";

const url = process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

if (!url || !serviceRole) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE");
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const runId = process.env.GITHUB_RUN_ID ?? `${Date.now()}`;
const runAttempt = process.env.GITHUB_RUN_ATTEMPT ?? "1";
const nonce = `${Math.random().toString(36).slice(2, 8)}`;
const email = `e2e+${runId}-${runAttempt}-${nonce}@dailygrid.test`;
const password = `E2E!${runId}${runAttempt}${nonce}`;

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: {
    e2e: true,
    run_id: runId,
    run_attempt: runAttempt,
  },
});

if (error || !data.user) {
  console.error("Failed to create E2E user", error?.message ?? "unknown error");
  process.exit(1);
}

const outputLines = [
  `TEST_USER_ID=${data.user.id}`,
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
