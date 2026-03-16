"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { repairStreak, getDataChipsBalance } from "@/lib/economy";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkRepairStatus() {
      const supabase = createClient();
      
      // Calculate dates
      // TODO: Ensure this matches the global "Melbourne Midnight" logic if needed. 
      // For now, assuming gameDate is YYYY-MM-DD.
      const today = new Date(gameDate);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dayBefore = new Date(today);
      dayBefore.setDate(dayBefore.getDate() - 2);

      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      const dayBeforeStr = dayBefore.toISOString().slice(0, 10);

      // Fetch plays
      const { data: plays, error: playsError } = await supabase
        .from("daily_plays")
        .select("game_date")
        .eq("user_id", userId)
        .in("game_date", [yesterdayStr, dayBeforeStr]);

      if (playsError) {
        console.error("Error checking plays:", playsError);
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

      // If missed yesterday BUT played day before, we can repair yesterday
      if (playedDayBefore) {
        // Check chips
        const balance = await getDataChipsBalance(userId);
        if (mounted) {
          setChips(balance);
          if (balance > 0) {
            setCanRepair(true);
            setRepairDate(yesterdayStr);
          }
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
    if (!repairDate) return;
    setRepairing(true);
    setError(null);
    try {
      await repairStreak(repairDate);
      onRepairComplete();
      setCanRepair(false); // Hide prompt
    } catch (err: unknown) {
      console.error("Repair failed:", err);
      setError("Failed to repair streak. Try again.");
    } finally {
      setRepairing(false);
    }
  }

  if (loading || !canRepair || !repairDate) return null;

  return (
    <div className="panel streak-repair-prompt">
      <div className="streak-repair-content">
        <div className="streak-repair-icon">
          <span aria-hidden>🩹</span>
        </div>
        <div className="streak-repair-text">
          <h3>Streak Broken!</h3>
          <p>You missed yesterday's mission. Use a Data Chip to repair your streak?</p>
          <p className="streak-repair-balance">
            Balance: {chips} Chip{chips !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="streak-repair-actions">
        {error ? <p className="error-message">{error}</p> : null}
        <button 
          className="button button-primary"
          onClick={() => void handleRepair()}
          disabled={repairing}
        >
          {repairing ? "Repairing..." : "Repair Streak (-1 Chip)"}
        </button>
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
