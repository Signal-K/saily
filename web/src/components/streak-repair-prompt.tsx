"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { repairStreak, getDataChipsBalance } from "@/lib/economy";
import { shiftDateKey } from "@/lib/melbourne-date";
import { queueSurveyTrigger } from "@/lib/posthog/survey-queue";
import Image from "next/image";

type StreakRepairPromptProps = {
  userId: string;
  gameDate: string; // The current "today" date
  onRepairComplete: () => void;
};

export function StreakRepairPrompt({ userId, gameDate, onRepairComplete }: StreakRepairPromptProps) {
  const [canRepair, setCanRepair] = useState(false);
  const [repairDate, setRepairDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chips, setChips] = useState(0);
  const [repairing, setRepairing] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkRepairStatus() {
      const supabase = createClient();
      
      const yesterdayStr = shiftDateKey(gameDate, -1);
      const dayBeforeStr = shiftDateKey(gameDate, -2);

      // Fetch plays
      const { data: plays, error: playsError } = await supabase
        .from("daily_plays")
        .select("game_date")
        .eq("user_id", userId)
        .in("game_date", [yesterdayStr, dayBeforeStr]);

      if (playsError) {
        setLoading(false);
        return;
      }

      const playedYesterday = plays?.some((p) => p.game_date === yesterdayStr);
      const playedDayBefore = plays?.some((p) => p.game_date === dayBeforeStr);

      // If played yesterday, no repair needed (streak is intact or broken before yesterday)
      if (playedYesterday) {
        if (mounted) {
          setCanRepair(false);
          setLoading(false);
        }
        return;
      }

      // If missed yesterday BUT played day before, we can offer to repair yesterday
      if (playedDayBefore) {
        // Check chips
        const balance = await getDataChipsBalance(userId);
        if (mounted) {
          setChips(balance);
          setCanRepair(true);
          setRepairDate(yesterdayStr);
        }
      }
      
      if (mounted) setLoading(false);
    }

    void checkRepairStatus();

    return () => {
      mounted = false;
    };
  }, [userId, gameDate]);

  async function handleRepair() {
    if (!repairDate || chips < 1) return;
    setRepairing(true);
    setError(null);
    try {
      await repairStreak(repairDate);
      queueSurveyTrigger({
        source: "streak_repair",
        version: process.env.NEXT_PUBLIC_APP_VERSION?.trim() || "v1",
        gameDate,
      });
      onRepairComplete();
      setCanRepair(false); // Hide prompt
    } catch {
      setError("Failed to repair streak. Try again.");
    } finally {
      setRepairing(false);
    }
  }

  if (loading || !canRepair || !repairDate || dismissed) return null;

  const hasChips = chips > 0;

  return (
    <div className="panel streak-repair-prompt">
      <div className="streak-repair-content">
        <div className="streak-repair-icon">
          {hasChips ? (
            <Image src="/assets/streak-repair.svg" alt="" width={48} height={48} />
          ) : (
            <span aria-hidden>⚠️</span>
          )}
        </div>
        <div className="streak-repair-text">
          <h3>Streak Broken!</h3>
          {hasChips ? (
            <>
              <p>You missed yesterday&apos;s mission. Use a Data Chip to repair your streak?</p>
              <div className="streak-repair-balance">
                <Image src="/assets/data-chip.svg" alt="" width={16} height={16} />
                <span>Balance: {chips} Chip{chips !== 1 ? "s" : ""}</span>
              </div>
            </>
          ) : (
            <p>You missed yesterday&apos;s mission. You need 1 Data Chip to repair your streak, but you have 0. Complete a storyline to earn more!</p>
          )}
        </div>
      </div>
      <div className="streak-repair-actions">
        {error ? <p className="error-message">{error}</p> : null}
        <button 
          className="button"
          onClick={() => setDismissed(true)}
          disabled={repairing}
        >
          Skip
        </button>
        {hasChips && (
          <button 
            className="button button-primary"
            onClick={() => void handleRepair()}
            disabled={repairing}
          >
            {repairing ? "Repairing..." : "Repair Streak (-1 Chip)"}
          </button>
        )}
      </div>
      <style jsx>{`
        .streak-repair-prompt {
          background: var(--surface-2);
          border: 1px solid var(--border);
          padding: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border-left: 4px solid var(--brand);
        }
        .streak-repair-content {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .streak-repair-icon {
          font-size: 2rem;
        }
        .streak-repair-text h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1.1rem;
          font-weight: 600;
        }
        .streak-repair-text p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--muted);
        }
        .streak-repair-balance {
          margin-top: 0.25rem !important;
          font-weight: 500;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .streak-repair-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 1rem;
        }
        .error-message {
          color: var(--error);
          font-size: 0.85rem;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
