"use client";

import { useEffect, useMemo, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "cosmo_pwa_install_rejected";

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function detectIosSafari() {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isWebKit = /WebKit/.test(userAgent);
  const isOtherBrowser = /CriOS|FxiOS|EdgiOS/.test(userAgent);
  return isIOS && isWebKit && !isOtherBrowser;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  });
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 720px)").matches;
  });
  const [isIosSafari] = useState(() => detectIosSafari());

  useEffect(() => {
    if (typeof window === "undefined") return;

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as InstallPromptEvent);
    }

    function onResize() {
      setIsMobile(window.matchMedia("(max-width: 720px)").matches);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const shouldShow = useMemo(
    () => isMobile && !dismissed && !isStandaloneMode() && (Boolean(deferredPrompt) || isIosSafari),
    [deferredPrompt, dismissed, isIosSafari, isMobile],
  );

  function persistDismiss() {
    setDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, "1");
    }
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "dismissed") {
      persistDismiss();
      return;
    }
    setDeferredPrompt(null);
  }

  if (!shouldShow) return null;

  return (
    <aside className="pwa-install-prompt" role="dialog" aria-label="Install The Daily Sail">
      <p className="pwa-install-title">Install The Daily Sail for mobile telemetry access</p>
      <p className="pwa-install-copy">
        {isIosSafari
          ? "In Safari, tap Share and then Add to Home Screen for the full-screen app."
          : "Full-screen research terminal, faster access, and offline data sync."}
      </p>
      <div className="pwa-install-actions">
        {isIosSafari ? (
          <button type="button" className="button button-primary" onClick={persistDismiss}>
            Got it
          </button>
        ) : (
          <button type="button" className="button button-primary" onClick={() => void handleInstall()}>
            Add to Home Screen
          </button>
        )}
        <button type="button" className="button" onClick={persistDismiss}>
          {isIosSafari ? "Dismiss" : "No thanks"}
        </button>
      </div>
    </aside>
  );
}
