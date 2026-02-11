"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getRobotAvatarDataUri } from "@/lib/avatar";

type AuthState = {
  email: string;
  avatarUrl: string;
} | null;

export function AuthStatus() {
  const supabase = useMemo(() => createClient(), []);
  const [auth, setAuth] = useState<AuthState>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user?.email) {
        setAuth(null);
        setLoading(false);
        return;
      }

      setAuth({ email: user.email, avatarUrl: getRobotAvatarDataUri(user.email, 48) });
      setLoading(false);
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email;
      if (!email) {
        setAuth(null);
        return;
      }

      setAuth({ email, avatarUrl: getRobotAvatarDataUri(email, 48) });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target as Node)) return;
      setMenuOpen(false);
    }

    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, []);

  if (loading) {
    return <div className="profile-skeleton" aria-hidden />;
  }

  if (!auth) {
    return (
      <Link href="/auth/sign-in" className="sign-in-pill">
        Sign in
      </Link>
    );
  }

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        type="button"
        className="profile-trigger"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <Image className="profile-avatar" src={auth.avatarUrl} alt="Profile avatar" width={24} height={24} unoptimized />
        <span className="profile-email">{auth.email}</span>
      </button>

      {menuOpen ? (
        <div className="profile-dropdown" role="menu">
          <Link href="/profile" role="menuitem" onClick={() => setMenuOpen(false)}>
            Profile
          </Link>
          <Link href="/games/today" role="menuitem" onClick={() => setMenuOpen(false)}>
            Today&apos;s game
          </Link>
          <form action="/auth/sign-out" method="post">
            <button type="submit" role="menuitem">
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
