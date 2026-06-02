import type { Rank } from "@/generated/prisma";

/** XP required for next level — exponential curve inspired by RPG scaling */
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function rankFromLevel(level: number): Rank {
  if (level >= 100) return "MONARCH";
  if (level >= 80) return "NATIONAL";
  if (level >= 60) return "S";
  if (level >= 45) return "A";
  if (level >= 30) return "B";
  if (level >= 20) return "C";
  if (level >= 10) return "D";
  return "E";
}

export const RANK_COLORS: Record<Rank, string> = {
  E: "#6b7280",
  D: "#22c55e",
  C: "#3b82f6",
  B: "#8b5cf6",
  A: "#f59e0b",
  S: "#ef4444",
  NATIONAL: "#ec4899",
  MONARCH: "#06b6d4",
};

export type LevelUpResult = {
  leveledUp: boolean;
  newLevel: number;
  newRank: Rank;
  levelsGained: number;
  xpToNextLevel: number;
};

/** Apply XP and return level-up metadata */
export function applyXp(
  currentLevel: number,
  currentXp: number,
  xpGain: number
): LevelUpResult & { xp: number } {
  let level = currentLevel;
  let xp = currentXp + xpGain;
  let levelsGained = 0;
  let leveledUp = false;

  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level += 1;
    levelsGained += 1;
    leveledUp = true;
  }

  return {
    leveledUp,
    newLevel: level,
    newRank: rankFromLevel(level),
    levelsGained,
    xpToNextLevel: xpForLevel(level),
    xp,
  };
}

/** Stat points granted per level */
export function statPointsForLevelUp(levelsGained: number): number {
  return levelsGained * 3;
}
