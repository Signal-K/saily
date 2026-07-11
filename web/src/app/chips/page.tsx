"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/pocketbase/client";
import { unlockArchive, getDataChipsBalance } from "@/lib/economy";
import { shiftDateKey, getMelbourneDateKey } from "@/lib/melbourne-date";
import Image from "next/image";
import Link from "next/link";

type ArchiveDate = { date: string; label: string };

function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
}

export default function ChipsPage() {
  const [chips, setChips] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [archiveDates, setArchiveDates] = useState<ArchiveDate[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const pocketbase = createClient();
      const { data: { user } } = await pocketbase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const today = getMelbourneDateKey();
      const balance = await getDataChipsBalance();
      setChips(balance);

      const archiveCandidates = Array.from({ length: 30 }, (_, i) => shiftDateKey(today, -(i + 1)));
      const allDates = [today, ...archiveCandidates];
      const statusResponse = await fetch(`/api/chips/archive-status?dates=${encodeURIComponent(allDates.join(","))}`, { cache: "no-store" });
      const status = (await statusResponse.json()) as { played?: string[]; unlocked?: string[] };

      const playedSet = new Set(status.played ?? []);
      const unlockedSet = new Set(status.unlocked ?? []);
      const archiveList = archiveCandidates
        .filter((d) => !playedSet.has(d) && !unlockedSet.has(d))
        .slice(0, 10)
        .map((d) => ({ date: d, label: formatDateLabel(d) }));
      setArchiveDates(archiveList);
    }
    void load();
  }, []);

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
            {chips === null ? "-" : chips}
          </p>
        </div>
      </div>

      {error && <p className="puzzle-feedback" style={{ marginBottom: "1rem" }}>{error}</p>}

      {/* Archive Unlock */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Unlock an Archive Day</h2>
        <p className="muted" style={{ marginBottom: "0.75rem", fontSize: "0.875rem" }}>
          Replay a past mission. No score is awarded; this is just the science archive.
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
                  {pending === date ? "Unlocking..." : done.has(date) ? "Unlocked" : "Unlock (-1 Chip)"}
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
