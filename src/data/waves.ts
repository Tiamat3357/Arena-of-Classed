// waves.ts

// Plain data factory — not a class, but that's fine: not every file needs
// to be a class for the project to satisfy the OOP requirements, and
// keeping enemy data separate from Monster.ts and Battle.ts keeps both
// of those easy to read.

import { Monster } from "../models/Monster";

// นำเข้ารูปภาพมอนสเตอร์จาก assets
import goblin1Img from "../assets/Goblin1.png";
import goblin2Img from "../assets/Goblin2.png";
import goblin3Img from "../assets/Goblin3.png";
import orcImg from "../assets/Orc.png";
import darkSlimeImg from "../assets/Dark_slime.png";
import drakeDragonImg from "../assets/Drake_Dragon.png";

// ฟังก์ชันสุ่มธาตุเดี่ยวสำหรับก็อบลินใน Wave 1
function getRandomElement(): "fire" | "water" | "grass" {
  const elements: ("fire" | "water" | "grass")[] = ["fire", "water", "grass"];
  return elements[Math.floor(Math.random() * elements.length)];
}

export function createWave(waveNumber: number): Monster[] {
  switch (waveNumber) {
    case 1: {
      // Wave 1: ก็อบลิน 3 ตัว มีตัวใหญ่ (Warrior) + สุ่มธาตุแต่ละตัว พร้อมใส่รูป
      const m1 = new Monster("Goblin Warrior (บิ๊ก)", getRandomElement(), 85, 12, "Goblin");
      const m2 = new Monster("Goblin Scout", getRandomElement(), 55, 9, "Goblin");
      const m3 = new Monster("Goblin Shaman", getRandomElement(), 50, 10, "Goblin");

      m1.setAvatar(goblin2Img);
      m2.setAvatar(goblin1Img);
      m3.setAvatar(goblin3Img);

      return [m1, m2, m3];
    }

    case 2: {
      // Wave 2: มินิบอส 2 ตัว ธาตุต่างกัน เลือดหนาขึ้น พร้อมใส่รูป
      const m1 = new Monster("Lava Orc (มินิบอส)", "fire", 140, 16, "Orc");
      const m2 = new Monster("Abyssal Slime (มินิบอส)", "water", 130, 14, "Slime");

      m1.setAvatar(orcImg);
      m2.setAvatar(darkSlimeImg);

      return [m1, m2];
    }

    case 3: {
      // Wave 3: บอสใหญ่เลือดหนาพิเศษ (480 HP) พลัง 3 ธาตุ พร้อมใส่รูปมังกร
      const boss = new Monster("Ancient Drake (มังกร 3 ธาตุ)", "fire", 480, 24, "Dragon", true);
      boss.setAvatar(drakeDragonImg);

      return [boss];
    }

    default:
      throw new Error(`No such wave: ${waveNumber}`);
  }
}