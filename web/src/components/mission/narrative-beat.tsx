"use client";

import Image from "next/image";
import { getRobotAvatarDataUri } from "@/lib/avatar";
import type { Character } from "@/lib/characters";

type Props = {
  character: Character;
  text: string;
  gameLabel: string;
  nextGameLabel: string;
  onContinue: () => void;
};

export function NarrativeBeat({ character, text, gameLabel, nextGameLabel, onContinue }: Props) {
  const avatarSrc = getRobotAvatarDataUri(character.avatarSeed, 48);

  return (
    <div className="narrative-beat panel">
      <div className="narrative-beat-header">
        <Image
          src={avatarSrc}
          alt={character.name}
          width={40}
          height={40}
          unoptimized
          className="narrative-beat-avatar"
        />
        <div className="narrative-beat-source">
          <span className="narrative-beat-name">{character.name}</span>
          <span className="narrative-beat-label muted">{gameLabel} complete</span>
        </div>
      </div>

      <p className="narrative-beat-text">{text}</p>

      <button type="button" className="button button-primary" onClick={onContinue}>
        Continue to {nextGameLabel} &rarr;
      </button>
    </div>
  );
}
