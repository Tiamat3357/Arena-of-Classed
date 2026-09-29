// Reward.ts
// ABSTRACTION + POLYMORPHISM: three different reward effects behind one
// apply() method, chosen by the player between waves.

import type { Character } from "./Character";

export abstract class Reward {
  private _name: string;
  private _description: string;

  constructor(name: string, description: string) {
    this._name = name;
    this._description = description;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  abstract apply(team: Character[]): void;
}

export class AttackBuffReward extends Reward {
  constructor() {
    super("⚔️ พลังโจมตี +20%", "ทุกคนในทีมโจมตีแรงขึ้นตลอดการผจญภัยนี้");
  }

  override apply(team: Character[]): void {
    team.forEach((c) => c.applyBuff(Math.round(c.attackPower * 0.2), 99));
  }
}

export class HealReward extends Reward {
  constructor() {
    super("💚 ฟื้นฟูทีม", "ฮีล HP ทุกคน 40% ของ HP สูงสุด");
  }

  override apply(team: Character[]): void {
    team.forEach((c) => c.heal(Math.round(c.maxHp * 0.4)));
  }
}

export class CooldownResetReward extends Reward {
  constructor() {
    super("🔄 รีเซ็ตสกิล", "สกิลของทุกคนพร้อมใช้งานทันที");
  }

  override apply(team: Character[]): void {
    team.forEach((c) => c.skills.forEach((s) => s.forceReady()));
  }
}
