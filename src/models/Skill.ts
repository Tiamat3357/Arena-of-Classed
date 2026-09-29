// Skill.ts
// ABSTRACTION: Skill defines the shape (name, cooldown, use()) without
// saying what using it actually does — DamageSkill/HealSkill/BuffSkill
// each answer that differently (POLYMORPHISM).
// ENCAPSULATION: cooldown state is private; only tick()/forceReady()/
// startCooldown() may touch it.

import type { Character } from "./Character";

export interface SkillResult {
  message: string;
  damage?: number;
  heal?: number;
}

export abstract class Skill {
  private _name: string;
  private _cooldownTurns: number;
  private _currentCooldown = 0;

  constructor(name: string, cooldownTurns: number) {
    this._name = name;
    this._cooldownTurns = cooldownTurns;
  }

  get name(): string {
    return this._name;
  }

  get isReady(): boolean {
    return this._currentCooldown === 0;
  }

  get cooldownRemaining(): number {
    return this._currentCooldown;
  }

  tick(): void {
    if (this._currentCooldown > 0) this._currentCooldown--;
  }

  forceReady(): void {
    this._currentCooldown = 0;
  }

  protected startCooldown(): void {
    this._currentCooldown = this._cooldownTurns;
  }

  abstract use(user: Character, target: Character): SkillResult;
}
