"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/stores/player-store";
import { useUiStore } from "@/stores/ui-store";

type Quest = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  goldReward: number;
  completed: boolean;
};

const DAILY_QUESTS: Quest[] = [
  { id: "q1", title: "Morning Run", description: "Complete a 30-minute cardio workout", xpReward: 50, goldReward: 25, completed: false },
  { id: "q2", title: "Strength Training", description: "Complete 50 push-ups and 50 squats", xpReward: 75, goldReward: 35, completed: false },
  { id: "q3", title: "Meditation", description: "Meditate for 15 minutes", xpReward: 30, goldReward: 15, completed: false },
  { id: "q4", title: "Hydration Goal", description: "Drink 8 glasses of water today", xpReward: 25, goldReward: 10, completed: false },
  { id: "q5", title: "Reading Quest", description: "Read for 30 minutes", xpReward: 40, goldReward: 20, completed: false },
  { id: "q6", title: "Shadow Training", description: "Practice shadow boxing for 10 minutes", xpReward: 60, goldReward: 30, completed: false },
];

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

export default function QuestsPage() {
  const player = usePlayerStore((s) => s.player);
  const updatePlayer = usePlayerStore((s) => s.updatePlayer);
  const { addNotification, showLevelUp } = useUiStore();
  const [quests, setQuests] = useState<Quest[]>(DAILY_QUESTS);

  if (!player) return null;

  function completeQuest(questId: string) {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || quest.completed) return;

    // Mark quest as completed
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, completed: true } : q))
    );

    // Calculate new XP and level
    let newXp = player.xp + quest.xpReward;
    let newLevel = player.level;
    let newRank = player.rank;
    let leveledUp = false;

    // Check for level up
    let xpToNext = getXpToNextLevel(newLevel);
    while (newXp >= xpToNext) {
      newXp -= xpToNext;
      newLevel++;
      leveledUp = true;
      xpToNext = getXpToNextLevel(newLevel);
    }

    if (leveledUp) {
      newRank = getRankForLevel(newLevel);
    }

    // Update player
    updatePlayer({
      xp: newXp,
      level: newLevel,
      rank: newRank,
      gold: player.gold + quest.goldReward,
      statPoints: leveledUp ? player.statPoints + (newLevel - player.level) * 3 : player.statPoints,
    });

    addNotification({
      type: "success",
      title: "Quest Complete",
      message: `+${quest.xpReward} XP, +${quest.goldReward} gold`,
    });

    if (leveledUp) {
      showLevelUp(newLevel, newRank);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Daily Quests</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quests.map((q, i) => (
          <GlassPanel key={q.id} delay={i * 0.05} hologram>
            <h3 className="font-medium text-sky-300">{q.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{q.description}</p>
            <p className="mt-4 text-xs text-slate-500">
              +{q.xpReward} XP · +{q.goldReward} gold
            </p>
            {!q.completed ? (
              <Button
                className="mt-4 w-full"
                onClick={() => completeQuest(q.id)}
              >
                Complete
              </Button>
            ) : (
              <p className="mt-4 text-center text-sm text-emerald-400">✓ Completed</p>
            )}
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
