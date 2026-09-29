// Mage.ts
// INHERITANCE + POLYMORPHISM: Nerine's attack/ultimate formulas differ
// from Knight and Ranger, and she's the only one with a heal skill.

import { Character } from "./Character";
import type { AttackResult } from "./Character";
import type { SkillResult } from "./Skill";
import { DamageSkill } from "./DamageSkill";
import { HealSkill } from "./HealSkill";
import { BuffSkill } from "./BuffSkill";
import { elementMultiplier } from "./Element";

export class Mage extends Character {
  constructor(name: string) {
    super(name, "water", 95, 17, [
      new DamageSkill("Water Bolt", 1, 10),
      new HealSkill("Tidal Heal", 2, 30),
      new BuffSkill("Mana Surge", 3, 8, 2),
    ]);
  }

  get className(): string {
    return "Mage";
  }

  get icon(): string {
    return "🔮";
  }

  override attack(target: Character): AttackResult {
    const multiplier = elementMultiplier(this.element, target.element);
    const damage = Math.round(this.attackPower * multiplier);
    target.takeDamage(damage);
    this.gainGauge(10);
    return { message: `${this.name} ใช้เวทโจมตี ${target.name}`, damage };
  }

  override ultimate(target: Character): SkillResult {
    const multiplier = elementMultiplier(this.element, target.element);
    const damage = Math.round(this.attackPower * 2.5 * multiplier);
    target.takeDamage(damage);
    return { message: `${this.name} ใช้ TSUNAMI REQUIEM ใส่ ${target.name}!! 🌊`, damage };
  }
}
