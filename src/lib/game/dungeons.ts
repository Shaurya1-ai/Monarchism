import { createHash } from "crypto";

const BOSSES = [
  "Cerberus Gatekeeper",
  "Ice Monarch's Sentinel",
  "Shadow Monarch Fragment",
  "Red Gate Progenitor",
  "Ant King's Lieutenant",
  "Demon Castle Lord",
  "Dragon's Avatar",
  "Monarch of Beasts Echo",
];

const FLOOR_NAMES = [
  "Entrance Hall",
  "Corrupted Corridor",
  "Mana Crystal Chamber",
  "Shadow Nest",
  "Boss Antechamber",
  "Throne of Darkness",
];

export type GeneratedDungeon = {
  seed: string;
  difficulty: number;
  floors: number;
  floorNames: string[];
  bossName: string;
  baseXp: number;
  baseGold: number;
};

/** Seeded procedural dungeon from player id + timestamp */
export function generateDungeon(
  playerId: string,
  difficulty: number
): GeneratedDungeon {
  const seed = createHash("sha256")
    .update(`${playerId}:${Date.now()}:${difficulty}`)
    .digest("hex")
    .slice(0, 16);

  const hash = parseInt(seed.slice(0, 8), 16);
  const floors = 3 + (hash % 4) + Math.floor(difficulty / 2);
  const bossIdx = hash % BOSSES.length;

  const floorNames = Array.from({ length: floors }, (_, i) => {
    return FLOOR_NAMES[i % FLOOR_NAMES.length] + ` — Floor ${i + 1}`;
  });

  return {
    seed,
    difficulty,
    floors,
    floorNames,
    bossName: BOSSES[bossIdx],
    baseXp: 50 * difficulty * floors,
    baseGold: 25 * difficulty * floors,
  };
}

export function rollDungeonCombat(
  seed: string,
  floor: number,
  playerPower: number
): { success: boolean; damage: number } {
  const h = parseInt(
    createHash("md5").update(`${seed}:${floor}`).digest("hex").slice(0, 6),
    16
  );
  const enemyPower = 20 + floor * 15 + (h % 30);
  const success = playerPower >= enemyPower * 0.85;
  const damage = success ? Math.max(0, enemyPower - playerPower) : 30;
  return { success, damage };
}
