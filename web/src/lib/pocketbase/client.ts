/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getBrowserSharedPocketBaseUrl, POCKETBASE_STORAGE_KEY, type PocketBaseSession } from "./config";

type AuthChangeCallback = (_event: string, session: PocketBaseSession | null) => void;

const listeners = new Set<AuthChangeCallback>();

function readSession(): PocketBaseSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(POCKETBASE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PocketBaseSession;
  } catch {
    window.localStorage.removeItem(POCKETBASE_STORAGE_KEY);
    return null;
  }
}

function writeSession(session: PocketBaseSession | null) {
  if (typeof window === "undefined") return;
  if (session) {
    window.localStorage.setItem(POCKETBASE_STORAGE_KEY, JSON.stringify(session));
    document.cookie = `ss_shared_pb_auth=${encodeURIComponent(JSON.stringify(session))}; Path=/; SameSite=Lax`;
  } else {
    window.localStorage.removeItem(POCKETBASE_STORAGE_KEY);
    document.cookie = "ss_shared_pb_auth=; Path=/; Max-Age=0; SameSite=Lax";
  }
  listeners.forEach((listener) => listener(session ? "SIGNED_IN" : "SIGNED_OUT", session));
}

async function requestSharedAuth(path: string, body: unknown) {
  const response = await fetch(`${getBrowserSharedPocketBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "PocketBase authentication failed");
  }
  return payload;
}

function mapAuthPayload(payload: any): PocketBaseSession {
  const record = payload?.record ?? {};
  return {
    token: String(payload?.token ?? ""),
    user: {
      id: String(record.id ?? ""),
      email: String(record.email ?? ""),
    },
  };
}

export function createClient() {
  return {
    auth: {
      async getSession() {
        return { data: { session: readSession() }, error: null };
      },
      async getUser() {
        const session = readSession();
        return { data: { user: session?.user ?? null }, error: null };
      },
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        try {
          const payload = await requestSharedAuth("/api/collections/users/auth-with-password", {
            identity: email,
            password,
          });
          writeSession(mapAuthPayload(payload));
          return { data: payload, error: null };
        } catch (error) {
          return { data: null, error: error instanceof Error ? error : new Error("Sign in failed") };
        }
      },
      async signUp({ email, password, options }: { email: string; password: string; options?: { data?: Record<string, unknown> } }) {
        try {
          await requestSharedAuth("/api/collections/users/records", {
            email,
            password,
            passwordConfirm: password,
            ...options?.data,
          });
          const payload = await requestSharedAuth("/api/collections/users/auth-with-password", {
            identity: email,
            password,
          });
          const session = mapAuthPayload(payload);
          writeSession(session);
          return { data: { ...payload, session }, error: null };
        } catch (error) {
          return { data: null, error: error instanceof Error ? error : new Error("Sign up failed") };
        }
      },
      async signOut() {
        writeSession(null);
        return { error: null };
      },
      async signInWithOAuth() {
        return {
          data: null,
          error: new Error("OAuth is not wired for shared PocketBase auth yet"),
        };
      },
      onAuthStateChange(callback: AuthChangeCallback) {
        listeners.add(callback);
        return {
          data: {
            subscription: {
              unsubscribe() {
                listeners.delete(callback);
              },
            },
          },
        };
      },
    },
  };
}
