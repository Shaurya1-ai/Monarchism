"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/stores/player-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils/cn";

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  goldReward: number;
  requirement: (level: number) => boolean;
};

const ACHIEVEMENTS: Achievement[] = [
  { id: "a1", title: "First Steps", description: "Reach level 2", icon: "👣", xpReward: 25, goldReward: 50, requirement: (level) => level >= 2 },
  { id: "a2", title: "Rising Hunter", description: "Reach level 5", icon: "⬆️", xpReward: 100, goldReward: 150, requirement: (level) => level >= 5 },
  { id: "a3", title: "D-Rank Hunter", description: "Reach D-Rank", icon: "🟢", xpReward: 200, goldReward: 300, requirement: (level) => level >= 10 },
  { id: "a4", title: "C-Rank Hunter", description: "Reach C-Rank", icon: "🔵", xpReward: 400, goldReward: 500, requirement: (level) => level >= 20 },
  { id: "a5", title: "B-Rank Hunter", description: "Reach B-Rank", icon: "🟣", xpReward: 800, goldReward: 1000, requirement: (level) => level >= 30 },
  { id: "a6", title: "A-Rank Hunter", description: "Reach A-Rank", icon: "🟡", xpReward: 1500, goldReward: 2000, requirement: (level) => level >= 45 },
  { id: "a7", title: "S-Rank Hunter", description: "Reach S-Rank", icon: "🔴", xpReward: 3000, goldReward: 5000, requirement: (level) => level >= 60 },
  { id: "a8", title: "National Level", description: "Reach National Level", icon: "🌸", xpReward: 5000, goldReward: 10000, requirement: (level) => level >= 80 },
  { id: "a9", title: "Shadow Monarch", description: "Reach Monarch Rank", icon: "👑", xpReward: 10000, goldReward: 25000, requirement: (level) => level >= 100 },
];

export default function AchievementsPage() {
  const player = usePlayerStore((s) => s.player);
  const updatePlayer = usePlayerStore((s) => s.updatePlayer);
  const addNotification = useUiStore((s) => s.addNotification);
  const [claimed, setClaimed] = useState<Set<string>>(new Set());

  if (!player) return null;

  function claimReward(achievement: Achievement) {
    if (claimed.has(achievement.id) || !player) return;

    setClaimed((prev) => new Set([...prev, achievement.id]));
    updatePlayer({
      xp: player.xp + achievement.xpReward,
      gold: player.gold + achievement.goldReward,
    });
    addNotification({
      type: "success",
      title: "Achievement Claimed",
      message: `+${achievement.xpReward} XP, +${achievement.goldReward} gold`,
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Achievements</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a, i) => {
          const unlocked = a.requirement(player.level);
          const isClaimed = claimed.has(a.id);

          return (
            <GlassPanel
              key={a.id}
              delay={i * 0.03}
              className={cn(!unlocked && "opacity-60")}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{unlocked ? a.icon : "❓"}</span>
                <div className="flex-1">
                  <h3 className="font-medium">{a.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{a.description}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    +{a.xpReward} XP · +{a.goldReward} gold
                  </p>
                  {unlocked && !isClaimed && (
                    <Button
                      className="mt-3"
                      onClick={() => claimReward(a)}
                    >
                      Claim Reward
                    </Button>
                  )}
                  {isClaimed && (
                    <p className="mt-2 text-xs text-emerald-400">Claimed</p>
                  )}
                  {!unlocked && (
                    <p className="mt-2 text-xs text-slate-500">Locked</p>
                  )}
                </div>
              </div>
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
}
