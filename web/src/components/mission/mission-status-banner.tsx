"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function MissionStatusBanner() {
  const isOnline = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );

  if (isOnline) return null;

  return (
    <div className="mission-status-banner panel" role="status" aria-live="polite">
      <p className="mission-status-text">
        You are offline. Saved content remains available and submissions will resume when connected.
      </p>
    </div>
  );
}
