// Knight.ts
// INHERITANCE + POLYMORPHISM: Kaelen's attack/ultimate formulas are unique
// to this class.

import { Character } from "./Character";
import type { AttackResult } from "./Character";
import type { SkillResult } from "./Skill";
import { DamageSkill } from "./DamageSkill";
import { BuffSkill } from "./BuffSkill";
import { elementMultiplier } from "./Element";

export class Knight extends Character {
  constructor(name: string) {
    super(name, "fire", 140, 20, [
      new DamageSkill("Radiant Slash", 1, 8),
      new DamageSkill("Blazing Cleave", 2, 18),
      new BuffSkill("Vow of Valor", 3, 10, 3),
    ]);
  }

  get className(): string {
    return "Knight";
  }

  get icon(): string {
    return "🛡️";
  }

  override attack(target: Character): AttackResult {
    const multiplier = elementMultiplier(this.element, target.element);
    const damage = Math.round((this.attackPower + Math.floor(Math.random() * 5)) * multiplier);
    target.takeDamage(damage);
    this.gainGauge(10);
    return { message: `${this.name} ฟันดาบใส่ ${target.name}`, damage };
  }

  override ultimate(target: Character): SkillResult {
    const multiplier = elementMultiplier(this.element, target.element);
    const damage = Math.round(this.attackPower * 3 * multiplier);
    target.takeDamage(damage);
    return { message: `${this.name} ใช้ SUNFALL EDGE ใส่ ${target.name}!! ☀️⚔️`, damage };
  }
}
