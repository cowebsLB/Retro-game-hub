import type { ComponentType } from "react";
import { MemoryVaultGame } from "../games/MemoryVaultGame";
import { NeonMeteorRunGame } from "../games/NeonMeteorRunGame";
import { PixelBreachGame } from "../games/PixelBreachGame";
import { SkylineSprintGame } from "../games/SkylineSprintGame";

export const localGameRegistry: Record<string, ComponentType> = {
  "neon-meteor-run": NeonMeteorRunGame,
  "skyline-sprint-gx": SkylineSprintGame,
  "memory-vault-84": MemoryVaultGame,
  "pixel-breach": PixelBreachGame,
};

export function getLocalGameComponent(playTarget: string) {
  return localGameRegistry[playTarget];
}
