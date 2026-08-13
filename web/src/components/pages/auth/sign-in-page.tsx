"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SignIn, SignUp, useAuth as useClerkAuth } from "@clerk/nextjs";
import { createClient } from "@/lib/pocketbase/client";

type AuthMode = "sign-in" | "sign-up";

function getInitialMode(modeParam: string | null): AuthMode {
  return modeParam === "sign-up" ? "sign-up" : "sign-in";
}

function getParamMessage(status: string | null, error: string | null): string | null {
  if (error) return decodeURIComponent(error);
  if (status === "signed-out") return "You are signed out.";
  return null;
}

// Suppresses each Clerk widget's own "Sign up"/"Sign in" footer link -- this
// page owns mode switching via its own tabs, mirroring Atlas's AuthForm
// (KES-189/KES-190): two live switchers with no state link between them
// would just reintroduce a hard-to-notice mode-switch bug.
const clerkAppearance = { elements: { footerAction: { display: "none" } } };

export default function SignInPage() {
  const searchParams = useSearchParams();
  const pocketbase = createClient();

  const [mode, setMode] = useState<AuthMode>(getInitialMode(searchParams.get("mode")));
  const [error, setError] = useState<string | null>(null);
  const [exchanging, setExchanging] = useState(false);
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  // Guards the exchange call to run exactly once per session rather than
  // once per re-render; a failed exchange resets this so it can be retried
  // without needing to sign out of Clerk and back in.
  const exchangeStartedRef = useRef(false);

  const paramMessage = getParamMessage(searchParams.get("status"), searchParams.get("error"));

  useEffect(() => {
    if (!isLoaded || !isSignedIn || exchangeStartedRef.current) return;
    exchangeStartedRef.current = true;
    void exchangeClerkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- exchangeClerkSession only needs to run once per isSignedIn transition
  }, [isLoaded, isSignedIn]);

  async function exchangeClerkSession() {
    setError(null);
    setExchanging(true);
    try {
      const clerkToken = await getToken();
      if (!clerkToken) throw new Error("No Clerk session token available.");

      const { error: exchangeError } = await pocketbase.auth.exchangeClerkSession(clerkToken);
      if (exchangeError) throw exchangeError;

      window.location.assign("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong finishing sign-in.");
      exchangeStartedRef.current = false;
      setExchanging(false);
    }
  }

  const subtitle =
    mode === "sign-in"
      ? "Access your account and pick up your current streak."
      : "Create your account and save daily game progress.";

  return (
    <section className="auth-shell">
      <div className="auth-page-bg" aria-hidden />
      <section className="auth-card">
        <div className="auth-dot-grid" />

        <div className="auth-toggle" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            data-cy="auth-mode-signin"
            className={mode === "sign-in" ? "is-active" : ""}
            onClick={() => setMode("sign-in")}
            disabled={exchanging}
          >
            Sign In
          </button>
          <button
            type="button"
            data-cy="auth-mode-signup"
            className={mode === "sign-up" ? "is-active" : ""}
            onClick={() => setMode("sign-up")}
            disabled={exchanging}
          >
            Join the Grid
          </button>
        </div>

        <h1 className="auth-title">{mode === "sign-in" ? "Welcome back." : "Join the grid."}</h1>
        <p className="auth-subtitle">{subtitle}</p>

        <div className="auth-form">
          {/* routing="hash" keeps Clerk's multi-step widget (email -> code,
              etc) entirely client-side within this page, matching how
              Atlas's AuthForm avoids Next's default path-based routing,
              which would need dedicated catch-all routes under /auth/sign-in.
              Once isSignedIn flips true, the widget must stop rendering:
              Clerk's own SignIn/SignUp guard against being mounted while
              already signed in and will fire its own competing redirect
              (via its legacy afterSignIn/afterSignUp fallback) that races
              exchangeClerkSession()'s window.location.assign, surfacing as
              "The requested resource wasn't found." */}
          {!isSignedIn &&
            (mode === "sign-in" ? (
              <SignIn routing="hash" appearance={clerkAppearance} fallbackRedirectUrl="/auth/sign-in" />
            ) : (
              <SignUp routing="hash" appearance={clerkAppearance} fallbackRedirectUrl="/auth/sign-in" />
            ))}
          {exchanging && <p className="auth-message">Finishing sign-in…</p>}
        </div>

        {error ? <p className="auth-error">{error}</p> : null}
        {!error && paramMessage ? <p className="auth-message">{paramMessage}</p> : null}
      </section>
    </section>
  );
}
