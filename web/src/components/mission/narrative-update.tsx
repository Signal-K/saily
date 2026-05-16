"use client";

import Image from "next/image";
import { getRobotAvatarDataUri, type AvatarExpression } from "@/lib/avatar";
import type { Character } from "@/lib/characters";

type Props = {
  character: Character;
  text: string;
  expression?: AvatarExpression;
  continueLabel?: string;
  onContinue: () => void;
};

export function NarrativeUpdate({ character, text, expression, continueLabel, onContinue }: Props) {
  const avatarSrc = getRobotAvatarDataUri(character.avatarSeed, 48, expression);

  return (
    <div className="narrative-update panel">
      <div className="narrative-update-header">
        <Image
          src={avatarSrc}
          alt={character.name}
          width={40}
          height={40}
          unoptimized
          className="narrative-update-avatar"
        />
        <div className="narrative-update-source">
          <span className="narrative-update-name">{character.name}</span>
          <span className="narrative-update-label muted">Research log update</span>
        </div>
      </div>

      <p className="narrative-update-text">{text}</p>

      <button type="button" className="button button-primary" onClick={onContinue}>
        {continueLabel ?? "Advance Mission"} &rarr;
      </button>
    </div>
  );
}
