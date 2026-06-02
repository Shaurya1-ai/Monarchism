"use client";

import { useQuery } from "@tanstack/react-query";
import { GlassPanel } from "@/components/ui/glass-panel";
import { RANK_COLORS } from "@/lib/game/level";
import type { Rank } from "@/generated/prisma";

export default function LeaderboardsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await fetch("/api/leaderboards?category=xp");
      const json = await res.json();
      return json.data as {
        leaderboard: Array<{
          rank: number;
          hunterName: string;
          level: number;
          xp: number;
          playerRank: Rank;
          guild: { name: string; tag: string } | null;
        }>;
      };
    },
  });

  const rows = data?.leaderboard ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Global Rankings</h1>
      <GlassPanel hologram>
        {isLoading ? (
          <p className="text-slate-400">Loading rankings...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sky-500/20 text-left text-slate-500">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3">Hunter</th>
                  <th className="pb-3">Rank</th>
                  <th className="pb-3">Level</th>
                  <th className="pb-3">XP</th>
                  <th className="pb-3">Guild</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.hunterName}
                    className="border-b border-slate-800/50 hover:bg-sky-500/5"
                  >
                    <td className="py-3 pr-4 font-mono text-sky-400">{row.rank}</td>
                    <td className="py-3 font-medium">{row.hunterName}</td>
                    <td
                      className="py-3"
                      style={{ color: RANK_COLORS[row.playerRank] }}
                    >
                      {row.playerRank}
                    </td>
                    <td className="py-3">{row.level}</td>
                    <td className="py-3 tabular-nums">{row.xp.toLocaleString()}</td>
                    <td className="py-3 text-slate-500">
                      {row.guild ? `[${row.guild.tag}] ${row.guild.name}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
