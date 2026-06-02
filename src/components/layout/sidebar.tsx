"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Scroll,
  Trophy,
  Backpack,
  Castle,
  Ghost,
  Medal,
  Users,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { TrafficLights } from "@/components/layout/traffic-lights";
import { usePlayerStore } from "@/stores/player-store";
import { RANK_COLORS } from "@/lib/game/level";

const NAV = [
  { href: "/dashboard", label: "System", icon: LayoutDashboard },
  { href: "/quests", label: "Daily Quests", icon: Scroll },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/inventory", label: "Inventory", icon: Backpack },
  { href: "/dungeons", label: "Dungeons", icon: Castle },
  { href: "/shadows", label: "Shadow Army", icon: Ghost },
  { href: "/leaderboards", label: "Rankings", icon: Medal },
  { href: "/guild", label: "Guild", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const player = usePlayerStore((s) => s.player);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass-strong fixed left-4 top-4 z-40 hidden h-[calc(100vh-2rem)] w-72 flex-col rounded-3xl p-4 shadow-2xl md:flex"
    >
      <div className="mb-6 flex items-center justify-between px-2">
        <TrafficLights />
        <span className="text-[10px] uppercase tracking-[0.2em] text-sky-500/80">
          Monarch
        </span>
      </div>

      <div className="mb-4 rounded-2xl border border-sky-500/10 bg-slate-950/40 p-3">
        <h1 className="text-hologram text-lg font-semibold tracking-tight">
          MONARCH SYSTEM
        </h1>
        {player && (
          <div className="mt-2 flex items-center justify-between">
            <p className="truncate text-xs text-slate-300">{player.hunterName}</p>
            <span
              style={{ color: RANK_COLORS[player.rank] }}
              className="rounded-full border border-current/30 px-2 py-0.5 text-[10px] font-semibold"
            >
              {player.rank}
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}>
              <motion.span
                whileHover={{ x: 4, scale: 1.01 }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-gradient-to-r from-sky-500/30 to-cyan-500/10 text-sky-200 shadow-[0_0_30px_rgba(56,189,248,0.18)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </motion.span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-sky-500/10 pt-4 text-center text-[10px] uppercase tracking-[0.18em] text-slate-500">
        SYSTEM ONLINE v1.0
      </div>
    </motion.aside>
  );
}
