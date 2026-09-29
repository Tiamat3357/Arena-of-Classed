# Arena of Classes

เกมต่อสู้เทิร์นเบส 3 เวฟ สำหรับ OOP mini project — ทีม Kaelen (Knight/ไฟ), Nerine (Mage/น้ำ), Sylas (Ranger/ใบไม้) ฝ่าคลื่นมอนสเตอร์ เลือกของรางวัลระหว่างทาง จบด้วยบอส

## วิธีรัน

```bash
npm install
npm run dev
```

เปิดลิงก์ที่ terminal แสดง (ปกติ `http://localhost:5173`)

> โค้ดผ่านการตรวจด้วย `tsc --noEmit` แบบเข้มงวด (strict + noUnusedLocals/Parameters) แล้วว่าไม่มี type error ก่อนส่งให้ — พิมพ์ผิด/ลืม import จะไม่มีแน่นอน มีแค่ตอนยังไม่ `npm install` ที่ TypeScript จะยังไม่รู้จัก `vite/client` (เรื่องปกติ หายไปเองหลัง install)

## โครงสร้างไฟล์

```
src/
  models/
    Element.ts        <- ระบบธาตุ (ไฟ > ใบไม้ > น้ำ > ไฟ)
    Character.ts       <- abstract class แม่ (Abstraction + Encapsulation)
    Skill.ts            <- abstract class สกิล
    DamageSkill.ts      <- ลูกสกิล 1
    HealSkill.ts        <- ลูกสกิล 2
    BuffSkill.ts        <- ลูกสกิล 3
    Knight.ts           <- Kaelen
    Mage.ts             <- Nerine
    Ranger.ts           <- Sylas
    Monster.ts          <- ฝั่งศัตรู
    Reward.ts           <- abstract class ของรางวัล + ลูก 3 แบบ
    Battle.ts           <- ควบคุมทั้งเกม ไม่รู้จักคลาสลูกเลยสักตัว
  data/
    waves.ts             <- ข้อมูลมอนสเตอร์ 3 เวฟ (plain data, ไม่ใช่คลาส)
  main.ts                 <- GUI logic
  styles.css
index.html
```

## หลักการ OOP อยู่ตรงไหน (ใช้ตอน present)

| หลักการ | อยู่ที่ไฟล์ | อธิบายสั้นๆ |
|---|---|---|
| **Abstraction** | `Character.ts`, `Skill.ts`, `Reward.ts` | ทั้งสามเป็น `abstract class` มี abstract method ที่บังคับให้ลูกกำหนดพฤติกรรมเอง |
| **Encapsulation** | `Character.ts` (`_currentHp`, `_gauge`), `Skill.ts` (`_currentCooldown`) | แก้ค่าได้ผ่าน method เท่านั้น เช่น `takeDamage()`, `useUltimate()` |
| **Inheritance** | `Knight/Mage/Ranger/Monster extends Character`, `DamageSkill/HealSkill/BuffSkill extends Skill`, `AttackBuffReward/HealReward/CooldownResetReward extends Reward` | 3 คู่ inheritance แยกกัน |
| **Polymorphism** | `attack()`/`ultimate()` ของแต่ละตัวละคร, `use()` ของแต่ละสกิล, `apply()` ของแต่ละรางวัล | จุดที่ควรโชว์ตอน present: `Battle.ts` เรียก `enemy.attack()` โดยไม่รู้เลยว่ากำลังคุยกับ Goblin, Orc หรือมังกร |

## กติกาเกม

- เลือกตัวละคร 1 ตัวในทีม (คลิกการ์ด) → เลือกท่า: โจมตี / สกิล 1-3 (มีคูลดาวน์) / อัลติเมต (ต้องเกจเต็ม)
- เป้าหมายเลือกอัตโนมัติ: โจมตี/สกิล/อัลติเมตโจมตี → เล็งศัตรู HP ต่ำสุด, สกิลฮีล → เล็งพวกเดียวกัน HP ต่ำสุด, สกิลบัฟ → ใส่ตัวเอง (ไม่มี UI เลือกเป้าหมายเอง เพื่อประหยัดเวลาทำ)
- ธาตุ ไฟ > ใบไม้ > น้ำ > ไฟ (ดาเมจ x1.5 ถ้าได้เปรียบ, x0.75 ถ้าเสียเปรียบ)
- ฝ่า 3 เวฟ (เวฟ 3 = บอส) ระหว่างเวฟเลือกของรางวัล 1 ใน 3
- แพ้ถ้าทั้งทีมตายก่อนจบเวฟ 3

## แบ่งงาน 3 คน (แนะนำ)

- **คนที่ 1 — Combat classes**: `Character.ts`, `Knight.ts`, `Mage.ts`, `Ranger.ts`, `Monster.ts`
- **คนที่ 2 — Skills, Rewards, Battle**: `Skill.ts` + ลูกทั้ง 3, `Reward.ts`, `Battle.ts`, `waves.ts`
- **คนที่ 3 — GUI & Polish**: `main.ts`, `styles.css` + เตรียมสไลด์/ซ้อม demo

## ไอเดียต่อยอด (ถ้ามีเวลาเหลือ)

- ใส่ภาพตัวละครจริงแทนอิโมจิ (เพิ่ม field `avatarUrl` ใน `Character` แล้ว fallback เป็น `icon` ถ้าไม่มีรูป)
- ทำ `Vine Snare` ของ Sylas ให้ลดพลังโจมตีศัตรูจริงๆ แทนที่จะเป็นแค่ดาเมจ (ใช้กลไกเดียวกับ buff แต่ทำเป็น debuff ฝั่งศัตรู)
- ให้ผู้เล่นเลือกเป้าหมายเองแทนการเล็งอัตโนมัติ

## ก่อนส่งงานจริง

- [ ] ตั้ง GitHub repo เป็น public แล้ว commit แยกตามคนจริงๆ (เกณฑ์ตรวจ commit history)
- [ ] ทำสไลด์ชี้ตำแหน่งโค้ดตามตารางด้านบน พร้อม demo สด
