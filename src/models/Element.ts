// Element.ts
// Fire beats Grass, Grass beats Water, Water beats Fire (rock-paper-scissors).

export type Element = "fire" | "water" | "grass";

const ADVANTAGE: Record<Element, Element> = {
  fire: "grass",
  grass: "water",
  water: "fire",
};

export function elementMultiplier(attacker: Element, defender: Element): number {
  if (ADVANTAGE[attacker] === defender) return 1.5;
  if (ADVANTAGE[defender] === attacker) return 0.75;
  return 1;
}

export const ELEMENT_ICON: Record<Element, string> = {
  fire: "🔥",
  water: "💧",
  grass: "🍃",
};
