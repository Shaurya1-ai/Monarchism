"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { cn } from "@/lib/utils/cn";

export default function AchievementsPage() {
  const { request } = useApi();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["achievements"],
    queryFn: () =>
      request<{ achievements: Array<{ id: string; title: string; description: string; icon: string; unlocked: boolean; claimed: boolean; hidden: boolean }> }>("/api/achievements").then((r) => r.data!),
  });

  const claim = useMutation({
    mutationFn: (achievementId: string) =>
      request("/api/achievements", {
        method: "POST",
        body: JSON.stringify({ achievementId }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["achievements"] }),
  });

  const achievements = data?.achievements ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Achievements</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a, i) => (
          <GlassPanel
            key={a.id}
            delay={i * 0.03}
            className={cn(!a.unlocked && "opacity-60")}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{a.unlocked ? a.icon : "❓"}</span>
              <div className="flex-1">
                <h3 className="font-medium">{a.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{a.description}</p>
                {a.unlocked && !a.claimed && (
                  <Button
                    className="mt-3"
                    onClick={() => claim.mutate(a.id)}
                    loading={claim.isPending}
                  >
                    Claim Reward
                  </Button>
                )}
                {a.claimed && (
                  <p className="mt-2 text-xs text-emerald-400">Claimed</p>
                )}
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
