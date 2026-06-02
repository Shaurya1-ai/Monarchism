import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LocalPlayer = {
  id: string;
  hunterName: string;
  level: number;
  xp: number;
  rank: "E" | "D" | "C" | "B" | "A" | "S" | "NATIONAL" | "MONARCH";
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  perception: number;
  statPoints: number;
  gold: number;
  mana: number;
  maxMana: number;
  health: number;
  maxHealth: number;
  createdAt: string;
};

type PlayerState = {
  player: LocalPlayer | null;
  setPlayer: (p: LocalPlayer | null) => void;
  updatePlayer: (partial: Partial<LocalPlayer>) => void;
  initializePlayer: (hunterName: string) => LocalPlayer;
};

const createDefaultPlayer = (hunterName: string): LocalPlayer => ({
  id: crypto.randomUUID(),
  hunterName,
  level: 1,
  xp: 0,
  rank: "E",
  strength: 10,
  agility: 10,
  intelligence: 10,
  vitality: 10,
  perception: 10,
  statPoints: 0,
  gold: 100,
  mana: 100,
  maxMana: 100,
  health: 100,
  maxHealth: 100,
  createdAt: new Date().toISOString(),
});

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      player: null,
      setPlayer: (player) => set({ player }),
      updatePlayer: (partial) =>
        set((s) => ({
          player: s.player ? { ...s.player, ...partial } : null,
        })),
      initializePlayer: (hunterName: string) => {
        const existing = get().player;
        if (existing) return existing;
        const newPlayer = createDefaultPlayer(hunterName);
        set({ player: newPlayer });
        return newPlayer;
      },
    }),
    {
      name: "monarch-player-storage",
    }
  )
);
