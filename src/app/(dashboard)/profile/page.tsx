"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/game/stat-card";
import { usePlayerStore } from "@/stores/player-store";
import { useApi } from "@/hooks/use-api";
import { useUiStore } from "@/stores/ui-store";

export default function ProfilePage() {
  const player = usePlayerStore((s) => s.player);
  const setPlayer = usePlayerStore((s) => s.setPlayer);
  const { request } = useApi();
  const router = useRouter();
  const addNotification = useUiStore((s) => s.addNotification);

  const [stats, setStats] = useState({
    strength: player?.strength ?? 10,
    agility: player?.agility ?? 10,
    intelligence: player?.intelligence ?? 10,
    vitality: player?.vitality ?? 10,
    perception: player?.perception ?? 10,
  });

  if (!player) return null;

  const alloc = (key: keyof typeof stats) => {
    if (player.statPoints <= 0) return;
    setStats((s) => ({ ...s, [key]: s[key] + 1 }));
  };

  async function saveStats() {
    try {
      const res = await request<{ player: typeof player }>("/api/player", {
        method: "PATCH",
        body: JSON.stringify(stats),
      });
      if (res.data?.player) {
        setPlayer(res.data.player);
        addNotification({ type: "success", title: "Stats updated" });
      }
    } catch (e) {
      addNotification({
        type: "error",
        title: e instanceof Error ? e.message : "Failed",
      });
    }
  }

  async function logout() {
    await request("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Profile</h1>
      <GlassPanel hologram>
        <p className="text-slate-400">Stat points available: {player.statPoints}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-5">
          {(Object.keys(stats) as Array<keyof typeof stats>).map((key) => (
            <StatCard
              key={key}
              name={key}
              value={stats[key]}
              canEdit={player.statPoints > 0}
              onIncrement={() => alloc(key)}
            />
          ))}
        </div>
        <Button className="mt-6" onClick={saveStats}>
          Save Allocation
        </Button>
      </GlassPanel>
      <Button variant="danger" onClick={logout}>
        Logout
      </Button>
    </div>
  );
}
