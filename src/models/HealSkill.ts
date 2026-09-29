// HealSkill.ts
// POLYMORPHISM: second implementation of use() — restores HP instead of
// dealing damage.

import { Skill } from "./Skill";
import type { SkillResult } from "./Skill";
import type { Character } from "./Character";

export class HealSkill extends Skill {
  private _healAmount: number;

  constructor(name: string, cooldownTurns: number, healAmount: number) {
    super(name, cooldownTurns);
    this._healAmount = healAmount;
  }

  override use(user: Character, target: Character): SkillResult {
    this.startCooldown();
    const healed = target.heal(this._healAmount);
    user.gainGauge(10);
    return { message: `${user.name} ใช้ ${this.name} รักษา ${target.name}`, heal: healed };
  }
}
