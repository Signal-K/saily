"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { SignUp, useAuth as useClerkAuth, useSignIn } from "@clerk/nextjs";
import { createClient } from "@/lib/pocketbase/client";
import { getBrowserSharedPocketBaseUrl } from "@/lib/pocketbase/config";

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
              <ClerkSignInPanel formError={error} setFormError={setError} exchanging={exchanging} />
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

// Hand-rolled in place of Clerk's prebuilt <SignIn> (KES-190) so a failed
// password attempt can be told apart from "this account doesn't exist in
// Clerk yet" -- the prebuilt widget doesn't expose that distinction, and
// it's exactly the case every account created before this migration hits
// on its first sign-in since Clerk never learned their PocketBase
// password. Mirrors Atlas's AuthForm.tsx. See claimLegacyAccount below and
// backend/clerk_claim.go.
function ClerkSignInPanel({
  formError,
  setFormError,
  exchanging,
}: {
  formError: string | null;
  setFormError: (error: string | null) => void;
  exchanging: boolean;
}) {
  const { signIn, fetchStatus } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [claiming, setClaiming] = useState(false);
  const busy = fetchStatus === "fetching" || claiming || exchanging;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!signIn || busy) return;
    setFormError(null);

    let error;
    try {
      ({ error } = await signIn.password({ identifier: email, password }));
    } catch {
      setFormError("Something went wrong. Please try again.");
      return;
    }
    if (!error) {
      await signIn.finalize();
      return;
    }

    // signIn.password()'s rejection is a ClerkAPIResponseError: the
    // field-level code we need to distinguish "no such account" from
    // "wrong password" lives in .errors[0].code, not .code itself (that's
    // the wrapper's own generic 'api_response_error').
    const fieldCode = (error as { errors?: Array<{ code?: string }> }).errors?.[0]?.code;
    if (fieldCode !== "form_identifier_not_found") {
      setFormError(error.longMessage || error.message || "Incorrect email or password.");
      return;
    }

    // Clerk has never heard of this email -- almost certainly a
    // pre-migration account, since every real signup goes through <SignUp>
    // first. Silently claim it rather than showing an error a returning
    // user has no way to act on.
    setClaiming(true);
    try {
      const claimed = await claimLegacyAccount(email, password);
      if (!claimed) {
        setFormError("Incorrect email or password.");
        return;
      }
      const { error: ticketError } = await signIn.ticket({ ticket: claimed });
      if (ticketError) {
        setFormError("Incorrect email or password.");
        return;
      }
      await signIn.finalize();
    } finally {
      setClaiming(false);
    }
  }

  async function handleGoogle() {
    if (!signIn) return;
    setFormError(null);
    const redirectUrl = window.location.href;
    const { error } = await signIn.sso({ strategy: "oauth_google", redirectUrl, redirectCallbackUrl: redirectUrl });
    if (error) setFormError(error.longMessage || error.message || "Could not start Google sign-in.");
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <button type="button" className="auth-oauth" onClick={handleGoogle} disabled={busy}>
        Continue with Google
      </button>
      <div className="auth-divider">or</div>
      <div>
        <label className="auth-label" htmlFor="clerk-sign-in-email">
          Email address
        </label>
        <input
          id="clerk-sign-in-email"
          className="auth-input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div>
        <label className="auth-label" htmlFor="clerk-sign-in-password">
          Password
        </label>
        <input
          id="clerk-sign-in-password"
          className="auth-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      <button type="submit" className="auth-submit" disabled={busy}>
        {claiming ? "Signing in…" : "Continue"}
      </button>
      {!formError && !exchanging && claiming && (
        <p className="auth-message">Setting up your account for the new sign-in…</p>
      )}
    </form>
  );
}

// POST /auth/clerk-claim (backend/clerk_claim.go) admin-creates a Clerk user
// for a pre-migration PocketBase account and returns a one-time sign-in
// token to redeem via signIn.ticket() -- no OTP round-trip, since the
// product decision (KES-190) is to not require email verification yet.
// Returns null on any failure (account doesn't exist, or already claimed --
// the backend 409s that case so a real wrong-password attempt on an
// already-migrated account still fails normally).
async function claimLegacyAccount(email: string, password: string): Promise<string | null> {
  try {
    const response = await fetch(`${getBrowserSharedPocketBaseUrl()}/auth/clerk-claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = (await response.json().catch(() => null)) as { token?: string } | null;
    if (!response.ok || !payload?.token) return null;
    return payload.token;
  } catch {
    return null;
  }
}
