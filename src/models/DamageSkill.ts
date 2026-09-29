// DamageSkill.ts
// POLYMORPHISM: one of three different implementations of use().

import { Skill } from "./Skill";
import type { SkillResult } from "./Skill";
import type { Character } from "./Character";
import { elementMultiplier } from "./Element";

export class DamageSkill extends Skill {
  private _bonusPower: number;

  constructor(name: string, cooldownTurns: number, bonusPower: number) {
    super(name, cooldownTurns);
    this._bonusPower = bonusPower;
  }

  override use(user: Character, target: Character): SkillResult {
    this.startCooldown();
    const multiplier = elementMultiplier(user.element, target.element);
    const damage = Math.round((user.attackPower + this._bonusPower) * multiplier);
    target.takeDamage(damage);
    user.gainGauge(15);
    const tag = multiplier > 1 ? " (ได้เปรียบธาตุ!)" : multiplier < 1 ? " (เสียเปรียบธาตุ)" : "";
    return { message: `${user.name} ใช้ ${this.name} ใส่ ${target.name}${tag}`, damage };
  }
}
