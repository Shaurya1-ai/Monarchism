"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const RARITY_CLASS: Record<string, string> = {
  COMMON: "text-slate-400",
  UNCOMMON: "text-green-400",
  RARE: "text-blue-400",
  EPIC: "text-purple-400",
  LEGENDARY: "text-amber-400",
  MONARCH: "text-cyan-400",
};

type InvItem = {
  id: string;
  name: string;
  description: string;
  rarity: string;
  type: string;
  slot: string | null;
  attack: number;
  defense: number;
};

const STARTER_ITEMS: InvItem[] = [
  { id: "i1", name: "Training Sword", description: "A basic sword for beginners", rarity: "COMMON", type: "WEAPON", slot: "WEAPON", attack: 5, defense: 0 },
  { id: "i2", name: "Leather Helmet", description: "Basic head protection", rarity: "COMMON", type: "ARMOR", slot: "HEAD", attack: 0, defense: 3 },
  { id: "i3", name: "Cloth Tunic", description: "Simple chest armor", rarity: "COMMON", type: "ARMOR", slot: "CHEST", attack: 0, defense: 5 },
  { id: "i4", name: "Health Potion", description: "Restores 50 HP", rarity: "UNCOMMON", type: "CONSUMABLE", slot: null, attack: 0, defense: 0 },
  { id: "i5", name: "Mana Crystal", description: "Restores 30 MP", rarity: "UNCOMMON", type: "CONSUMABLE", slot: null, attack: 0, defense: 0 },
  { id: "i6", name: "Iron Dagger", description: "Quick and deadly", rarity: "RARE", type: "WEAPON", slot: "WEAPON", attack: 12, defense: 0 },
];

export default function InventoryPage() {
  const [inventory] = useState<InvItem[]>(STARTER_ITEMS);
  const [equipment, setEquipment] = useState<Record<string, InvItem | null>>({
    WEAPON: null,
    HEAD: null,
    CHEST: null,
    LEGS: null,
    ACCESSORY: null,
  });

  function equipItem(item: InvItem) {
    if (!item.slot) return;
    setEquipment((prev) => ({ ...prev, [item.slot!]: item }));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Inventory</h1>

      <GlassPanel hologram>
        <h2 className="text-sm uppercase tracking-wider text-slate-400">Equipped</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          {["WEAPON", "HEAD", "CHEST", "LEGS", "ACCESSORY"].map((slot) => {
            const eq = equipment[slot];
            return (
              <div
                key={slot}
                className="glass flex min-h-[80px] flex-col items-center justify-center rounded-xl p-3 text-center"
                title={eq?.name}
              >
                <span className="text-[10px] text-slate-500">{slot}</span>
                <span className={cn("mt-1 text-xs", eq ? RARITY_CLASS[eq.rarity] : "text-slate-600")}>
                  {eq?.name ?? "—"}
                </span>
              </div>
            );
          })}
        </div>
      </GlassPanel>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {inventory.map((item, i) => (
          <GlassPanel
            key={item.id}
            delay={i * 0.02}
            className="group relative cursor-default p-4"
          >
            <p className={cn("text-sm font-medium", RARITY_CLASS[item.rarity])}>
              {item.name}
            </p>
            <p className="mt-1 line-clamp-2 text-[10px] text-slate-500">
              {item.description}
            </p>
            <p className="mt-2 text-[10px] text-slate-600">
              ATK {item.attack} / DEF {item.defense}
            </p>
            {item.slot && (
              <Button
                variant="ghost"
                className="mt-2 w-full text-xs"
                onClick={() => equipItem(item)}
              >
                Equip
              </Button>
            )}
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
