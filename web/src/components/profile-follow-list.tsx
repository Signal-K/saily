"use client";

import { useMemo, useState } from "react";

type SuggestedUser = {
  id: string;
  username: string | null;
};

type FollowListProps = {
  users: SuggestedUser[];
  initialFollowingIds: string[];
};

export function ProfileFollowList({ users, initialFollowingIds }: FollowListProps) {
  const [followingIds, setFollowingIds] = useState<Set<string>>(() => new Set(initialFollowingIds));
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      users.map((user) => ({
        ...user,
        isFollowing: followingIds.has(user.id),
      })),
    [users, followingIds],
  );

  async function toggleFollow(targetUserId: string) {
    if (pendingUserId) return;
    setPendingUserId(targetUserId);
    setFeedback(null);

    const response = await fetch("/api/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; isFollowing?: boolean };

    if (!response.ok) {
      setFeedback(payload.error ?? "Could not update follow status.");
      setPendingUserId(null);
      return;
    }

    setFollowingIds((current) => {
      const next = new Set(current);
      if (payload.isFollowing) {
        next.add(targetUserId);
      } else {
        next.delete(targetUserId);
      }
      return next;
    });
    setPendingUserId(null);
  }

  return (
    <div className="profile-follow-list">
      {rows.length === 0 ? (
        <p className="muted">No users available to follow yet.</p>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="profile-follow-item">
            <div>
              <p className="profile-follow-name">@{row.username ?? "player"}</p>
            </div>
            <button
              type="button"
              className={`button ${row.isFollowing ? "" : "button-primary"}`}
              onClick={() => void toggleFollow(row.id)}
              disabled={pendingUserId === row.id}
            >
              {pendingUserId === row.id ? "Saving..." : row.isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        ))
      )}
      {feedback ? <p className="muted">{feedback}</p> : null}
    </div>
  );
}
