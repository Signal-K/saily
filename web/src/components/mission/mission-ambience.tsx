"use client";

import { useEffect, useRef, useState } from "react";

type AmbienceType = "wind" | "ship" | "lab" | "none";

type Props = {
  type: AmbienceType;
};

const AUDIO_URLS: Record<Exclude<AmbienceType, "none">, string> = {
  wind: "/audio/ambience-wind.mp3",
  ship: "/audio/ambience-ship.mp3",
  lab: "/audio/ambience-lab.mp3",
};

export function MissionAmbience({ type }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("saily_muted") === "true";
  });

  useEffect(() => {
    // Sync muted state with local storage
    const saved = localStorage.getItem("saily_muted");
    if (saved === "true") {
      // Already set in initializer, but if it changes from elsewhere...
      // Actually, we can just leave it if it's only for initialization.
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted || !isEnabled;
      if (isEnabled && !isMuted && type !== "none") {
        audioRef.current.play().catch(() => {
          // Auto-play might be blocked
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isEnabled, isMuted, type]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem("saily_muted", String(nextMuted));
  };

  if (type === "none") return null;

  return (
    <div className="mission-ambience-control">
      <audio
        ref={audioRef}
        src={AUDIO_URLS[type as keyof typeof AUDIO_URLS]}
        loop
        autoPlay={isEnabled && !isMuted}
      />
      
      {!isEnabled ? (
        <button 
          className="ambience-enable-btn"
          onClick={() => setIsEnabled(true)}
        >
          <span aria-hidden>🔊</span> Enable Audio
        </button>
      ) : (
        <button 
          className={`ambience-mute-btn${isMuted ? " is-muted" : ""}`}
          onClick={toggleMute}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
      )}

      <style jsx>{`
        .mission-ambience-control {
          position: fixed;
          bottom: 1rem;
          right: 1rem;
          z-index: 100;
        }
        .ambience-enable-btn {
          background: var(--brand);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .ambience-mute-btn {
          background: var(--surface);
          border: 1px solid var(--border);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
        }
        .ambience-mute-btn.is-muted {
          opacity: 0.6;
        }
        @media (max-width: 768px) {
          .mission-ambience-control {
            bottom: 5rem; /* Above mobile bottom nav */
          }
        }
      `}</style>
    </div>
  );
}
