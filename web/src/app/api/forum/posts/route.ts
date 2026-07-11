import { NextResponse } from "next/server";
import { getDayAccessForUser } from "@/lib/day-access";
import { isDailyLiveThreadLocked } from "@/lib/forum";
import { createClient } from "@/lib/pocketbase/server";

type ThreadMeta = {
  id: string;
  kind: "daily_live" | "ongoing";
  puzzle_date: string;
  continue_thread_id: string | null;
};

async function getThreadMeta(pocketbase: Awaited<ReturnType<typeof createClient>>, threadId: string) {
  const { data, error } = await pocketbase
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
  const threadId = url.searchParams.get("threadId");

  if (!threadId) {
    return NextResponse.json({ error: "threadId is required" }, { status: 400 });
  }

  const pocketbase = await createClient();
  const {
    data: { user },
  } = await pocketbase.auth.getUser();

  const { data: threadMeta, error: threadError } = await getThreadMeta(pocketbase, threadId);

  if (threadError || !threadMeta) {
    return NextResponse.json({ error: threadError?.message ?? "Thread not found" }, { status: 404 });
  }

  const access = await getDayAccessForUser(pocketbase, user?.id, threadMeta.puzzle_date);
  if (!access.allowed) {
    return NextResponse.json({ error: "Complete or unlock this day before opening the discussion.", access }, { status: 403 });
  }

  const isLocked = threadMeta.kind === "daily_live" ? isDailyLiveThreadLocked(threadMeta.puzzle_date) : false;

  const { data: posts, error: postsError } = await pocketbase
    .from("forum_posts")
    .select("id,thread_id,parent_post_id,user_id,body,result_payload,created_at,updated_at")
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

  const authorIds = [...new Set((posts ?? []).map((post) => post.user_id))];

  const [{ data: votes, error: votesError }, { data: reactions, error: reactionsError }, { data: profiles, error: profilesError }] =
    await Promise.all([
      pocketbase.from("forum_post_votes").select("post_id,user_id").in("post_id", postIds),
      pocketbase.from("forum_post_reactions").select("post_id,user_id,emoji").in("post_id", postIds),
      pocketbase.from("profiles").select("shared_user_id,username").in("shared_user_id", authorIds),
    ]);

  if (votesError || reactionsError || profilesError) {
    return NextResponse.json(
      { error: votesError?.message ?? reactionsError?.message ?? profilesError?.message ?? "Failed to load engagement" },
      { status: 400 },
    );
  }

  const voteCountByPost = new Map<string, number>();
  const upvotedSet = new Set<string>();

  (votes ?? []).forEach((row) => {
    voteCountByPost.set(row.post_id, (voteCountByPost.get(row.post_id) ?? 0) + 1);
    if (user && row.user_id === user.id) {
      upvotedSet.add(row.post_id);
    }
  });

  const reactionCountByPost = new Map<string, Record<string, number>>();
  const myReactionsByPost = new Map<string, string[]>();

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

  const usernameByUserId = new Map((profiles ?? []).map((profile) => [profile.shared_user_id, profile.username]));

  const normalizedPosts = (posts ?? []).map((post) => ({
    ...post,
    profiles: { username: usernameByUserId.get(post.user_id) ?? null },
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
  const pocketbase = await createClient();
  const {
    data: { user },
  } = await pocketbase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    threadId?: string;
    parentPostId?: string | null;
    body?: string;
    resultPayload?: unknown;
  };

  const threadId = payload.threadId;
  const parentPostId = payload.parentPostId || null;
  const body = payload.body?.trim();

  if (!threadId || !body) {
    return NextResponse.json({ error: "threadId and body are required" }, { status: 400 });
  }

  const { data: threadMeta, error: threadError } = await getThreadMeta(pocketbase, threadId);

  if (threadError || !threadMeta) {
    return NextResponse.json({ error: threadError?.message ?? "Thread not found" }, { status: 404 });
  }

  const access = await getDayAccessForUser(pocketbase, user.id, threadMeta.puzzle_date);
  if (!access.allowed) {
    return NextResponse.json({ error: "Complete or unlock this day before posting.", access }, { status: 403 });
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
    const { data: parentPost, error: parentError } = await pocketbase
      .from("forum_posts")
      .select("id,thread_id")
      .eq("id", parentPostId)
      .maybeSingle();

    if (parentError || !parentPost || parentPost.thread_id !== threadId) {
      return NextResponse.json({ error: "Invalid parent post" }, { status: 400 });
    }
  }

  const { data: inserted, error: insertError } = await pocketbase
    .from("forum_posts")
    .insert({
      thread_id: threadId,
      parent_post_id: parentPostId,
      user_id: user.id,
      body,
      result_payload: payload.resultPayload ?? null,
    })
    .select("id,thread_id,parent_post_id,user_id,body,result_payload,created_at,updated_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  const { data: authorProfile } = await pocketbase
    .from("profiles")
    .select("username")
    .eq("shared_user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    post: {
      ...inserted,
      profiles: { username: authorProfile?.username ?? null },
      vote_count: 0,
      upvoted_by_me: false,
      reaction_counts: {},
      reacted_by_me: [],
    },
  });
}
