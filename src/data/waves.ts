// waves.ts
// Plain data factory — not a class, but that's fine: not every file needs
// to be a class for the project to satisfy the OOP requirements, and
// keeping enemy data separate from Monster.ts and Battle.ts keeps both
// of those easy to read.

import { Monster } from "../models/Monster";

export function createWave(waveNumber: number): Monster[] {
  switch (waveNumber) {
    case 1:
      return [
        new Monster("Goblin", "grass", 60, 10, "👺"),
        new Monster("Goblin Scout", "grass", 50, 9, "👺"),
      ];
    case 2:
      return [
        new Monster("Orc", "fire", 90, 14, "👹"),
        new Monster("Dark Slime", "water", 70, 11, "🟣"),
      ];
    case 3:
      return [new Monster("Ancient Drake", "fire", 220, 22, "🐉", true)];
    default:
      throw new Error(`No such wave: ${waveNumber}`);
  }
}
