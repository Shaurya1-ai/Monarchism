"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/stores/player-store";
import { useUiStore } from "@/stores/ui-store";

const XP_TABLE = [0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, 4600, 6000];

function getXpToNextLevel(level: number): number {
  return XP_TABLE[Math.min(level, XP_TABLE.length - 1)] || 6000 + (level - 10) * 1500;
}

function getRankForLevel(level: number): "E" | "D" | "C" | "B" | "A" | "S" | "NATIONAL" | "MONARCH" {
  if (level >= 100) return "MONARCH";
  if (level >= 80) return "NATIONAL";
  if (level >= 60) return "S";
  if (level >= 45) return "A";
  if (level >= 30) return "B";
  if (level >= 20) return "C";
  if (level >= 10) return "D";
  return "E";
}

type DungeonRun = {
  currentFloor: number;
  totalFloors: number;
  bossName: string;
  difficulty: number;
  xpPerFloor: number;
  goldPerFloor: number;
};

const BOSS_NAMES = [
  "Stone Golem",
  "Shadow Wolf Alpha",
  "Ice Wraith",
  "Flame Sentinel",
  "Void Stalker",
  "Blood Knight",
  "Elder Lich",
  "Dragon Whelp",
  "Demon Baron",
  "Arch Demon",
];

export default function DungeonsPage() {
  const player = usePlayerStore((s) => s.player);
  const updatePlayer = usePlayerStore((s) => s.updatePlayer);
  const { addNotification, showLevelUp } = useUiStore();
  
  const [difficulty, setDifficulty] = useState(1);
  const [activeDungeon, setActiveDungeon] = useState<DungeonRun | null>(null);
  const [cooldownEnd, setCooldownEnd] = useState<Date | null>(null);

  if (!player) return null;

  const onCooldown = cooldownEnd && cooldownEnd > new Date();

  function startDungeon() {
    const floors = 3 + difficulty;
    setActiveDungeon({
      currentFloor: 1,
      totalFloors: floors,
      bossName: BOSS_NAMES[Math.min(difficulty - 1, BOSS_NAMES.length - 1)],
      difficulty,
      xpPerFloor: 20 * difficulty,
      goldPerFloor: 15 * difficulty,
    });
  }

  function clearFloor() {
    if (!activeDungeon) return;

    const xpGained = activeDungeon.xpPerFloor;
    const goldGained = activeDungeon.goldPerFloor;

    // Calculate new XP and level
    let newXp = player.xp + xpGained;
    let newLevel = player.level;
    let newRank = player.rank;
    let leveledUp = false;
    let levelsGained = 0;

    let xpToNext = getXpToNextLevel(newLevel);
    while (newXp >= xpToNext) {
      newXp -= xpToNext;
      newLevel++;
      levelsGained++;
      leveledUp = true;
      xpToNext = getXpToNextLevel(newLevel);
    }

    if (leveledUp) {
      newRank = getRankForLevel(newLevel);
    }

    updatePlayer({
      xp: newXp,
      level: newLevel,
      rank: newRank,
      gold: player.gold + goldGained,
      statPoints: player.statPoints + levelsGained * 3,
    });

    if (activeDungeon.currentFloor >= activeDungeon.totalFloors) {
      // Dungeon completed
      const bonusXp = activeDungeon.difficulty * 50;
      const bonusGold = activeDungeon.difficulty * 40;
      
      updatePlayer({
        xp: newXp + bonusXp,
        gold: player.gold + goldGained + bonusGold,
      });

      addNotification({
        type: "success",
        title: "Dungeon Cleared!",
        message: `Boss ${activeDungeon.bossName} defeated! +${bonusXp} bonus XP`,
      });

      if (leveledUp) {
        showLevelUp(newLevel, newRank);
      }

      setActiveDungeon(null);
      setCooldownEnd(new Date(Date.now() + 30 * 1000)); // 30 second cooldown for demo
    } else {
      // Advance floor
      setActiveDungeon({
        ...activeDungeon,
        currentFloor: activeDungeon.currentFloor + 1,
      });

      addNotification({
        type: "success",
        title: "Floor Cleared",
        message: `+${xpGained} XP, +${goldGained} gold`,
      });

      if (leveledUp) {
        showLevelUp(newLevel, newRank);
      }
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Dungeon Gates</h1>

      <GlassPanel hologram glow>
        {activeDungeon ? (
          <div>
            <p className="text-hologram text-lg font-medium">Gate Active</p>
            <p className="mt-2 text-slate-400">
              Floor {activeDungeon.currentFloor} / {activeDungeon.totalFloors}
              {activeDungeon.currentFloor === activeDungeon.totalFloors && 
                ` · Boss: ${activeDungeon.bossName}`}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Difficulty: {activeDungeon.difficulty} · {activeDungeon.xpPerFloor} XP per floor
            </p>
            <Button
              className="mt-6"
              onClick={clearFloor}
            >
              {activeDungeon.currentFloor === activeDungeon.totalFloors 
                ? "Defeat Boss" 
                : "Clear Floor"}
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-slate-400">Select difficulty and enter the gate</p>
            <div className="mt-4 flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={10}
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="flex-1 accent-sky-500"
              />
              <span className="text-sky-400 font-mono">{difficulty}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {3 + difficulty} floors · Boss: {BOSS_NAMES[Math.min(difficulty - 1, BOSS_NAMES.length - 1)]}
            </p>
            {onCooldown ? (
              <p className="mt-4 text-amber-400">Cooldown active. Rest, Hunter.</p>
            ) : (
              <Button
                className="mt-6"
                onClick={startDungeon}
              >
                Enter Dungeon
              </Button>
            )}
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
