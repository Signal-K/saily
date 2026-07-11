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

async function deleteRecord(baseUrl, token, collection, id) {
  const response = await fetch(`${baseUrl}/api/collections/${collection}/records/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 404) return;
  if (!response.ok) {
    const payload = await readPocketBaseJson(response);
    throw new Error(`${collection}/${id}: ${payload?.message || payload?.error || response.statusText}`);
  }
}

async function findRecordIds(baseUrl, token, collection, filter) {
  const url = new URL(`${baseUrl}/api/collections/${collection}/records`);
  url.searchParams.set("filter", filter);
  url.searchParams.set("perPage", "100");
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 404) return [];
  const payload = await readPocketBaseJson(response);
  if (!response.ok) {
    throw new Error(`${collection}: ${payload?.message || payload?.error || response.statusText}`);
  }
  return Array.isArray(payload?.items) ? payload.items.map((item) => item.id).filter(Boolean) : [];
}

async function deleteRowsByFilter(baseUrl, token, collection, filter) {
  const ids = await findRecordIds(baseUrl, token, collection, filter);
  for (const id of ids) {
    await deleteRecord(baseUrl, token, collection, id);
  }
  return ids.length;
}

const userId = env("TEST_USER_ID");
if (!userId) {
  console.log("No TEST_USER_ID found. Skipping cleanup.");
  process.exit(0);
}

const sharedUrl = (env("SHARED_PB_URL", "NEXT_PUBLIC_SHARED_PB_URL", "POCKETBASE_URL") || "http://127.0.0.1:8090").replace(/\/$/, "");
const sharedSuperuserEmail = env("SHARED_PB_SUPERUSER_EMAIL", "POCKETBASE_SUPERUSER_EMAIL");
const sharedSuperuserPassword = env("SHARED_PB_SUPERUSER_PASSWORD", "POCKETBASE_SUPERUSER_PASSWORD");

if (!sharedSuperuserEmail || !sharedSuperuserPassword) {
  console.error("Missing SHARED_PB_SUPERUSER_EMAIL or SHARED_PB_SUPERUSER_PASSWORD");
  process.exit(1);
}

const sailyUrl = (env("SAILY_PB_URL", "NEXT_PUBLIC_SAILY_PB_URL") || "http://127.0.0.1:8092").replace(/\/$/, "");
const sailySuperuserEmail = env("SAILY_PB_SUPERUSER_EMAIL");
const sailySuperuserPassword = env("SAILY_PB_SUPERUSER_PASSWORD");

try {
  if (sailySuperuserEmail && sailySuperuserPassword) {
    const sailyToken = await authenticateSuperuser(sailyUrl, sailySuperuserEmail, sailySuperuserPassword);
    const cleanupTargets = [
      ["forum_post_reactions", `user_id = "${userId}"`],
      ["forum_post_votes", `user_id = "${userId}"`],
      ["forum_posts", `user_id = "${userId}"`],
      ["comments", `user_id = "${userId}"`],
      ["daily_plays", `user_id = "${userId}"`],
      ["archive_unlocks", `user_id = "${userId}"`],
      ["user_badges", `user_id = "${userId}"`],
      ["user_stats", `user_id = "${userId}"`],
      ["profiles", `shared_user_id = "${userId}"`],
    ];

    for (const [collection, filter] of cleanupTargets) {
      await deleteRowsByFilter(sailyUrl, sailyToken, collection, filter);
    }
  } else {
    console.log("No Saily PocketBase superuser credentials found. Skipping Saily data cleanup.");
  }

  const sharedToken = await authenticateSuperuser(sharedUrl, sharedSuperuserEmail, sharedSuperuserPassword);
  await deleteRecord(sharedUrl, sharedToken, "users", userId);

  console.log(`Cleaned E2E user ${userId}`);
} catch (error) {
  console.error("Cleanup failed", error instanceof Error ? error.message : String(error));
  process.exit(1);
}
