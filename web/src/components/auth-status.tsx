"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getRobotAvatarDataUri } from "@/lib/avatar";
import { getDataChipsBalance } from "@/lib/economy";

type AuthState = {
  id: string;
  email: string;
  avatarUrl: string;
  chips: number;
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

      const chips = await getDataChipsBalance(user.id);

      setAuth({
        id: user.id,
        email: user.email,
        avatarUrl: getRobotAvatarDataUri(user.email, 48),
        chips,
      });
      setLoading(false);
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user;
      if (!user?.email) {
        setAuth(null);
        return;
      }

      const chips = await getDataChipsBalance(user.id);
      setAuth({
        id: user.id,
        email: user.email,
        avatarUrl: getRobotAvatarDataUri(user.email, 48),
        chips,
      });
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
      <Link href="/auth/sign-in" className="sign-in-pill" data-cy="header-signin-link">
        Sign in
      </Link>
    );
  }

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        type="button"
        className="profile-trigger"
        data-cy="profile-trigger"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <Image className="profile-avatar" src={auth.avatarUrl} alt="Profile avatar" width={24} height={24} unoptimized />
        <span className="profile-email">{auth.email}</span>
      </button>

      {menuOpen ? (
        <div className="profile-dropdown" role="menu" data-cy="profile-dropdown">
          <div className="profile-menu-header" role="none">
            <span className="profile-chips" title="Data Chips">
              <span aria-hidden>💾</span> {auth.chips} Chips
            </span>
          </div>
          <Link href="/profile" role="menuitem" data-cy="profile-menu-profile" onClick={() => setMenuOpen(false)}>
            Profile
          </Link>
          <Link href="/games/today" role="menuitem" data-cy="profile-menu-today" onClick={() => setMenuOpen(false)}>
            Today&apos;s mission
          </Link>
          <form action="/auth/sign-out" method="post">
            <button type="submit" role="menuitem" data-cy="profile-menu-signout">
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
