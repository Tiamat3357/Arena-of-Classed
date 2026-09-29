import "./styles.css";
import type { Character } from "./models/Character";
import { Knight } from "./models/Knight";
import { Mage } from "./models/Mage";
import { Ranger } from "./models/Ranger";
import type { Monster } from "./models/Monster";
import type { Skill } from "./models/Skill";
import { HealSkill } from "./models/HealSkill";
import { BuffSkill } from "./models/BuffSkill";
import { Battle } from "./models/Battle";
import kaelenImg from "./assets/kaelen.png";
import nerineImg from "./assets/nerine.png";
import sylasImg from "./assets/sylas.png";

const app = document.querySelector<HTMLDivElement>("#app")!;

let battle: Battle | null = null;
let selectedActorName: string | null = null;
let pendingAction: { kind: "attack" | "ultimate" | Skill; label: string } | null = null;

let totalTurns = 0;
let totalDamageDealt = 0;

const WAVE_TIME_LIMIT = 120;
let timeRemaining = WAVE_TIME_LIMIT;
let timerInterval: number | null = null;
let isTimeOut = false; // แฟล็กเช็กว่าเวลาหมดหรือยัง

function startTimer(): void {
  stopTimer();
  timeRemaining = WAVE_TIME_LIMIT;
  timerInterval = window.setInterval(() => {
    if (!battle || battle.phase !== "battle") {
      stopTimer();
      return;
    }
    timeRemaining--;
    const timerEl = document.querySelector<HTMLElement>("#wave-timer");
    if (timerEl) {
      timerEl.innerText = `⏱️ ${timeRemaining}s`;
      if (timeRemaining <= 15) timerEl.style.color = "#ff4d4d";
    }

    if (timeRemaining <= 0) {
      stopTimer();
      isTimeOut = true; // เซ็ตว่าเวลาหมด
      renderBattleScreen();
    }
  }, 1000);
}

function stopTimer(): void {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function buildTeam(): Character[] {
  const kaelen = new Knight("Kaelen");
  const nerine = new Mage("Nerine");
  const sylas = new Ranger("Sylas");

  kaelen.setAvatar(kaelenImg);
  nerine.setAvatar(nerineImg);
  sylas.setAvatar(sylasImg);

  return [kaelen, nerine, sylas];
}

function elementIcon(e: string): string {
  return e === "fire" ? "🔥" : e === "water" ? "💧" : e === "grass" ? "🍃" : "✨";
}

function portraitHtml(c: Character): string {
  return c.avatarUrl
    ? `<img src="${c.avatarUrl}" alt="${c.name}" class="char-portrait" />`
    : `<span class="char-icon">${c.icon}</span>`;
}

const STORY_TEXT = `กาลครั้งหนึ่ง สามธาตุแห่งโลก — ไฟ น้ำ และใบไม้ — เคยอยู่ร่วมกันอย่างสมดุล...`;

function transitionTo(renderFn: () => void): void {
  const current = app.firstElementChild as HTMLElement | null;
  if (!current) {
    renderFn();
    return;
  }
  current.classList.add("screen-fade-out");
  window.setTimeout(() => {
    renderFn();
    const next = app.firstElementChild as HTMLElement | null;
    next?.classList.add("screen-fade-in");
  }, 220);
}

function renderCharacterTooltip(c: Character): string {
  const skillsList = c.skills.map((s) => `• ${s.name}`).join("<br/>");
  return `
    <div class="char-tooltip">
      <h4>${c.name} (${c.className})</h4>
      <p>ธาตุ: ${elementIcon(c.element)} ${c.element}</p>
      <p>พลังชีวิตสูงสุด: ${c.maxHp} HP</p>
      <div class="tooltip-skills">
        <strong>สกิลประจำตัว:</strong><br/>
        ${skillsList}
      </div>
    </div>
  `;
}

function renderStartScreen(): void {
  stopTimer();
  battle = null;
  selectedActorName = null;
  pendingAction = null;
  totalTurns = 0;
  totalDamageDealt = 0;
  isTimeOut = false;

  const previewTeam = buildTeam();

  app.innerHTML = `
    <div class="start-screen">
      <h1>⚔️ Arena of Classes</h1>
      <p class="subtitle">ผจญภัยฝ่า 3 เวฟ พร้อมทีม Kaelen, Nerine และ Sylas (ชี้ที่การ์ดเพื่อดูข้อมูล)</p>
      <div class="team-preview">
        <div class="preview-card has-tooltip">
          ${portraitHtml(previewTeam[0])}
          <h3>Kaelen</h3>
          ${renderCharacterTooltip(previewTeam[0])}
        </div>
        <div class="preview-card has-tooltip">
          ${portraitHtml(previewTeam[1])}
          <h3>Nerine</h3>
          ${renderCharacterTooltip(previewTeam[1])}
        </div>
        <div class="preview-card has-tooltip">
          ${portraitHtml(previewTeam[2])}
          <h3>Sylas</h3>
          ${renderCharacterTooltip(previewTeam[2])}
        </div>
      </div>
      <div class="start-actions">
        <button id="start-btn">เริ่มผจญภัย</button>
        <button id="story-btn" class="story-btn">📖 เนื้อเรื่อง</button>
      </div>
    </div>
  `;

  app.querySelector<HTMLButtonElement>("#start-btn")?.addEventListener("click", () => {
    transitionTo(() => {
      battle = new Battle(buildTeam());
      startTimer();
      renderBattleScreen();
    });
  });
}

function hpBar(c: Character): string {
  return `
    <div class="hp-bar"><div class="hp-fill" style="width:${c.hpPercent}%"></div></div>
    <span class="hp-text">${c.currentHp}/${c.maxHp}</span>
  `;
}

function gaugeBar(c: Character): string {
  return `<div class="gauge-bar" title="เกจอัลติเมต"><div class="gauge-fill" style="width:${c.gauge}%"></div></div>`;
}

function enemyCard(m: Monster): string {
  const isAttackAction =
    pendingAction &&
    (pendingAction.kind === "attack" ||
      pendingAction.kind === "ultimate" ||
      !(pendingAction.kind instanceof HealSkill || pendingAction.kind instanceof BuffSkill));
  const isTargetable = isAttackAction && m.isAlive;

  return `
    <div class="combat-card enemy-card ${m.isAlive ? "" : "dead"} ${isTargetable ? "targetable-enemy" : ""}" 
         data-target-type="enemy" data-enemy-name="${m.name}">
      <div class="portrait-wrap">${portraitHtml(m)}</div>
      <h4>${m.name}${m.isBoss ? " 👑" : ""}</h4>
      <p class="element-tag">${elementIcon(m.element)}</p>
      ${hpBar(m)}
      ${isTargetable ? '<div class="target-indicator">🎯 คลิกเพื่อโจมตี</div>' : ""}
    </div>
  `;
}

function renderActionBar(actor: Character): string {
  const skillButtons = actor.skills
    .map(
      (s, i) => `
        <button class="action-btn skill-btn ${pendingAction?.label === s.name ? "active-action" : ""}" 
                data-skill-index="${i}" ${s.isReady ? "" : "disabled"}>
          ${s.name}${s.isReady ? "" : ` (${s.cooldownRemaining})`}
        </button>
      `
    )
    .join("");

  return `
    <div class="action-bar">
      <button class="action-btn ${pendingAction?.label === "attack" ? "active-action" : ""}" data-action="attack">โจมตี</button>
      ${skillButtons}
      <button class="action-btn ultimate-btn ${pendingAction?.label === "ultimate" ? "active-action" : ""}" 
              data-action="ultimate" ${actor.ultimateReady ? "" : "disabled"}>
        ⭐ อัลติเมต
      </button>
    </div>
  `;
}

function partyCard(c: Character): string {
  const isSelected = selectedActorName === c.name;
  const isHealAction = pendingAction && pendingAction.kind instanceof HealSkill;
  const isTargetableAlly = isHealAction && c.isAlive;

  return `
    <div class="combat-card party-card ${isSelected ? "selected" : ""} ${c.isAlive ? "" : "dead"} ${isTargetableAlly ? "targetable-ally" : ""}" 
         data-actor="${c.name}" data-target-type="ally">
      <div class="portrait-wrap">${portraitHtml(c)}</div>
      <h4>${c.name}</h4>
      <p class="element-tag">${elementIcon(c.element)} ${c.className}</p>
      ${hpBar(c)}
      ${gaugeBar(c)}
      ${isSelected && c.isAlive ? renderActionBar(c) : ""}
      ${isTargetableAlly ? '<div class="target-indicator heal">💚 คลิกเพื่อฟื้นฟู</div>' : ""}
    </div>
  `;
}

function performActionWithTarget(
  actor: Character,
  actionData: { kind: "attack" | "ultimate" | Skill; label: string },
  target: Character
): void {
  if (!battle) return;

  battle.playerAction(() => {
    totalTurns++;
    const { kind } = actionData;

    if (kind === "attack") {
      const result = actor.attack(target);
      totalDamageDealt += result.damage || 0;
      battle!.addLog(`${result.message} (-${result.damage} HP)`);
    } else if (kind === "ultimate") {
      const result = actor.useUltimate(target);
      if (result) {
        totalDamageDealt += result.damage || 0;
        battle!.addLog(`${result.message}${result.damage ? ` (-${result.damage} HP)` : ""}`);
      }
    } else {
      const result = kind.use(actor, target);
      if (result.damage) totalDamageDealt += result.damage;
      const dmgText = result.damage ? ` (-${result.damage} HP)` : "";
      const healText = result.heal ? ` (+${result.heal} HP)` : "";
      battle!.addLog(`${result.message}${dmgText}${healText}`);
    }
  });

  selectedActorName = null;
  pendingAction = null;
  renderBattleScreen();
}

function renderRewardScreen(): void {
  if (!battle) return;
  stopTimer();

  app.innerHTML = `
    <div class="reward-screen">
      <h2>🎁 เลือกของรางวัลก่อนขึ้น Wave ${battle.waveNumber + 1}</h2>
      <div class="reward-grid">
        ${battle.rewardOptions
          .map(
            (r, i) => `
              <button class="reward-card" data-reward-index="${i}">
                <h3>${r.name}</h3>
                <p>${r.description}</p>
              </button>
            `
          )
          .join("")}
      </div>
    </div>
  `;

  app.querySelectorAll<HTMLButtonElement>(".reward-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.rewardIndex);
      const reward = battle!.rewardOptions[index];
      battle!.chooseReward(reward);
      startTimer();
      renderBattleScreen();
    });
  });
}

function renderEndOverlay(kind: "victory" | "defeat" | "timeout"): string {
  stopTimer();
  
  let icon = "💀";
  let title = "DEFEAT พ่ายแพ้แก่ฝูงอสูร...";
  let desc = "จัดทัพและวางแผนแก้ทางธาตุใหม่ แล้วลองอีกครั้ง!";
  
  if (kind === "victory") {
    icon = "🏆";
    title = "VICTORY! พิชิตทั้ง 3 เวฟสำเร็จ";
    desc = "ความสมดุลแห่ง 3 ธาตุได้รับการปกป้องแล้ว!";
  } else if (kind === "timeout") {
    icon = "⏰";
    title = "GAME OVER! เวลาหมด";
    desc = "กองทัพอสูรบุกทะลวงสำเร็จเพราะคุณใช้เวลามากเกินไป!";
  }

  return `
    <div class="result-overlay ${kind === 'victory' ? 'victory-modal' : 'defeat-modal'}">
      <div class="result-box">
        <div class="trophy-icon">${icon}</div>
        <h2>${title}</h2>
        <p class="victory-desc">${desc}</p>
        ${kind === "victory" ? `
          <div class="battle-stats">
            <div class="stat-item"><span>จำนวนเทิร์นทั้งหมด:</span> <strong>${totalTurns} เทิร์น</strong></div>
            <div class="stat-item"><span>ความเสียหายที่ทำได้:</span> <strong>${totalDamageDealt} DMG</strong></div>
          </div>
        ` : ""}
        <div class="modal-actions">
          <button id="restart-btn" class="restart-btn-special">🔄 เล่นใหม่อีกครั้ง</button>
          <button id="home-btn" class="home-btn-special">🏠 กลับหน้าหลัก</button>
        </div>
      </div>
    </div>
  `;
}

function wireBattleEvents(): void {
  if (!battle) return;

  // โค้ด Toggle เปิด/ปิด Battle Log
  app.querySelector<HTMLButtonElement>("#toggle-log-btn")?.addEventListener("click", () => {
    const logBox = document.getElementById("log-box");
    logBox?.classList.toggle("show");
    if (logBox?.classList.contains("show")) {
      logBox.scrollTop = logBox.scrollHeight;
    }
  });

  app.querySelectorAll<HTMLDivElement>(".party-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest(".action-bar")) return;
      if (!battle || battle.phase !== "battle") return;

      const allyName = card.dataset.actor!;
      const clickedAlly = battle.team.find((c) => c.name === allyName);

      if (pendingAction && pendingAction.kind instanceof HealSkill) {
        const actor = battle.team.find((c) => c.name === selectedActorName);
        if (actor && clickedAlly && clickedAlly.isAlive) {
          performActionWithTarget(actor, pendingAction, clickedAlly);
          return;
        }
      }

      if (!clickedAlly || !clickedAlly.isAlive) return;
      if (selectedActorName !== allyName) {
        selectedActorName = allyName;
        pendingAction = null;
      } else {
        selectedActorName = null;
        pendingAction = null;
      }
      renderBattleScreen();
    });
  });

  app.querySelectorAll<HTMLButtonElement>(".action-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!battle) return;
      const actor = battle.team.find((c) => c.name === selectedActorName);
      if (!actor) return;

      const action = btn.dataset.action;
      if (action === "attack") {
        pendingAction = { kind: "attack", label: "attack" };
      } else if (action === "ultimate") {
        pendingAction = { kind: "ultimate", label: "ultimate" };
      } else {
        const skillIndex = Number(btn.dataset.skillIndex);
        const skill = actor.skills[skillIndex];
        if (skill) {
          if (skill instanceof BuffSkill) {
            performActionWithTarget(actor, { kind: skill, label: skill.name }, actor);
            return;
          } else {
            pendingAction = { kind: skill, label: skill.name };
          }
        }
      }
      renderBattleScreen();
    });
  });

  app.querySelectorAll<HTMLDivElement>(".enemy-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (!battle || battle.phase !== "battle" || !pendingAction) return;
      if (pendingAction.kind instanceof HealSkill) return;

      const enemyName = card.dataset.enemyName;
      const targetEnemy = battle.enemies.find((m) => m.name === enemyName);
      const actor = battle.team.find((c) => c.name === selectedActorName);

      if (actor && targetEnemy && targetEnemy.isAlive) {
        performActionWithTarget(actor, pendingAction, targetEnemy);
      }
    });
  });

  app.querySelector<HTMLButtonElement>("#restart-btn")?.addEventListener("click", () => {
    transitionTo(() => {
      battle = new Battle(buildTeam());
      startTimer();
      renderBattleScreen();
    });
  });

  app.querySelector<HTMLButtonElement>("#home-btn")?.addEventListener("click", () => {
    transitionTo(renderStartScreen);
  });

  app.querySelector<HTMLButtonElement>("#back-btn")?.addEventListener("click", () => {
    if (confirm("ออกจากด่านตอนนี้? ความคืบหน้าจะหายไป")) {
      stopTimer();
      transitionTo(renderStartScreen);
    }
  });
}

function renderBattleScreen(): void {
  if (!battle) return;

  if (battle.phase === "reward") {
    renderRewardScreen();
    return;
  }

  const partyHtml = battle.team.map((c) => partyCard(c)).join("");
  const enemiesHtml = battle.enemies.map((m) => enemyCard(m)).join("");

  app.innerHTML = `
    <div class="battle-screen">
      <div class="battle-header">
        <button id="back-btn" class="back-btn" title="ออกไปหน้าแรก">↩</button>
        <div class="wave-label">Wave ${battle.waveNumber} / ${battle.totalWaves}</div>
        <div class="header-right-actions">
          <button id="toggle-log-btn" class="log-toggle-btn">📜 ประวัติการต่อสู้</button>
          <div id="wave-timer" class="wave-timer">⏱️ ${timeRemaining}s</div>
        </div>
      </div>

      <!-- ล็อกบ็อกซ์เปลี่ยนเป็นแบบ Dropdown / โผล่มาเมื่อกดปุ่ม -->
      <div class="log-box-floating" id="log-box">
        <h4>บันทึกการต่อสู้</h4>
        ${battle.log.length > 0 ? battle.log.map((line) => `<p>${line}</p>`).join("") : "<p>ยังไม่มีการโจมตี...</p>"}
      </div>

      <div class="battlefield">
        <div class="party-row">${partyHtml}</div>
        <div class="enemy-row">${enemiesHtml}</div>
      </div>

      ${battle.phase === "victory" ? renderEndOverlay("victory") : ""}
      ${battle.phase === "defeat" && !isTimeOut ? renderEndOverlay("defeat") : ""}
      ${isTimeOut ? renderEndOverlay("timeout") : ""}
    </div>
  `;

  wireBattleEvents();
}

renderStartScreen();