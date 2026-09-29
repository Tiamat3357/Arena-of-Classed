// Character.ts
// ABSTRACTION: Character can never be instantiated directly. It defines the
// shape every fighter must have; each subclass fills in the details.
// ENCAPSULATION: HP, ultimate gauge, buffs, and skill cooldowns are all
// private — reachable only through the public methods below.

import type { Element } from "./Element";
import { Skill } from "./Skill";
import type { SkillResult } from "./Skill";

export interface AttackResult {
  message: string;
  damage: number;
}

interface ActiveBuff {
  attackBonus: number;
  turnsLeft: number;
}

export abstract class Character {
  private _name: string;
  private _element: Element;
  private _maxHp: number;
  private _currentHp: number;
  private _baseAttackPower: number;
  private _gauge = 0;
  private _buff: ActiveBuff | null = null;
  private _skills: Skill[];
  private _avatarUrl: string | null = null;

  constructor(name: string, element: Element, maxHp: number, attackPower: number, skills: Skill[]) {
    this._name = name;
    this._element = element;
    this._maxHp = maxHp;
    this._currentHp = maxHp;
    this._baseAttackPower = attackPower;
    this._skills = skills;
  }

  get name(): string {
    return this._name;
  }

  get element(): Element {
    return this._element;
  }

  get maxHp(): number {
    return this._maxHp;
  }

  get currentHp(): number {
    return this._currentHp;
  }

  get hpPercent(): number {
    return Math.max(0, Math.round((this._currentHp / this._maxHp) * 100));
  }

  get isAlive(): boolean {
    return this._currentHp > 0;
  }

  get skills(): readonly Skill[] {
    return this._skills;
  }

  get gauge(): number {
    return this._gauge;
  }

  get ultimateReady(): boolean {
    return this._gauge >= 100;
  }

  get attackPower(): number {
    return this._baseAttackPower + (this._buff?.attackBonus ?? 0);
  }

  // Optional real artwork. If never set, the GUI falls back to icon (emoji).
  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  setAvatar(url: string): void {
    this._avatarUrl = url;
  }

  // ENCAPSULATION: the only legal way HP goes down.
  takeDamage(amount: number): number {
    const actual = Math.min(this._currentHp, Math.max(0, amount));
    this._currentHp -= actual;
    this.gainGauge(8);
    return actual;
  }

  // ENCAPSULATION: the only legal way HP goes up.
  heal(amount: number): number {
    const actual = Math.min(this._maxHp - this._currentHp, amount);
    this._currentHp += actual;
    return actual;
  }

  gainGauge(amount: number): void {
    this._gauge = Math.min(100, this._gauge + amount);
  }

  applyBuff(attackBonus: number, turns: number): void {
    this._buff = { attackBonus, turnsLeft: turns };
  }

  // Called once per round for every character still standing — ticks
  // down skill cooldowns and buff duration.
  endTurnTick(): void {
    this._skills.forEach((s) => s.tick());
    if (this._buff) {
      this._buff.turnsLeft--;
      if (this._buff.turnsLeft <= 0) this._buff = null;
    }
  }

  // ABSTRACTION: every subclass must define its own basic attack, class
  // name, icon, and ultimate effect (POLYMORPHISM happens here).
  abstract attack(target: Character): AttackResult;
  abstract get className(): string;
  abstract get icon(): string;
  abstract ultimate(target: Character): SkillResult;

  // Template method: handles the shared "is the gauge full? consume it"
  // logic once, so every subclass's ultimate() only needs to define the
  // actual effect.
  useUltimate(target: Character): SkillResult | null {
    if (!this.ultimateReady) return null;
    this._gauge = 0;
    return this.ultimate(target);
  }
}
