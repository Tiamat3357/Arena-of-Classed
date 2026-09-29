// BuffSkill.ts
// POLYMORPHISM: third implementation of use() — no damage or healing,
// just a temporary attack boost.

import { Skill } from "./Skill";
import type { SkillResult } from "./Skill";
import type { Character } from "./Character";

export class BuffSkill extends Skill {
  private _attackBonus: number;
  private _duration: number;

  constructor(name: string, cooldownTurns: number, attackBonus: number, duration: number) {
    super(name, cooldownTurns);
    this._attackBonus = attackBonus;
    this._duration = duration;
  }

  override use(user: Character, target: Character): SkillResult {
    this.startCooldown();
    target.applyBuff(this._attackBonus, this._duration);
    user.gainGauge(10);
    return { message: `${user.name} ใช้ ${this.name} เสริมพลังให้ ${target.name}` };
  }
}
