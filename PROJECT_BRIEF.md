# Arena of Classes — Project Brief (สรุปไว้พกไปให้ AI ตัวอื่นช่วยต่อได้)

## บริบท
- OOP mini project, กลุ่ม 3 คน , ส่ง 30 ก.ย. 2569
- เกณฑ์ 20 คะแนน: OOP 4 หลักการครบ / ออกแบบคลาส ≥5 / ระบบทำงานถูก / GUI ใช้งานได้ / พรีเซนต์ชี้โค้ด
- เทคโนโลยี: TypeScript + Vite (ไม่มี framework) — รัน `npm install && npm run dev`

## เกมคืออะไร
"Arena of Classes" — เทิร์นเบส 3 เวฟ ทีม 3 ตัว (Kaelen=Knight/ไฟ, Nerine=Mage/น้ำ, Sylas=Ranger/ใบไม้) vs มอนสเตอร์ เวฟ 3 เจอบอส ระหว่างเวฟเลือกของรางวัล 1 ใน 3

## โครงสร้างคลาส (src/models/)
- `Character.ts` — abstract แม่ (Abstraction+Encapsulation), HP/เกจ/บัฟ/avatarUrl private ทั้งหมด
- `Knight.ts` `Mage.ts` `Ranger.ts` `Monster.ts` — extends Character, override attack()/ultimate() ต่างกัน (Polymorphism)
- `Skill.ts` (abstract) → `DamageSkill.ts` `HealSkill.ts` `BuffSkill.ts` — override use()
- `Reward.ts` (abstract) → `AttackBuffReward` `HealReward` `CooldownResetReward` — override apply()
- `Battle.ts` — คุมทั้งเกม รู้จักแค่ abstract Character เท่านั้น
- `Element.ts` — ธาตุ ไฟ>ใบไม้>น้ำ>ไฟ
- `src/data/waves.ts` — data มอนสเตอร์ 3 เวฟ
- `src/main.ts` — GUI ทั้งหมด, render ด้วย innerHTML string, state เก็บใน module-level variables (`battle`, `selectedActorName`)
- `src/styles.css` — ธีม glassmorphism มืด, ฟอนต์ Cinzel+Poppins, glow/pulse/transition effects

## กติกาที่ implement แล้ว
เลือกตัวละคร → เลือกท่า (โจมตี/สกิล/อัลติเมต) → auto-target (โจมตี/สกิลดาเมจ→ศัตรู HP ต่ำสุด, ฮีล→พวกเดียวกัน HP ต่ำสุด, บัฟ→ตัวเอง) → ศัตรูสุ่มตัวสวนกลับ → คูลดาวน์/เกจนับต่อเทิร์น

## ฟีเจอร์ GUI ล่าสุด (เพิ่มรอบนี้)
- `setAvatar(url)` บน Character — ใส่รูปจริงแทนอิโมจิได้ (ดู HOW_TO_ADD_IMAGES.md) ยังไม่ใส่ก็ใช้อิโมจิได้ปกติ
- ภาพตัวละคร/มอนสเตอร์ "โผล่ออกจากขอบการ์ด" แบบเกมกาชา (`.portrait-wrap` ใน CSS)
- ปุ่ม "เนื้อเรื่อง" ในหน้าแรก เปิด modal เนื้อเรื่องสั้นๆ (`STORY_TEXT` ใน main.ts แก้ข้อความได้ตรงนั้น)
- Transition (fade) ตอนเปลี่ยนจากหน้าแรก → หน้าต่อสู้ และตอนกดกลับ/เล่นใหม่
- ปุ่มย้อนกลับ (↩) มุมซ้ายบนหน้าต่อสู้ กลับไปหน้าแรกได้ (มี confirm กันกดพลาด)
- log กล่องข้อความ: บรรทัดล่าสุดถูกไฮไลต์ให้เด่นแบบกล่องบทสนทนา

## สถานะปัจจุบัน
- โค้ดผ่าน `tsc --noEmit` แบบ strict แล้ว (0 error) รวมส่วนที่เพิ่มใหม่ด้วย
- ยังไม่มีไฟล์รูปจริงแนบมา (ต้องไปหา/สร้างรูปเองแล้วทำตาม HOW_TO_ADD_IMAGES.md)
- ยังไม่มีระบบเลือกเป้าหมายเอง (auto-target ทั้งหมด)

## ถ้าจะให้ AI ตัวอื่นช่วยต่อ
บอกมันประมาณนี้: "นี่คือโปรเจกต์เกม OOP ทำด้วย TypeScript+Vite (แนบไฟล์/วางโค้ดด้านล่าง) ช่วย [สิ่งที่ต้องการ] โดยไม่พังของเดิม" แล้วแปะไฟล์ที่เกี่ยวข้องให้มันอ่าน — ไฟล์นี้ (PROJECT_BRIEF.md) ให้บริบททั้งหมดไปพร้อมกันได้เลย

## ถ้าจะเปลี่ยนโปรเจกต์ทั้งหมด (ไม่แนะนำ เวลาเหลือน้อยมาก)
ทำเร็วสุดคือ "ระบบจัดการที่จอดรถ" (Vehicle abstract → Car/Motorcycle, ParkingSlot, Ticket, Payment) หรือ "ระบบยืม-คืนหนังสือห้องสมุด" (Book, Member, Loan, Librarian, Fine) — แต่ต้องเขียนใหม่หมดในเวลาที่เหลือ เสี่ยงกว่าการเก็บของเดิมไว้มาก
