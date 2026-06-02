"use client";

import { GlassPanel } from "@/components/ui/glass-panel";
import { usePlayerStore } from "@/stores/player-store";

const RANK_COLORS: Record<string, string> = {
  E: "#9ca3af",
  D: "#22c55e",
  C: "#3b82f6",
  B: "#a855f7",
  A: "#f59e0b",
  S: "#ef4444",
  NATIONAL: "#ec4899",
  MONARCH: "#06b6d4",
};

// Sample leaderboard data for demo purposes
const DEMO_PLAYERS = [
  { rank: 1, hunterName: "Shadow Monarch", level: 100, xp: 999999, playerRank: "MONARCH" as const, guild: { name: "Ahjin Guild", tag: "AHJ" } },
  { rank: 2, hunterName: "Cha Hae-In", level: 85, xp: 450000, playerRank: "S" as const, guild: { name: "Hunters Guild", tag: "HG" } },
  { rank: 3, hunterName: "Baek Yoonho", level: 78, xp: 380000, playerRank: "S" as const, guild: { name: "White Tiger", tag: "WT" } },
  { rank: 4, hunterName: "Go Gun-Hee", level: 72, xp: 320000, playerRank: "NATIONAL" as const, guild: null },
  { rank: 5, hunterName: "Thomas Andre", level: 70, xp: 300000, playerRank: "NATIONAL" as const, guild: { name: "Scavenger", tag: "SCV" } },
];

export default function LeaderboardsPage() {
  const player = usePlayerStore((s) => s.player);

  // Merge current player into leaderboard
  const allPlayers = player
    ? [
        ...DEMO_PLAYERS,
        {
          rank: 0,
          hunterName: player.hunterName,
          level: player.level,
          xp: player.xp,
          playerRank: player.rank,
          guild: null,
        },
      ]
    : DEMO_PLAYERS;

  // Sort by XP and assign ranks
  const sortedPlayers = allPlayers
    .sort((a, b) => b.xp - a.xp)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Global Rankings</h1>
      <GlassPanel hologram>
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
              {sortedPlayers.map((row) => {
                const isCurrentPlayer = player && row.hunterName === player.hunterName;
                return (
                  <tr
                    key={row.hunterName}
                    className={`border-b border-slate-800/50 ${
                      isCurrentPlayer
                        ? "bg-sky-500/10 text-sky-200"
                        : "hover:bg-sky-500/5"
                    }`}
                  >
                    <td className="py-3 pr-4 font-mono text-sky-400">{row.rank}</td>
                    <td className="py-3 font-medium">
                      {row.hunterName}
                      {isCurrentPlayer && (
                        <span className="ml-2 text-xs text-sky-400">(You)</span>
                      )}
                    </td>
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
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
