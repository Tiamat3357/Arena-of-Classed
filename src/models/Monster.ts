// Monster.ts
// INHERITANCE + POLYMORPHISM: the enemy is a Character too. Battle.ts and
// main.ts never need special-case code to fight it — they just call
// .attack() and let polymorphism handle the rest.

import { Character } from "./Character";
import type { AttackResult } from "./Character";
import type { SkillResult } from "./Skill";
import type { Element } from "./Element";
import { elementMultiplier } from "./Element";

export class Monster extends Character {
  private _icon: string;
  private _isBoss: boolean;

  constructor(name: string, element: Element, maxHp: number, attackPower: number, icon: string, isBoss = false) {
    super(name, element, maxHp, attackPower, []);
    this._icon = icon;
    this._isBoss = isBoss;
  }

  get className(): string {
    return this._isBoss ? "Boss" : "Monster";
  }

  get icon(): string {
    return this._icon;
  }

  get isBoss(): boolean {
    return this._isBoss;
  }

  override attack(target: Character): AttackResult {
    const multiplier = elementMultiplier(this.element, target.element);
    const roll = this.attackPower + Math.floor(Math.random() * 6) - 2;
    const damage = Math.max(1, Math.round(roll * multiplier));
    target.takeDamage(damage);
    return { message: `${this.name} โจมตี ${target.name}`, damage };
  }

  // Monsters never actually reach a full gauge in this version, so this
  // path is unused in practice — but every Character subclass must supply
  // one to satisfy the abstract contract.
  override ultimate(target: Character): SkillResult {
    return this.attack(target);
  }
}
