"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";

export function LevelUpModal() {
  const { levelUpModal, hideLevelUp } = useUiStore();

  return (
    <AnimatePresence>
      {levelUpModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={hideLevelUp}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong hologram-border glow-blue max-w-md rounded-3xl p-10 text-center"
          >
            <motion.p
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl"
            >
              ⬆️
            </motion.p>
            <h2 className="text-hologram mt-4 text-3xl font-bold tracking-tight">
              LEVEL UP
            </h2>
            <p className="mt-2 text-5xl font-black text-white">
              {levelUpModal.level}
            </p>
            <p className="mt-2 text-lg text-cyan-400">
              Rank: {levelUpModal.rank}
            </p>
            <p className="mt-4 text-sm text-slate-400">
              The System has recognized your growth, Hunter.
            </p>
            <Button className="mt-8" onClick={hideLevelUp}>
              Continue
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
