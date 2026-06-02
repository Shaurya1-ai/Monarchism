"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { usePlayerStore } from "@/stores/player-store";

export default function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const router = useRouter();
  const player = usePlayerStore((s) => s.player);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !player) {
      router.push("/");
    }
  }, [mounted, player, router]);

  if (!mounted || !player) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass rounded-2xl px-8 py-6 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-sky-500/30 border-t-sky-400" />
          <p className="mt-4 text-sm text-slate-400">Initializing System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 md:pl-[20rem] md:pr-6">
      <Sidebar />
      <main className="relative z-10">{children}</main>
    </div>
  );
}
