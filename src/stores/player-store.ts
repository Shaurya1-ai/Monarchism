import { create } from "zustand";
import type { Player } from "@/generated/prisma";

type PlayerState = {
  player: Player | null;
  setPlayer: (p: Player | null) => void;
  updatePlayer: (partial: Partial<Player>) => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  player: null,
  setPlayer: (player) => set({ player }),
  updatePlayer: (partial) =>
    set((s) => ({
      player: s.player ? { ...s.player, ...partial } : null,
    })),
}));
