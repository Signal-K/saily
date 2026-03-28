function cleanEnv(value) {
  return (value ?? "").trim().replace(/^"+|"+$/g, "");
}

const url = cleanEnv(process.env.SUPABASE_URL) || "http://127.0.0.1:54321";
const serviceRole = cleanEnv(process.env.SUPABASE_SERVICE_ROLE) || cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
const userId = cleanEnv(process.env.TEST_USER_ID);

if (!url || !serviceRole) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE");
  process.exit(1);
}
if (!userId) {
  console.log("No TEST_USER_ID found. Skipping cleanup.");
  process.exit(0);
}
const baseUrl = url.replace(/\/$/, "");

async function deleteRows(table, column = "user_id") {
  const endpoint = new URL(`${baseUrl}/rest/v1/${table}`);
  endpoint.searchParams.set(column, `eq.${userId}`);
  const res = await fetch(endpoint, {
    method: "DELETE",
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      Prefer: "return=minimal",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${table}: ${text || res.statusText}`);
  }
}

async function deleteAuthUser() {
  const res = await fetch(`${baseUrl}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
    },
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(`auth.users: ${payload?.msg ?? payload?.error_description ?? payload?.error ?? res.statusText}`);
  }
}

try {
  await deleteRows("forum_post_reactions");
  await deleteRows("forum_post_votes");
  await deleteRows("forum_posts");
  await deleteRows("comments");
  await deleteRows("daily_plays");
  await deleteRows("user_badges");
  await deleteRows("user_stats");
  await deleteRows("profiles", "id");
  await deleteAuthUser();

  console.log(`Cleaned E2E user ${userId}`);
} catch (error) {
  console.error("Cleanup failed", error instanceof Error ? error.message : String(error));
  process.exit(1);
}
