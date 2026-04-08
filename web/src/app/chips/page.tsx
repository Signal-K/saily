"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { repairStreak, unlockArchive, getDataChipsBalance } from "@/lib/economy";
import { shiftDateKey, getMelbourneDateKey } from "@/lib/melbourne-date";
import Image from "next/image";
import Link from "next/link";

type RepairableDate = { date: string; label: string };
type ArchiveDate = { date: string; label: string };

function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
}

export default function ChipsPage() {
  const [chips, setChips] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [repairable, setRepairable] = useState<RepairableDate[]>([]);
  const [archiveDates, setArchiveDates] = useState<ArchiveDate[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const today = getMelbourneDateKey();
      const balance = await getDataChipsBalance(user.id);
      setChips(balance);

      // Find repairable dates: last 7 days where user missed but has a surrounding play
      const candidates = Array.from({ length: 7 }, (_, i) => shiftDateKey(today, -(i + 1)));
      const { data: plays } = await supabase
        .from("daily_plays")
        .select("game_date")
        .eq("user_id", user.id)
        .in("game_date", [today, ...candidates, shiftDateKey(today, -8)]);

      const playedSet = new Set((plays ?? []).map((p) => p.game_date as string));

      // A date is repairable if it was missed and the day before it was played
      const repairList: RepairableDate[] = [];
      for (const date of candidates) {
        if (!playedSet.has(date)) {
          const dayBefore = shiftDateKey(date, -1);
          if (playedSet.has(dayBefore) || playedSet.has(shiftDateKey(date, 1))) {
            repairList.push({ date, label: formatDateLabel(date) });
          }
        }
      }
      setRepairable(repairList);

      // Archive dates: last 30 days not yet played or unlocked
      const archiveCandidates = Array.from({ length: 30 }, (_, i) => shiftDateKey(today, -(i + 1)));
      const { data: unlocks } = await supabase
        .from("archive_unlocks")
        .select("game_date")
        .eq("user_id", user.id)
        .in("game_date", archiveCandidates);

      const unlockedSet = new Set((unlocks ?? []).map((u) => u.game_date as string));
      const archiveList = archiveCandidates
        .filter((d) => !playedSet.has(d) && !unlockedSet.has(d))
        .slice(0, 10)
        .map((d) => ({ date: d, label: formatDateLabel(d) }));
      setArchiveDates(archiveList);
    }
    void load();
  }, []);

  async function handleRepair(date: string) {
    if (pending) return;
    setPending(date);
    setError(null);
    try {
      await repairStreak(date);
      setChips((c) => (c !== null ? c - 1 : c));
      setDone((prev) => new Set(prev).add(date));
      setRepairable((prev) => prev.filter((r) => r.date !== date));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to repair streak.");
    } finally {
      setPending(null);
    }
  }

  async function handleUnlock(date: string) {
    if (pending) return;
    setPending(date);
    setError(null);
    try {
      await unlockArchive(date);
      setChips((c) => (c !== null ? c - 1 : c));
      setDone((prev) => new Set(prev).add(date));
      setArchiveDates((prev) => prev.filter((a) => a.date !== date));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlock archive day.");
    } finally {
      setPending(null);
    }
  }

  if (!userId) {
    return (
      <main className="panel" style={{ maxWidth: "480px", margin: "2rem auto", textAlign: "center" }}>
        <p>Sign in to manage your Data Chips.</p>
        <Link href="/auth/sign-in?next=/chips" className="button button-primary" style={{ marginTop: "1rem" }}>
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "480px", margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <p className="eyebrow">Economy</p>
        <h1>Data Chips</h1>
      </div>

      <div className="panel" style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <Image src="/assets/data-chip.svg" alt="" width={40} height={40} />
        <div>
          <p className="muted" style={{ margin: 0 }}>Balance</p>
          <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            {chips === null ? "—" : chips}
          </p>
        </div>
      </div>

      {error && <p className="puzzle-feedback" style={{ marginBottom: "1rem" }}>{error}</p>}

      {/* Streak Repair */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Repair a Missed Day</h2>
        {repairable.length === 0 ? (
          <p className="muted">No repairable days found.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {repairable.map(({ date, label }) => (
              <div key={date} className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem" }}>
                <span>{label}</span>
                <button
                  className="button button-sm"
                  disabled={pending === date || (chips ?? 0) < 1 || done.has(date)}
                  onClick={() => void handleRepair(date)}
                >
                  {pending === date ? "Repairing…" : done.has(date) ? "Repaired ✓" : "Repair (−1 Chip)"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Archive Unlock */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Unlock an Archive Day</h2>
        <p className="muted" style={{ marginBottom: "0.75rem", fontSize: "0.875rem" }}>
          Replay a past mission. No score or streak — just the science.
        </p>
        {archiveDates.length === 0 ? (
          <p className="muted">No archive days available.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {archiveDates.map(({ date, label }) => (
              <div key={date} className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem" }}>
                <span>{label}</span>
                <button
                  className="button button-sm"
                  disabled={pending === date || (chips ?? 0) < 1 || done.has(date)}
                  onClick={() => void handleUnlock(date)}
                >
                  {pending === date ? "Unlocking…" : done.has(date) ? "Unlocked ✓" : "Unlock (−1 Chip)"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <Link href="/" className="button">Back to Home</Link>
    </main>
  );
}
