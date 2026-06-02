"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { cn } from "@/lib/utils/cn";

const RARITY_CLASS: Record<string, string> = {
  COMMON: "rarity-common",
  UNCOMMON: "rarity-uncommon",
  RARE: "rarity-rare",
  EPIC: "rarity-epic",
  LEGENDARY: "rarity-legendary",
  MONARCH: "rarity-monarch",
};

type InvItem = {
  id: string;
  item: {
    name: string;
    description: string;
    rarity: string;
    type: string;
    slot: string | null;
    attack: number;
    defense: number;
  };
};

export default function InventoryPage() {
  const { request } = useApi();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["inventory"],
    queryFn: () =>
      request<{ inventory: InvItem[]; equipment: Array<{ slot: string; item: InvItem["item"] }> }>("/api/inventory").then((r) => r.data!),
  });

  const equip = useMutation({
    mutationFn: ({ id, slot }: { id: string; slot: string }) =>
      request("/api/inventory", {
        method: "POST",
        body: JSON.stringify({ inventoryItemId: id, slot }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });

  const inventory = data?.inventory ?? [];
  const equipment = data?.equipment ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Inventory</h1>

      <GlassPanel hologram>
        <h2 className="text-sm uppercase tracking-wider text-slate-400">Equipped</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          {["WEAPON", "HEAD", "CHEST", "LEGS", "ACCESSORY"].map((slot) => {
            const eq = equipment.find((e) => e.slot === slot);
            return (
              <div
                key={slot}
                className="glass flex min-h-[80px] flex-col items-center justify-center rounded-xl p-3 text-center"
                title={eq?.item.name}
              >
                <span className="text-[10px] text-slate-500">{slot}</span>
                <span className="mt-1 text-xs text-sky-300">
                  {eq?.item.name ?? "—"}
                </span>
              </div>
            );
          })}
        </div>
      </GlassPanel>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {inventory.map((inv, i) => (
          <GlassPanel
            key={inv.id}
            delay={i * 0.02}
            className="group relative cursor-default p-4"
          >
            <p className={cn("text-sm font-medium", RARITY_CLASS[inv.item.rarity])}>
              {inv.item.name}
            </p>
            <p className="mt-1 line-clamp-2 text-[10px] text-slate-500">
              {inv.item.description}
            </p>
            {inv.item.slot && (
              <Button
                variant="ghost"
                className="mt-2 w-full text-xs"
                onClick={() =>
                  equip.mutate({ id: inv.id, slot: inv.item.slot! })
                }
              >
                Equip
              </Button>
            )}
            {/* Tooltip on hover */}
            <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-48 -translate-x-1/2 rounded-lg glass-strong p-3 text-xs group-hover:block">
              ATK {inv.item.attack} / DEF {inv.item.defense}
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
