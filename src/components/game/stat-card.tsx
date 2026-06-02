"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const STAT_ICONS: Record<string, string> = {
  strength: "⚔️",
  agility: "💨",
  intelligence: "🧠",
  vitality: "❤️",
  perception: "👁️",
};

type StatCardProps = {
  name: string;
  value: number;
  onIncrement?: () => void;
  canEdit?: boolean;
};

export function StatCard({ name, value, onIncrement, canEdit }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass rounded-xl p-4 text-center"
    >
      <div className="text-2xl">{STAT_ICONS[name] ?? "◆"}</div>
      <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">
        {name}
      </p>
      <motion.p
        key={value}
        initial={{ scale: 1.2, color: "#38bdf8" }}
        animate={{ scale: 1, color: "#f1f5f9" }}
        className="mt-1 text-2xl font-semibold tabular-nums"
      >
        {value}
      </motion.p>
      {canEdit && onIncrement && (
        <button
          type="button"
          onClick={onIncrement}
          className={cn(
            "mt-2 rounded-lg border border-sky-500/30 px-3 py-1 text-xs text-sky-400",
            "hover:bg-sky-500/10 transition"
          )}
        >
          +1
        </button>
      )}
    </motion.div>
  );
}
