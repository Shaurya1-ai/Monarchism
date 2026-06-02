import { create } from "zustand";

export type Notification = {
  id: string;
  type: "success" | "error" | "info" | "levelup";
  title: string;
  message?: string;
};

type UiState = {
  notifications: Notification[];
  levelUpModal: { level: number; rank: string } | null;
  sidebarOpen: boolean;
  addNotification: (n: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  showLevelUp: (level: number, rank: string) => void;
  hideLevelUp: () => void;
  setSidebarOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  notifications: [],
  levelUpModal: null,
  sidebarOpen: true,
  addNotification: (n) =>
    set((s) => ({
      notifications: [
        ...s.notifications,
        { ...n, id: crypto.randomUUID() },
      ],
    })),
  removeNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((x) => x.id !== id),
    })),
  showLevelUp: (level, rank) => set({ levelUpModal: { level, rank } }),
  hideLevelUp: () => set({ levelUpModal: null }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
