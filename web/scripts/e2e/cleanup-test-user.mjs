import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE;
const userId = process.env.TEST_USER_ID;

if (!url || !serviceRole || !userId) {
  console.error("Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE, or TEST_USER_ID");
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function hardDelete(table, column = "user_id") {
  const { error } = await supabase.from(table).delete().eq(column, userId);
  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }
}

try {
  await hardDelete("forum_post_reactions");
  await hardDelete("forum_post_votes");
  await hardDelete("forum_posts");
  await hardDelete("comments");
  await hardDelete("daily_plays");
  await hardDelete("user_badges");
  await hardDelete("user_stats");
  await hardDelete("profiles", "id");

  const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
  if (authDeleteError) {
    throw new Error(`auth.users: ${authDeleteError.message}`);
  }

  console.log(`Cleaned E2E user ${userId}`);
} catch (error) {
  console.error("Cleanup failed", error instanceof Error ? error.message : String(error));
  process.exit(1);
}
