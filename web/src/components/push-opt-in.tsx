"use client";

import { usePushNotifications } from "@/lib/hooks/use-push-notifications";

export function PushOptIn() {
  const { state, loading, subscribe, unsubscribe } = usePushNotifications();

  if (state === "unsupported") return null;

  if (state === "denied") {
    return <p className="muted">Notifications blocked — enable them in your browser settings to get article alerts.</p>;
  }

  if (state === "granted") {
    return (
      <button type="button" className="button" onClick={unsubscribe} disabled={loading}>
        {loading ? "Working…" : "Article alerts on — tap to disable"}
      </button>
    );
  }

  return (
    <button type="button" className="button button-primary" onClick={subscribe} disabled={loading}>
      {loading ? "Working…" : "Get notified about new articles"}
    </button>
  );
}
