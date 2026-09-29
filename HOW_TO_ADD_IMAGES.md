# วิธีใส่รูปตัวละคร/มอนสเตอร์จริง

โค้ดรองรับรูปจริงไว้แล้ว (ผ่าน `setAvatar()` ใน `Character.ts`) ถ้ายังไม่ใส่รูป ระบบจะโชว์อิโมจิเหมือนเดิมอัตโนมัติ ไม่ต้องแก้อะไรถ้ายังไม่มีรูป

## ขั้นตอน

**1) เอาไฟล์รูปใส่โฟลเดอร์ assets**

สร้างโฟลเดอร์ `src/assets/` แล้ววางไฟล์ เช่น:

```
src/assets/kaelen.png
src/assets/nerine.png
src/assets/sylas.png
src/assets/goblin.png
```

**2) import รูปที่ต้นไฟล์ `src/main.ts`**

เพิ่มบรรทัด import ต่อจาก import อื่นๆ ด้านบนสุดของไฟล์:

```ts
import kaelenImg from "./assets/kaelen.png";
import nerineImg from "./assets/nerine.png";
import sylasImg from "./assets/sylas.png";
```

(Vite จะแปลง path รูปเป็น URL ให้อัตโนมัติ ไม่ต้องทำอะไรเพิ่ม)

**3) เซ็ตรูปให้ตัวละครใน `buildTeam()`**

หาฟังก์ชันนี้ในไฟล์เดียวกัน:

```ts
function buildTeam(): Character[] {
  return [new Knight("Kaelen"), new Mage("Nerine"), new Ranger("Sylas")];
}
```

แก้เป็น:

```ts
function buildTeam(): Character[] {
  const kaelen = new Knight("Kaelen");
  const nerine = new Mage("Nerine");
  const sylas = new Ranger("Sylas");

  kaelen.setAvatar(kaelenImg);
  nerine.setAvatar(nerineImg);
  sylas.setAvatar(sylasImg);

  return [kaelen, nerine, sylas];
}
```

แค่นี้รูปจะขึ้นทั้งในหน้าเริ่มเกมและหน้าต่อสู้เลย (ใช้ instance เดียวกัน)

**4) ใส่รูปมอนสเตอร์ (ถ้าต้องการ)**

เปิด `src/data/waves.ts` แล้ว import รูปมอนสเตอร์ที่ต้นไฟล์เหมือนข้อ 2 จากนั้นแก้ตรงที่สร้าง `new Monster(...)` เพิ่ม `.setAvatar(...)` ต่อท้าย เช่น:

```ts
import goblinImg from "../assets/goblin.png";

export function createWave(waveNumber: number): Monster[] {
  switch (waveNumber) {
    case 1: {
      const goblin = new Monster("Goblin", "grass", 60, 10, "👺");
      goblin.setAvatar(goblinImg);
      return [goblin, new Monster("Goblin Scout", "grass", 50, 9, "👺")];
    }
    // ...
  }
}
```

## ข้อควรรู้เรื่องขนาดรูป

- อัตราส่วนแนะนำ: **1:1 หรือแนวตั้งเล็กน้อย** (เช่น 512×512 หรือ 512×640) เพราะ CSS ครอปแบบ `object-fit: cover` จากด้านบน ถ้ารูปเป็นแนวนอนมากๆ หัวตัวละครอาจโดนครอปหายไป
- พื้นหลังโปร่งใส (PNG) จะดูกลมกลืนกับธีมมืดที่สุด แต่พื้นทึบก็ใช้ได้ (แค่ดูจะเป็นสี่เหลี่ยมชัดขึ้น)
- ไฟล์ใหญ่เกินไปจะโหลดช้า แนะนำย่อเหลือไม่เกิน 500 KB ต่อไฟล์ก่อนใส่ (ใช้เว็บบีบรูปฟรีอย่าง squoosh.app ก็ได้)

## ถ้าอยากเปลี่ยนไม่ใส่รูปกลับไปใช้อิโมจิ

ลบบรรทัด `.setAvatar(...)` ที่เพิ่มไปออก หรือคอมเมนต์ไว้ก็ได้ ระบบจะกลับไปโชว์อิโมจิเดิมทันทีโดยไม่ต้องแก้ที่อื่น
