"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useUiStore } from "@/stores/ui-store";
import { X } from "lucide-react";

export function NotificationStack() {
  const { notifications, removeNotification } = useUiStore();

  return (
    <div className="fixed right-6 top-6 z-[100] flex flex-col gap-3">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            className="glass glow-blue max-w-sm rounded-xl p-4 pr-10"
            onAnimationComplete={() => {
              setTimeout(() => removeNotification(n.id), 5000);
            }}
          >
            <button
              type="button"
              onClick={() => removeNotification(n.id)}
              className="absolute right-3 top-3 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <p
              className={
                n.type === "levelup"
                  ? "text-hologram font-semibold"
                  : "font-medium text-slate-100"
              }
            >
              {n.title}
            </p>
            {n.message && (
              <p className="mt-1 text-sm text-slate-400">{n.message}</p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
