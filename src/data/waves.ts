// waves.ts

// Plain data factory — not a class, but that's fine: not every file needs

// to be a class for the project to satisfy the OOP requirements, and

// keeping enemy data separate from Monster.ts and Battle.ts keeps both

// of those easy to read.
 
import { Monster } from "../models/Monster";
 
// ฟังก์ชันสุ่มธาตุเดี่ยวสำหรับก็อบลินใน Wave 1

function getRandomElement(): "fire" | "water" | "grass" {

  const elements: ("fire" | "water" | "grass")[] = ["fire", "water", "grass"];

  return elements[Math.floor(Math.random() * elements.length)];

}
 
export function createWave(waveNumber: number): Monster[] {

  switch (waveNumber) {

    case 1:

      // Wave 1: ก็อบลิน 3 ตัว มีตัวใหญ่ (Warrior) + สุ่มธาตุแต่ละตัว

      return [

        new Monster("Goblin Warrior (บิ๊ก)", getRandomElement(), 85, 12, "👺"),

        new Monster("Goblin Scout", getRandomElement(), 55, 9, "👺"),

        new Monster("Goblin Shaman", getRandomElement(), 50, 10, "👺"),

      ];
 
    case 2:

      // Wave 2: มินิบอส 2 ตัว ธาตุต่างกัน เลือดหนาขึ้น

      return [

        new Monster("Lava Orc (มินิบอส)", "fire", 140, 16, "👹"),

        new Monster("Abyssal Slime (มินิบอส)", "water", 130, 14, "🟣"),

      ];
 
    case 3:

      // Wave 3: บอสใหญ่เลือดหนาพิเศษ (480 HP) พลัง 3 ธาตุ (fire/water/grass)

      return [

        new Monster("Ancient Drake (มังกร 3 ธาตุ)", "fire", 480, 24, "🐉", true),

      ];
 
    default:

      throw new Error(`No such wave: ${waveNumber}`);

  }

}
 
