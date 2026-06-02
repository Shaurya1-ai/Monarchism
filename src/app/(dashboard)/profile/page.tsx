"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/game/stat-card";
import { usePlayerStore } from "@/stores/player-store";
import { useUiStore } from "@/stores/ui-store";

export default function ProfilePage() {
  const player = usePlayerStore((s) => s.player);
  const updatePlayer = usePlayerStore((s) => s.updatePlayer);
  const setPlayer = usePlayerStore((s) => s.setPlayer);
  const router = useRouter();
  const addNotification = useUiStore((s) => s.addNotification);

  const [stats, setStats] = useState({
    strength: player?.strength ?? 10,
    agility: player?.agility ?? 10,
    intelligence: player?.intelligence ?? 10,
    vitality: player?.vitality ?? 10,
    perception: player?.perception ?? 10,
  });

  const [pointsUsed, setPointsUsed] = useState(0);

  if (!player) return null;

  const availablePoints = player.statPoints - pointsUsed;

  const alloc = (key: keyof typeof stats) => {
    if (availablePoints <= 0) return;
    setStats((s) => ({ ...s, [key]: s[key] + 1 }));
    setPointsUsed((p) => p + 1);
  };

  function saveStats() {
    updatePlayer({
      ...stats,
      statPoints: player.statPoints - pointsUsed,
    });
    setPointsUsed(0);
    addNotification({ type: "success", title: "Stats updated" });
  }

  function resetProgress() {
    setPlayer(null);
    router.push("/");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Profile</h1>
      <GlassPanel hologram>
        <p className="text-slate-400">Stat points available: {availablePoints}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-5">
          {(Object.keys(stats) as Array<keyof typeof stats>).map((key) => (
            <StatCard
              key={key}
              name={key}
              value={stats[key]}
              canEdit={availablePoints > 0}
              onIncrement={() => alloc(key)}
            />
          ))}
        </div>
        <Button className="mt-6" onClick={saveStats} disabled={pointsUsed === 0}>
          Save Allocation
        </Button>
      </GlassPanel>
      <Button variant="danger" onClick={resetProgress}>
        Reset Progress
      </Button>
    </div>
  );
}
