import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function normalizeId(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function countFollowers(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { count, error } = await supabase.from("user_follows").select("follower_id", { count: "exact", head: true }).eq("following_id", userId);
  if (error) throw error;
  return count ?? 0;
}

async function countFollowing(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { count, error } = await supabase.from("user_follows").select("following_id", { count: "exact", head: true }).eq("follower_id", userId);
  if (error) throw error;
  return count ?? 0;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const url = new URL(request.url);
  const targetUserId = normalizeId(url.searchParams.get("userId"));

  if (!targetUserId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const [followersCount, followingCount] = await Promise.all([countFollowers(supabase, targetUserId), countFollowing(supabase, targetUserId)]);

    let isFollowing = false;
    if (user) {
      const { data: relation } = await supabase
        .from("user_follows")
        .select("follower_id")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .maybeSingle();
      isFollowing = Boolean(relation);
    }

    return NextResponse.json({
      ok: true,
      userId: targetUserId,
      followersCount,
      followingCount,
      isFollowing,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load follow data";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as { targetUserId?: string };
  const targetUserId = normalizeId(payload.targetUserId);
  if (!targetUserId) {
    return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
  }
  if (targetUserId === user.id) {
    return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
  }

  const { data: existing, error: relationError } = await supabase
    .from("user_follows")
    .select("follower_id,following_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .maybeSingle();

  if (relationError) {
    return NextResponse.json({ error: relationError.message }, { status: 400 });
  }

  let isFollowing = false;
  if (existing) {
    const { error: deleteError } = await supabase.from("user_follows").delete().eq("follower_id", user.id).eq("following_id", targetUserId);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }
    isFollowing = false;
  } else {
    const { error: insertError } = await supabase.from("user_follows").insert({ follower_id: user.id, following_id: targetUserId });
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
    isFollowing = true;
  }

  try {
    const [targetFollowersCount, targetFollowingCount, myFollowersCount, myFollowingCount] = await Promise.all([
      countFollowers(supabase, targetUserId),
      countFollowing(supabase, targetUserId),
      countFollowers(supabase, user.id),
      countFollowing(supabase, user.id),
    ]);

    return NextResponse.json({
      ok: true,
      targetUserId,
      isFollowing,
      target: {
        followersCount: targetFollowersCount,
        followingCount: targetFollowingCount,
      },
      viewer: {
        userId: user.id,
        followersCount: myFollowersCount,
        followingCount: myFollowingCount,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Follow toggle complete, but counts could not be loaded";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
