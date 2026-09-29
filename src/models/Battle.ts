// Battle.ts
// This class only ever talks to the abstract Character type — it never
// imports Knight/Mage/Ranger/Monster. That's POLYMORPHISM actually being
// used: Battle can referee any team of Characters against any wave of
// enemies without changing a single line here.

import type { Character } from "./Character";
import type { Monster } from "./Monster";
import { createWave } from "../data/waves";
import { Reward, AttackBuffReward, HealReward, CooldownResetReward } from "./Reward";

export type BattlePhase = "battle" | "reward" | "victory" | "defeat";

export class Battle {
  private _team: Character[];
  private _enemies: Monster[];
  private _waveNumber = 1;
  private readonly _totalWaves = 3;
  private _log: string[] = [];
  private _phase: BattlePhase = "battle";
  private _rewardOptions: Reward[] = [];

  constructor(team: Character[]) {
    this._team = team;
    this._enemies = createWave(this._waveNumber);
    this._log.push(`Wave ${this._waveNumber}/${this._totalWaves} เริ่มขึ้น!`);
  }

  get team(): readonly Character[] {
    return this._team;
  }

  get enemies(): readonly Monster[] {
    return this._enemies;
  }

  get waveNumber(): number {
    return this._waveNumber;
  }

  get totalWaves(): number {
    return this._totalWaves;
  }

  get log(): readonly string[] {
    return this._log;
  }

  get phase(): BattlePhase {
    return this._phase;
  }

  get rewardOptions(): readonly Reward[] {
    return this._rewardOptions;
  }

  addLog(message: string): void {
    this._log.push(message);
  }

  private aliveTeam(): Character[] {
    return this._team.filter((c) => c.isAlive);
  }

  private aliveEnemies(): Monster[] {
    return this._enemies.filter((c) => c.isAlive);
  }

  private randomFrom<T>(arr: T[]): T | undefined {
    if (arr.length === 0) return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Runs the player's chosen action, then lets one living enemy counter.
  playerAction(action: () => void): void {
    if (this._phase !== "battle") return;

    action();

    if (this.aliveEnemies().length === 0) {
      this.onWaveCleared();
      return;
    }

    const enemy = this.randomFrom(this.aliveEnemies());
    const targetPlayer = this.randomFrom(this.aliveTeam());
    if (enemy && targetPlayer) {
      const result = enemy.attack(targetPlayer);
      this._log.push(`${result.message} (-${result.damage} HP)`);
    }

    if (this.aliveTeam().length === 0) {
      this._phase = "defeat";
      this._log.push(`💀 ทีมพ่ายแพ้...`);
      return;
    }

    this._team.forEach((c) => c.endTurnTick());
  }

  private onWaveCleared(): void {
    this._log.push(`✅ Wave ${this._waveNumber} ผ่านแล้ว!`);
    if (this._waveNumber >= this._totalWaves) {
      this._phase = "victory";
      return;
    }
    this._rewardOptions = [new AttackBuffReward(), new HealReward(), new CooldownResetReward()].sort(
      () => Math.random() - 0.5
    );
    this._phase = "reward";
  }

  chooseReward(reward: Reward): void {
    if (this._phase !== "reward") return;
    reward.apply(this._team);
    this._log.push(`🎁 เลือก "${reward.name}" — ${reward.description}`);
    this._waveNumber++;
    this._enemies = createWave(this._waveNumber);
    this._log.push(`Wave ${this._waveNumber}/${this._totalWaves} เริ่มขึ้น!`);
    this._phase = "battle";
  }
}
