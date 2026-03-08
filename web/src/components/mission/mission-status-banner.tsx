"use client";

import { useEffect, useState } from "react";

export function MissionStatusBanner() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  });

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="mission-status-banner panel" role="status" aria-live="polite">
      <p className="mission-status-text">
        You are offline. Saved content remains available and submissions will resume when connected.
      </p>
    </div>
  );
}
