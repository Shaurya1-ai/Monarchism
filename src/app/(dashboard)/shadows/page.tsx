"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/stores/player-store";
import { useUiStore } from "@/stores/ui-store";

type Shadow = {
  id: string;
  name: string;
  title: string;
  icon: string;
  grade: string;
  level: number;
  power: number;
  baseCost: number;
};

const SHADOW_TEMPLATES = [
  { id: "t1", name: "Igris", title: "Blood-Red Commander", icon: "⚔️", grade: "S", basePower: 150, baseCost: 500 },
  { id: "t2", name: "Beru", title: "Ant King", icon: "🐜", grade: "S", basePower: 180, baseCost: 600 },
  { id: "t3", name: "Tusk", title: "Giant Shadow", icon: "🦣", grade: "A", basePower: 100, baseCost: 300 },
  { id: "t4", name: "Iron", title: "Steel Knight", icon: "🛡️", grade: "A", basePower: 90, baseCost: 250 },
  { id: "t5", name: "Tank", title: "Heavy Guard", icon: "🪨", grade: "B", basePower: 60, baseCost: 150 },
  { id: "t6", name: "Shadow Soldier", title: "Basic Infantry", icon: "👤", grade: "E", basePower: 10, baseCost: 50 },
];

export default function ShadowsPage() {
  const player = usePlayerStore((s) => s.player);
  const updatePlayer = usePlayerStore((s) => s.updatePlayer);
  const addNotification = useUiStore((s) => s.addNotification);
  
  const [shadows, setShadows] = useState<Shadow[]>([]);

  if (!player) return null;

  function summonShadow(template: typeof SHADOW_TEMPLATES[0]) {
    if (player.gold < template.baseCost) {
      addNotification({ type: "error", title: "Not enough gold!" });
      return;
    }

    const newShadow: Shadow = {
      id: `shadow-${Date.now()}`,
      name: template.name,
      title: template.title,
      icon: template.icon,
      grade: template.grade,
      level: 1,
      power: template.basePower,
      baseCost: template.baseCost,
    };

    setShadows((prev) => [...prev, newShadow]);
    updatePlayer({ gold: player.gold - template.baseCost });
    addNotification({ 
      type: "success", 
      title: "Shadow Summoned!", 
      message: `${template.name} has joined your army` 
    });
  }

  function upgradeShadow(shadowId: string) {
    const shadow = shadows.find((s) => s.id === shadowId);
    if (!shadow) return;

    const upgradeCost = shadow.level * 50;
    if (player.gold < upgradeCost) {
      addNotification({ type: "error", title: "Not enough gold!" });
      return;
    }

    setShadows((prev) =>
      prev.map((s) =>
        s.id === shadowId
          ? { ...s, level: s.level + 1, power: Math.floor(s.power * 1.15) }
          : s
      )
    );
    updatePlayer({ gold: player.gold - upgradeCost });
    addNotification({ 
      type: "success", 
      title: "Shadow Upgraded!", 
      message: `${shadow.name} is now level ${shadow.level + 1}` 
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Shadow Army</h1>

      {shadows.length > 0 && (
        <>
          <h2 className="text-xl text-slate-300">Your Shadows</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shadows.map((s) => (
              <motion.div
                key={s.id}
                whileHover={{ y: -8, rotateY: 5 }}
                style={{ perspective: 1000 }}
              >
                <GlassPanel hologram glow className="text-center">
                  <motion.span
                    animate={{ textShadow: ["0 0 20px #38bdf8", "0 0 40px #22d3ee", "0 0 20px #38bdf8"] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-4xl"
                  >
                    {s.icon}
                  </motion.span>
                  <h3 className="mt-2 font-medium">{s.name}</h3>
                  <p className="text-xs text-slate-500">{s.grade}-Rank · {s.title}</p>
                  <p className="mt-2 text-sky-400">PWR {s.power} · Lv.{s.level}</p>
                  <Button
                    variant="ghost"
                    className="mt-3 w-full"
                    onClick={() => upgradeShadow(s.id)}
                  >
                    Upgrade ({s.level * 50} gold)
                  </Button>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </>
      )}

      <h2 className="text-xl text-slate-300">Summon</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {SHADOW_TEMPLATES.map((t) => (
          <GlassPanel key={t.id}>
            <span className="text-3xl">{t.icon}</span>
            <h3 className="mt-2 font-medium">{t.name}</h3>
            <p className="text-xs text-slate-500">{t.grade}-Rank · {t.title}</p>
            <p className="mt-1 text-xs text-slate-400">Base Power: {t.basePower}</p>
            <Button
              className="mt-4 w-full"
              onClick={() => summonShadow(t)}
              disabled={player.gold < t.baseCost}
            >
              Summon ({t.baseCost} gold)
            </Button>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
