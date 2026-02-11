import { NextResponse } from "next/server";
import { isDailyLiveThreadLocked } from "@/lib/forum";
import { createClient } from "@/lib/supabase/server";

type PostThreadMeta = {
  post_id: number;
  thread_id: number;
  kind: "daily_live" | "ongoing";
  puzzle_date: string;
  continue_thread_id: number | null;
};

async function getPostThreadMeta(supabase: Awaited<ReturnType<typeof createClient>>, postId: number) {
  const { data, error } = await supabase
    .from("forum_posts")
    .select("id,thread_id,forum_threads!inner(id,kind,puzzle_date,continue_thread_id)")
    .eq("id", postId)
    .maybeSingle();

  if (error || !data) {
    return { error: error ?? new Error("Post not found") };
  }

  const thread = Array.isArray(data.forum_threads) ? data.forum_threads[0] : data.forum_threads;

  return {
    data: {
      post_id: data.id,
      thread_id: data.thread_id,
      kind: thread.kind,
      puzzle_date: thread.puzzle_date,
      continue_thread_id: thread.continue_thread_id,
    } as PostThreadMeta,
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as { postId?: number };
  const postId = Number(payload.postId);

  if (!Number.isFinite(postId) || postId <= 0) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  const { data: meta, error: metaError } = await getPostThreadMeta(supabase, postId);

  if (metaError || !meta) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
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

  const { data: existing } = await supabase
    .from("forum_post_votes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error: deleteError } = await supabase.from("forum_post_votes").delete().eq("post_id", postId).eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }
  } else {
    const { error: insertError } = await supabase.from("forum_post_votes").insert({ post_id: postId, user_id: user.id });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
  }

  const { count } = await supabase.from("forum_post_votes").select("post_id", { count: "exact", head: true }).eq("post_id", postId);

  return NextResponse.json({
    postId,
    upvoted: !existing,
    voteCount: count ?? 0,
  });
}
