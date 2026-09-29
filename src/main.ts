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

// สถิติสำหรับหน้าจบเกม
let totalTurns = 0;
let totalDamageDealt = 0;

// ระบบเวลานับถอยหลังต่อ Wave (90 วินาที)
const WAVE_TIME_LIMIT = 90;
let timeRemaining = WAVE_TIME_LIMIT;
let timerInterval: number | null = null;

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
      battle.addLog("⏰ เวลาหมดแล้ว! ฝูงอสูรบุกโจมตีจนทีมพ่ายแพ้...");
      (battle as any).phase = "defeat";
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
  return e === "fire" ? "🔥" : e === "water" ? "💧" : "🍃";
}

function portraitHtml(c: Character): string {
  return c.avatarUrl
    ? `<img src="${c.avatarUrl}" alt="${c.name}" class="char-portrait" />`
    : `<span class="char-icon">${c.icon}</span>`;
}

const STORY_TEXT = `กาลครั้งหนึ่ง สามธาตุแห่งโลก — ไฟ น้ำ และใบไม้ — เคยอยู่ร่วมกันอย่างสมดุล
จนวันที่รอยแยกมิติปริออก ปลดปล่อยฝูงอสูรออกมากลืนกินดินแดนทีละเวฟ

เคเลน (Kaelen) อัศวินผู้กล้าแห่งเปลวสุริยะ ยืนหยัดเป็นแนวหน้าด้วยดาบและโล่
เนรีน (Nerine) จอมเวทย์แห่งท้องทะเล ร่ายมนตร์บำบัดและโจมตีด้วยพลังแห่งคลื่น
ไซลัส (Sylas) นักธนูแห่งป่าลึก แม่นยำทุกนัดดั่งสายลมพัดผ่านใบไม้

ทั้งสามรวมพลังกันอีกครั้ง เพื่อฝ่าคลื่นอสูรทั้ง 3 ระลอก
และปิดผนึกรอยแยกก่อนที่มันจะกลืนกินโลกทั้งใบ...`;

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

// ---------------- Start screen ----------------

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

  const previewTeam = buildTeam();

  app.innerHTML = `
    <div class="start-screen">
      <h1>⚔️ Arena of Classes</h1>
      <p class="subtitle">ผจญภัยฝ่า 3 เวฟ พร้อมทีม Kaelen, Nerine และ Sylas (ชี้ที่การ์ดเพื่อดูข้อมูล)</p>
      <div class="team-preview">
        <div class="preview-card has-tooltip">
          ${portraitHtml(previewTeam[0])}
          <h3>Kaelen</h3>
          <p>Knight · 🔥 Fire</p>
          ${renderCharacterTooltip(previewTeam[0])}
        </div>
        <div class="preview-card has-tooltip">
          ${portraitHtml(previewTeam[1])}
          <h3>Nerine</h3>
          <p>Mage · 💧 Water</p>
          ${renderCharacterTooltip(previewTeam[1])}
        </div>
        <div class="preview-card has-tooltip">
          ${portraitHtml(previewTeam[2])}
          <h3>Sylas</h3>
          <p>Ranger · 🍃 Grass</p>
          ${renderCharacterTooltip(previewTeam[2])}
        </div>
      </div>
      <div class="start-actions">
        <button id="start-btn">เริ่มผจญภัย</button>
        <button id="story-btn" class="story-btn">📖 เนื้อเรื่อง</button>
      </div>
      <div class="story-panel hidden" id="story-panel">
        <div class="story-box">
          <button id="story-close" class="story-close">✕</button>
          <p class="story-text">${STORY_TEXT.replace(/\n/g, "<br/>")}</p>
        </div>
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

  const storyPanel = app.querySelector<HTMLDivElement>("#story-panel");
  app.querySelector<HTMLButtonElement>("#story-btn")?.addEventListener("click", () => {
    storyPanel?.classList.remove("hidden");
  });
  app.querySelector<HTMLButtonElement>("#story-close")?.addEventListener("click", () => {
    storyPanel?.classList.add("hidden");
  });
}

// ---------------- Shared bits ----------------

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

// ---------------- Action resolution ----------------

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

// ---------------- Reward screen ----------------

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

// ---------------- Battle screen ----------------

function renderEndOverlay(kind: "victory" | "defeat"): string {
  stopTimer();
  if (kind === "victory") {
    return `
      <div class="result-overlay victory-modal">
        <div class="result-box">
          <div class="trophy-icon">🏆</div>
          <h2>VICTORY! พิชิตทั้ง 3 เวฟสำเร็จ</h2>
          <p class="victory-desc">ความสมดุลแห่ง 3 ธาตุได้รับการปกป้องแล้ว!</p>
          <div class="battle-stats">
            <div class="stat-item"><span>จำนวนเทิร์นทั้งหมด:</span> <strong>${totalTurns} เทิร์น</strong></div>
            <div class="stat-item"><span>ความเสียหายที่ทำได้:</span> <strong>${totalDamageDealt} DMG</strong></div>
            <div class="stat-item"><span>ผู้กล้าที่รอดชีวิต:</span> <strong>${battle?.team.filter((c) => c.isAlive).length || 0}/3 คน</strong></div>
          </div>
          <button id="restart-btn" class="restart-btn-special">✨ ผจญภัยใหม่อีกครั้ง</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="result-overlay defeat-modal">
      <div class="result-box">
        <div class="trophy-icon">💀</div>
        <h2>DEFEAT พ่ายแพ้แก่ฝูงอสูร...</h2>
        <p>จัดทัพและวางแผนแก้ทางธาตุใหม่ แล้วลองอีกครั้ง!</p>
        <button id="restart-btn" class="restart-btn-special">🔄 ลองใหม่</button>
      </div>
    </div>
  `;
}

function wireBattleEvents(): void {
  if (!battle) return;

  // 1. เลือกตัวละครของเรา
  app.querySelectorAll<HTMLDivElement>(".party-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest(".action-bar")) return;
      if (!battle || battle.phase !== "battle") return;

      const allyName = card.dataset.actor!;
      const clickedAlly = battle.team.find((c) => c.name === allyName);

      // ถ้าอยู่ในสถานะร่ายสกิลบัฟหรือฮีล -> คลิกที่พวกเดียวกันเพื่อเป็นเป้าหมาย
      if (pendingAction && pendingAction.kind instanceof HealSkill) {
        const actor = battle.team.find((c) => c.name === selectedActorName);
        if (actor && clickedAlly && clickedAlly.isAlive) {
          performActionWithTarget(actor, pendingAction, clickedAlly);
          return;
        }
      }

      // ถ้าคลิกปกติ เป็นการเลือกตัวที่จะออกคำสั่ง
      if (!clickedAlly || !clickedAlly.isAlive) return;
      if (selectedActorName !== allyName) {
        selectedActorName = allyName;
        pendingAction = null; // รีเซ็ตการกระทำที่ค้างไว้
      } else {
        selectedActorName = null;
        pendingAction = null;
      }
      renderBattleScreen();
    });
  });

  // 2. คลิกปุ่ม Action / Skill
  app.querySelectorAll<HTMLButtonElement>(".action-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!battle) return;
      const actor = battle.team.find((c) => c.name === selectedActorName);
      if (!actor) return;

      const action = btn.dataset.action;
      if (action === "attack") {
        pendingAction = { kind: "attack", label: "attack" };
        battle.addLog(`👉 ${actor.name} เตรียมโจมตีปกติ: กรุณาคลิกเลือกศัตรูเป้าหมาย`);
      } else if (action === "ultimate") {
        pendingAction = { kind: "ultimate", label: "ultimate" };
        battle.addLog(`⭐ ${actor.name} เตรียมใช้อัลติเมต: กรุณาคลิกเลือกศัตรูเป้าหมาย`);
      } else {
        const skillIndex = Number(btn.dataset.skillIndex);
        const skill = actor.skills[skillIndex];
        if (skill) {
          if (skill instanceof BuffSkill) {
            // บัฟตัวเองทันที ไม่ต้องเลือกเป้าหมาย
            performActionWithTarget(actor, { kind: skill, label: skill.name }, actor);
            return;
          } else if (skill instanceof HealSkill) {
            pendingAction = { kind: skill, label: skill.name };
            battle.addLog(`💚 ${actor.name} ร่าย ${skill.name}: กรุณาคลิกเลือกเพื่อนในทีมที่จะฟื้นฟู`);
          } else {
            pendingAction = { kind: skill, label: skill.name };
            battle.addLog(`⚡ ${actor.name} ร่าย ${skill.name}: กรุณาคลิกเลือกศัตรูเป้าหมาย`);
          }
        }
      }
      renderBattleScreen();
    });
  });

  // 3. คลิกเลือกโจมตีมอนสเตอร์ (เป้าหมายศัตรู)
  app.querySelectorAll<HTMLDivElement>(".enemy-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (!battle || battle.phase !== "battle") return;
      if (!pendingAction) return;

      // ห้ามเอาสกิลฮีลไปคลิกใส่มอนสเตอร์
      if (pendingAction.kind instanceof HealSkill) {
        battle.addLog("❌ สกิลฟื้นฟูไม่สามารถใช้ใส่ศัตรูได้!");
        renderBattleScreen();
        return;
      }

      const enemyName = card.dataset.enemyName;
      const targetEnemy = battle.enemies.find((m) => m.name === enemyName);
      const actor = battle.team.find((c) => c.name === selectedActorName);

      if (actor && targetEnemy && targetEnemy.isAlive) {
        performActionWithTarget(actor, pendingAction, targetEnemy);
      }
    });
  });

  app.querySelector<HTMLButtonElement>("#restart-btn")?.addEventListener("click", () => {
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
        <div id="wave-timer" class="wave-timer">⏱️ ${timeRemaining}s</div>
      </div>

      <!-- ย้ายกล่อง Log มาไว้ตรงกลางระหว่างแผงควบคุมเพื่อให้สังเกตง่ายขึ้น -->
      <div class="log-box" id="log-box">
        ${battle.log.map((line) => `<p>${line}</p>`).join("")}
      </div>

      <div class="battlefield">
        <div class="party-row">${partyHtml}</div>
        <div class="enemy-row">${enemiesHtml}</div>
      </div>

      ${battle.phase === "victory" ? renderEndOverlay("victory") : ""}
      ${battle.phase === "defeat" ? renderEndOverlay("defeat") : ""}
    </div>
  `;

  wireBattleEvents();

  const logBox = app.querySelector<HTMLDivElement>("#log-box");
  if (logBox) logBox.scrollTop = logBox.scrollHeight;
}

renderStartScreen();