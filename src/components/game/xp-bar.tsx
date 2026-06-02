"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type XpBarProps = {
  xp: number;
  xpToNext: number;
  level: number;
  className?: string;
  animate?: boolean;
};

export function XpBar({ xp, xpToNext, level, className, animate = true }: XpBarProps) {
  const pct = Math.min(100, (xp / xpToNext) * 100);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">LEVEL {level}</span>
        <span className="text-sky-400">
          {xp.toLocaleString()} / {xpToNext.toLocaleString()} XP
        </span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-800/80">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-600 via-cyan-400 to-sky-300"
          initial={animate ? { width: 0 } : false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      </div>
    </div>
  );
}
