import { createAvatar } from "@dicebear/core";
import * as botttsNeutral from "@dicebear/bottts-neutral";

export type AvatarExpression = "neutral" | "happy" | "sad" | "surprised" | "serious";

type Mouth = "bite" | "diagram" | "grill01" | "grill02" | "grill03" | "smile01" | "smile02" | "square01" | "square02";

const MOUTH_MAP: Record<AvatarExpression, Mouth[]> = {
  neutral: ["bite"],
  happy: ["smile01"],
  sad: ["grill03"],
  surprised: ["grill01"],
  serious: ["square01", "square02"],
};

export function getRobotAvatarDataUri(seed: string, size = 64, expression: AvatarExpression = "neutral") {
  return createAvatar(botttsNeutral, {
    seed,
    size,
    radius: 50,
    backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
    mouth: MOUTH_MAP[expression],
  }).toDataUri();
}
