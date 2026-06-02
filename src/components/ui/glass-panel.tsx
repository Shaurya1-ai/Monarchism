"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type GlassPanelProps = {
  children: React.ReactNode;
  className?: string;
  hologram?: boolean;
  glow?: boolean;
  delay?: number;
};

export function GlassPanel({
  children,
  className,
  hologram = false,
  glow = false,
  delay = 0,
}: GlassPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "glass rounded-2xl p-6",
        hologram && "hologram-border",
        glow && "glow-blue",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
