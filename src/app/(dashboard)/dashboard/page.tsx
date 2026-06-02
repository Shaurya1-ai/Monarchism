"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/glass-panel";
import { XpBar } from "@/components/game/xp-bar";
import { StatCard } from "@/components/game/stat-card";
import { usePlayerStore } from "@/stores/player-store";
import { RANK_COLORS } from "@/lib/game/level";
import { Coins, Flame, Shield } from "lucide-react";

export default function DashboardPage() {
  const player = usePlayerStore((s) => s.player);
  if (!player) return null;

  const stats = [
    { key: "strength", value: player.strength },
    { key: "agility", value: player.agility },
    { key: "intelligence", value: player.intelligence },
    { key: "vitality", value: player.vitality },
    { key: "perception", value: player.perception },
  ] as const;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-sky-400/20 bg-gradient-to-r from-sky-900/30 via-cyan-900/15 to-transparent p-6"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Hunter Interface</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-100">
          Monarch Control Center
        </h1>
        <p className="mt-2 text-slate-300">
          Real-time status, rank progression, and combat readiness telemetry.
        </p>
      </motion.div>

      <GlassPanel hologram glow delay={0.1}>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-sky-500/80">Hunter</p>
            <h2 className="text-2xl font-bold">{player.hunterName}</h2>
            <p
              className="mt-1 text-lg font-medium"
              style={{ color: RANK_COLORS[player.rank] }}
            >
              Rank {player.rank}
            </p>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2 text-amber-400">
              <Coins className="h-5 w-5" />
              <span className="text-xl font-semibold tabular-nums">{player.gold}</span>
            </div>
            <div className="flex items-center gap-2 text-orange-400">
              <Flame className="h-5 w-5" />
              <span className="text-xl font-semibold">{player.questStreak} day streak</span>
            </div>
            <div className="flex items-center gap-2 text-sky-400">
              <Shield className="h-5 w-5" />
              <span className="text-xl font-semibold">{player.statPoints} pts</span>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <XpBar xp={player.xp} xpToNext={player.xpToNextLevel} level={player.level} />
        </div>
      </GlassPanel>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <StatCard key={s.key} name={s.key} value={s.value} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassPanel delay={0.2} className="relative overflow-hidden">
          <div className="absolute right-[-40px] top-[-40px] h-28 w-28 rounded-full bg-cyan-400/20 blur-3xl" />
          <h3 className="text-hologram font-medium">System Notice</h3>
          <p className="mt-2 text-sm text-slate-400">
            Complete daily quests to maintain your streak. Dungeons grant significant XP but
            impose a 30-minute cooldown after completion. Shadow extraction unlocks at level 5.
          </p>
        </GlassPanel>
        <GlassPanel delay={0.3} className="relative overflow-hidden">
          <div className="absolute left-[-40px] top-[-40px] h-28 w-28 rounded-full bg-sky-500/20 blur-3xl" />
          <h3 className="text-hologram font-medium">Quick Actions</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>→ Daily Quests — earn XP and gold</li>
            <li>→ Dungeons — procedural gates and bosses</li>
            <li>→ Shadow Army — summon and upgrade allies</li>
            <li>→ Guild — join hunters worldwide</li>
          </ul>
        </GlassPanel>
      </div>
    </div>
  );
}
