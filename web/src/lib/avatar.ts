import { createAvatar } from "@dicebear/core";
import * as botttsNeutral from "@dicebear/bottts-neutral";

export function getRobotAvatarDataUri(seed: string, size = 64) {
  return createAvatar(botttsNeutral, {
    seed,
    size,
    radius: 50,
    backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
  }).toDataUri();
}
