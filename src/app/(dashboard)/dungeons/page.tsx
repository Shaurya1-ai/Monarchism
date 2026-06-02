"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { usePlayerStore } from "@/stores/player-store";
import { useUiStore } from "@/stores/ui-store";

export default function DungeonsPage() {
  const { request } = useApi();
  const qc = useQueryClient();
  const setPlayer = usePlayerStore((s) => s.setPlayer);
  const { addNotification, showLevelUp } = useUiStore();
  const [difficulty, setDifficulty] = useState(1);

  const { data } = useQuery({
    queryKey: ["dungeons"],
    queryFn: () =>
      request<{ active: { id: string; currentFloor: number; floors: number; bossName: string | null; difficulty: number } | null; cooldown: string | null }>("/api/dungeons").then((r) => r.data!),
  });

  const start = useMutation({
    mutationFn: () =>
      request("/api/dungeons", {
        method: "POST",
        body: JSON.stringify({ difficulty }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dungeons"] }),
  });

  const advance = useMutation({
    mutationFn: (runId: string) =>
      request<{ completed?: boolean; levelUp?: { newLevel: number; newRank: string }; player?: unknown }>("/api/dungeons", {
        method: "POST",
        body: JSON.stringify({ runId }),
      }),
    onSuccess: (res) => {
      if (res.data?.player) setPlayer(res.data.player as never);
      if (res.data?.completed) {
        addNotification({ type: "success", title: "Dungeon Cleared!" });
        if (res.data.levelUp) {
          showLevelUp(res.data.levelUp.newLevel, res.data.levelUp.newRank);
        }
      }
      qc.invalidateQueries({ queryKey: ["dungeons", "player"] });
    },
  });

  const active = data?.active;
  const onCooldown = data?.cooldown && new Date(data.cooldown) > new Date();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Dungeon Gates</h1>

      <GlassPanel hologram glow>
        {active ? (
          <div>
            <p className="text-hologram text-lg font-medium">Gate Active</p>
            <p className="mt-2 text-slate-400">
              Floor {active.currentFloor} / {active.floors}
              {active.bossName && ` · Boss: ${active.bossName}`}
            </p>
            <Button
              className="mt-6"
              loading={advance.isPending}
              onClick={() => advance.mutate(active.id)}
            >
              Clear Floor
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
            {onCooldown ? (
              <p className="mt-4 text-amber-400">Cooldown active. Rest, Hunter.</p>
            ) : (
              <Button
                className="mt-6"
                loading={start.isPending}
                onClick={() => start.mutate()}
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
