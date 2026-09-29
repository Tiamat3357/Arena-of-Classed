// Ranger.ts
// INHERITANCE + POLYMORPHISM: Sylas's attack has a random critical-hit
// chance, unlike Knight or Mage.

import { Character } from "./Character";
import type { AttackResult } from "./Character";
import type { SkillResult } from "./Skill";
import { DamageSkill } from "./DamageSkill";
import { elementMultiplier } from "./Element";

export class Ranger extends Character {
  private readonly _critChance = 0.3;

  constructor(name: string) {
    super(name, "grass", 100, 18, [
      new DamageSkill("Quick Shot", 1, 6),
      new DamageSkill("Vine Snare", 2, 10),
      new DamageSkill("Piercing Arrow", 2, 20),
    ]);
  }

  get className(): string {
    return "Ranger";
  }

  get icon(): string {
    return "🏹";
  }

  override attack(target: Character): AttackResult {
    const isCritical = Math.random() < this._critChance;
    const multiplier = elementMultiplier(this.element, target.element) * (isCritical ? 2 : 1);
    const damage = Math.round(this.attackPower * multiplier);
    target.takeDamage(damage);
    this.gainGauge(10);
    return {
      message: isCritical
        ? `${this.name} ยิงธนูจุดอ่อน ${target.name} แบบ CRITICAL!! 🎯`
        : `${this.name} ยิงธนูใส่ ${target.name}`,
      damage,
    };
  }

  override ultimate(target: Character): SkillResult {
    const multiplier = elementMultiplier(this.element, target.element);
    const damage = Math.round(this.attackPower * 2.8 * multiplier);
    target.takeDamage(damage);
    return { message: `${this.name} ใช้ THOUSAND LEAF VOLLEY ใส่ ${target.name}!! 🍃🏹`, damage };
  }
}
