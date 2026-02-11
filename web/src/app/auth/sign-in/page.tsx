"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up";

function getInitialMode(modeParam: string | null): AuthMode {
  return modeParam === "sign-up" ? "sign-up" : "sign-in";
}

function getParamMessage(status: string | null, error: string | null): string | null {
  if (error) return decodeURIComponent(error);
  if (status === "signed-out") return "You are signed out.";
  if (status === "oauth-linked") return "Authentication complete. You can continue.";
  if (status === "verify-email") return "Check your inbox to confirm your account.";
  return null;
}

export default function SignInPage() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const [mode, setMode] = useState<AuthMode>(getInitialMode(searchParams.get("mode")));
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const paramMessage = getParamMessage(searchParams.get("status"), searchParams.get("error"));

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setLocalMessage(null);
    setLocalError(null);

    if (!email || !password) {
      setLocalError("Email and password are required.");
      setBusy(false);
      return;
    }

    if (mode === "sign-up" && !acceptedTerms) {
      setLocalError("Please accept the terms before creating an account.");
      setBusy(false);
      return;
    }

    if (mode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLocalError(error.message);
        setBusy(false);
        return;
      }

      window.location.assign("/profile");
      return;
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile`,
        data: fullName ? { full_name: fullName } : undefined,
      },
    });

    if (error) {
      setLocalError(error.message);
      setBusy(false);
      return;
    }

    if (data.session) {
      window.location.assign("/profile");
      return;
    }

    setLocalMessage("Account created. Check your email for the confirmation link.");
    setBusy(false);
  }

  async function continueWithGoogle() {
    setBusy(true);
    setLocalMessage(null);
    setLocalError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      },
    });

    if (error) {
      setLocalError(error.message);
      setBusy(false);
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
            disabled={busy}
          >
            Sign in
          </button>
          <button
            type="button"
            data-cy="auth-mode-signup"
            className={mode === "sign-up" ? "is-active" : ""}
            onClick={() => setMode("sign-up")}
            disabled={busy}
          >
            Sign up
          </button>
        </div>

        <h1 className="auth-title">{mode === "sign-in" ? "Welcome back." : "Join the grid."}</h1>
        <p className="auth-subtitle">{subtitle}</p>

        <form className="auth-form" onSubmit={onSubmit}>
          {mode === "sign-up" ? (
            <div className="auth-name-grid">
              <div>
                <label className="auth-label" htmlFor="first-name">
                  First name
                </label>
                <input
                  className="auth-input"
                  id="first-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Avery"
                  autoComplete="given-name"
                  disabled={busy}
                />
              </div>
              <div>
                <label className="auth-label" htmlFor="last-name">
                  Last name
                </label>
                <input
                  className="auth-input"
                  id="last-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Miller"
                  autoComplete="family-name"
                  disabled={busy}
                />
              </div>
            </div>
          ) : null}

          <div>
            <label className="auth-label" htmlFor="email">
              Email
            </label>
            <input
              className="auth-input"
              data-cy="auth-email"
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={busy}
            />
          </div>

          <div>
            <label className="auth-label" htmlFor="password">
              Password
            </label>
            <input
              className="auth-input"
              data-cy="auth-password"
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              disabled={busy}
            />
          </div>

          {mode === "sign-up" ? (
            <label className="auth-check">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                disabled={busy}
              />
              I agree to the Terms and Conditions.
            </label>
          ) : (
            <p className="auth-note">Use the email and password from your previous session.</p>
          )}

          <button className="auth-submit" type="submit" disabled={busy}>
            <span data-cy="auth-submit-text">{busy ? "Working..." : mode === "sign-in" ? "Enter account" : "Create account"}</span>
          </button>
        </form>

        <button className="auth-oauth" onClick={continueWithGoogle} disabled={busy}>
          Continue with Google
        </button>

        {localError ? <p className="auth-error">{localError}</p> : null}
        {!localError && (localMessage || paramMessage) ? (
          <p className="auth-message">{localMessage ?? paramMessage}</p>
        ) : null}

        <p className="auth-switch-copy">
          {mode === "sign-in" ? "No account yet?" : "Already a member?"}{" "}
          <button
            type="button"
            className="auth-switch-link"
            onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
            disabled={busy}
          >
            {mode === "sign-in" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </section>
    </section>
  );
}
