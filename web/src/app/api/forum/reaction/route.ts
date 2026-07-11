import { NextResponse } from "next/server";
import { getDayAccessForUser } from "@/lib/day-access";
import { isDailyLiveThreadLocked } from "@/lib/forum";
import { createClient } from "@/lib/pocketbase/server";

type PostThreadMeta = {
  post_id: string;
  thread_id: string;
  kind: "daily_live" | "ongoing";
  puzzle_date: string;
  continue_thread_id: string | null;
};

async function getPostThreadMeta(pocketbase: Awaited<ReturnType<typeof createClient>>, postId: string) {
  const { data: post, error: postError } = await pocketbase
    .from("forum_posts")
    .select("id,thread_id")
    .eq("id", postId)
    .maybeSingle();

  if (postError || !post) {
    return { error: postError ?? new Error("Post not found") };
  }

  const { data: thread, error: threadError } = await pocketbase
    .from("forum_threads")
    .select("id,kind,puzzle_date,continue_thread_id")
    .eq("id", post.thread_id)
    .maybeSingle();

  if (threadError || !thread) {
    return { error: threadError ?? new Error("Thread not found") };
  }

  return {
    data: {
      post_id: post.id,
      thread_id: post.thread_id,
      kind: thread.kind,
      puzzle_date: thread.puzzle_date,
      continue_thread_id: thread.continue_thread_id,
    } as PostThreadMeta,
  };
}

export async function POST(request: Request) {
  const pocketbase = await createClient();
  const {
    data: { user },
  } = await pocketbase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as { postId?: string; emoji?: string };
  const postId = payload.postId;
  const emoji = payload.emoji?.trim();

  if (!postId || !emoji) {
    return NextResponse.json({ error: "postId and emoji are required" }, { status: 400 });
  }

  const { data: meta, error: metaError } = await getPostThreadMeta(pocketbase, postId);

  if (metaError || !meta) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const access = await getDayAccessForUser(pocketbase, user.id, meta.puzzle_date);
  if (!access.allowed) {
    return NextResponse.json({ error: "Complete or unlock this day before interacting.", access }, { status: 403 });
  }

  if (meta.kind === "daily_live" && isDailyLiveThreadLocked(meta.puzzle_date)) {
    return NextResponse.json(
      {
        error: "Thread is locked",
        continueThreadId: meta.continue_thread_id,
      },
      { status: 403 },
    );
  }

  const { data: existing } = await pocketbase
    .from("forum_post_reactions")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .eq("emoji", emoji)
    .maybeSingle();

  if (existing) {
    const { error: deleteError } = await pocketbase
      .from("forum_post_reactions")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .eq("emoji", emoji);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }
  } else {
    const { error: insertError } = await pocketbase.from("forum_post_reactions").insert({ post_id: postId, user_id: user.id, emoji });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
  }

  const { count } = await pocketbase
    .from("forum_post_reactions")
    .select("post_id", { count: "exact", head: true })
    .eq("post_id", postId)
    .eq("emoji", emoji);

  return NextResponse.json({
    postId,
    emoji,
    reacted: !existing,
    emojiCount: count ?? 0,
  });
}
