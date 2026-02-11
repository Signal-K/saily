import { NextResponse } from "next/server";
import { isDailyLiveThreadLocked } from "@/lib/forum";
import { createClient } from "@/lib/supabase/server";

type ThreadMeta = {
  id: number;
  kind: "daily_live" | "ongoing";
  puzzle_date: string;
  continue_thread_id: number | null;
};

async function getThreadMeta(supabase: Awaited<ReturnType<typeof createClient>>, threadId: number) {
  const { data, error } = await supabase
    .from("forum_threads")
    .select("id,kind,puzzle_date,continue_thread_id")
    .eq("id", threadId)
    .maybeSingle();

  if (error) {
    return { error };
  }

  return { data: data as ThreadMeta | null };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const threadId = Number(url.searchParams.get("threadId"));

  if (!Number.isFinite(threadId) || threadId <= 0) {
    return NextResponse.json({ error: "threadId is required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: threadMeta, error: threadError } = await getThreadMeta(supabase, threadId);

  if (threadError || !threadMeta) {
    return NextResponse.json({ error: threadError?.message ?? "Thread not found" }, { status: 404 });
  }

  const isLocked = threadMeta.kind === "daily_live" ? isDailyLiveThreadLocked(threadMeta.puzzle_date) : false;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts, error: postsError } = await supabase
    .from("forum_posts")
    .select("id,thread_id,parent_post_id,user_id,body,result_payload,created_at,updated_at,profiles!forum_posts_user_id_fkey(username)")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (postsError) {
    return NextResponse.json({ error: postsError.message }, { status: 400 });
  }

  const postIds = (posts ?? []).map((post) => post.id);

  if (postIds.length === 0) {
    return NextResponse.json({
      thread: {
        ...threadMeta,
        is_locked: isLocked,
      },
      posts: [],
    });
  }

  const [{ data: votes, error: votesError }, { data: reactions, error: reactionsError }] = await Promise.all([
    supabase.from("forum_post_votes").select("post_id,user_id").in("post_id", postIds),
    supabase.from("forum_post_reactions").select("post_id,user_id,emoji").in("post_id", postIds),
  ]);

  if (votesError || reactionsError) {
    return NextResponse.json({ error: votesError?.message ?? reactionsError?.message ?? "Failed to load engagement" }, { status: 400 });
  }

  const voteCountByPost = new Map<number, number>();
  const upvotedSet = new Set<number>();

  (votes ?? []).forEach((row) => {
    voteCountByPost.set(row.post_id, (voteCountByPost.get(row.post_id) ?? 0) + 1);
    if (user && row.user_id === user.id) {
      upvotedSet.add(row.post_id);
    }
  });

  const reactionCountByPost = new Map<number, Record<string, number>>();
  const myReactionsByPost = new Map<number, string[]>();

  (reactions ?? []).forEach((row) => {
    const perPost = reactionCountByPost.get(row.post_id) ?? {};
    perPost[row.emoji] = (perPost[row.emoji] ?? 0) + 1;
    reactionCountByPost.set(row.post_id, perPost);

    if (user && row.user_id === user.id) {
      const mine = myReactionsByPost.get(row.post_id) ?? [];
      mine.push(row.emoji);
      myReactionsByPost.set(row.post_id, mine);
    }
  });

  const normalizedPosts = (posts ?? []).map((post) => ({
    ...post,
    vote_count: voteCountByPost.get(post.id) ?? 0,
    upvoted_by_me: upvotedSet.has(post.id),
    reaction_counts: reactionCountByPost.get(post.id) ?? {},
    reacted_by_me: myReactionsByPost.get(post.id) ?? [],
  }));

  return NextResponse.json({
    thread: {
      ...threadMeta,
      is_locked: isLocked,
    },
    posts: normalizedPosts,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    threadId?: number;
    parentPostId?: number | null;
    body?: string;
    resultPayload?: unknown;
  };

  const threadId = Number(payload.threadId);
  const parentPostId = payload.parentPostId ? Number(payload.parentPostId) : null;
  const body = payload.body?.trim();

  if (!Number.isFinite(threadId) || threadId <= 0 || !body) {
    return NextResponse.json({ error: "threadId and body are required" }, { status: 400 });
  }

  const { data: threadMeta, error: threadError } = await getThreadMeta(supabase, threadId);

  if (threadError || !threadMeta) {
    return NextResponse.json({ error: threadError?.message ?? "Thread not found" }, { status: 404 });
  }

  const isLocked = threadMeta.kind === "daily_live" ? isDailyLiveThreadLocked(threadMeta.puzzle_date) : false;
  if (isLocked) {
    return NextResponse.json(
      {
        error: "Thread is locked",
        continueThreadId: threadMeta.continue_thread_id,
      },
      { status: 403 },
    );
  }

  if (parentPostId) {
    const { data: parentPost, error: parentError } = await supabase
      .from("forum_posts")
      .select("id,thread_id")
      .eq("id", parentPostId)
      .maybeSingle();

    if (parentError || !parentPost || parentPost.thread_id !== threadId) {
      return NextResponse.json({ error: "Invalid parent post" }, { status: 400 });
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from("forum_posts")
    .insert({
      thread_id: threadId,
      parent_post_id: parentPostId,
      user_id: user.id,
      body,
      result_payload: payload.resultPayload ?? null,
    })
    .select("id,thread_id,parent_post_id,user_id,body,result_payload,created_at,updated_at,profiles!forum_posts_user_id_fkey(username)")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({
    post: {
      ...inserted,
      vote_count: 0,
      upvoted_by_me: false,
      reaction_counts: {},
      reacted_by_me: [],
    },
  });
}
