"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { usePlayerStore } from "@/stores/player-store";
import { useUiStore } from "@/stores/ui-store";

export default function QuestsPage() {
  const { request } = useApi();
  const qc = useQueryClient();
  const setPlayer = usePlayerStore((s) => s.setPlayer);
  const { addNotification, showLevelUp } = useUiStore();

  const { data, isLoading } = useQuery({
    queryKey: ["quests"],
    queryFn: () => request<{ quests: Array<{ id: string; status: string; template: { title: string; description: string; xpReward: number; goldReward: number } }> }>("/api/quests").then((r) => r.data!),
  });

  const complete = useMutation({
    mutationFn: (questId: string) =>
      request<{ player: unknown; rewards: { xp: number; gold: number }; levelUp: { newLevel: number; newRank: string } | null }>("/api/quests", {
        method: "POST",
        body: JSON.stringify({ questId }),
      }),
    onSuccess: (res) => {
      if (res.data?.player) setPlayer(res.data.player as never);
      const r = res.data?.rewards;
      addNotification({
        type: "success",
        title: "Quest Complete",
        message: `+${r?.xp} XP, +${r?.gold} gold`,
      });
      if (res.data?.levelUp) {
        showLevelUp(res.data.levelUp.newLevel, res.data.levelUp.newRank);
      }
      qc.invalidateQueries({ queryKey: ["quests", "player"] });
    },
  });

  const quests = data?.quests ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Daily Quests</h1>
      {isLoading ? (
        <p className="text-slate-400">Loading quests...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quests.map((q, i) => (
            <GlassPanel key={q.id} delay={i * 0.05} hologram>
              <h3 className="font-medium text-sky-300">{q.template.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{q.template.description}</p>
              <p className="mt-4 text-xs text-slate-500">
                +{q.template.xpReward} XP · +{q.template.goldReward} gold
              </p>
              {q.status === "ACTIVE" && (
                <Button
                  className="mt-4 w-full"
                  loading={complete.isPending}
                  onClick={() => complete.mutate(q.id)}
                >
                  Complete
                </Button>
              )}
              {q.status === "COMPLETED" && (
                <p className="mt-4 text-center text-sm text-emerald-400">✓ Completed</p>
              )}
            </GlassPanel>
          ))}
        </div>
      )}
      {!isLoading && quests.length === 0 && (
        <GlassPanel><p className="text-slate-400">No quests available. Check back tomorrow.</p></GlassPanel>
      )}
    </div>
  );
}
