"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { usePlayerStore } from "@/stores/player-store";

export default function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const router = useRouter();
  const setPlayer = usePlayerStore((s) => s.setPlayer);

  const { data, isError, isLoading } = useQuery({
    queryKey: ["player"],
    queryFn: async () => {
      const res = await fetch("/api/player");
      if (res.status === 401) throw new Error("auth");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data.player;
    },
  });

  useEffect(() => {
    if (data) setPlayer(data);
  }, [data, setPlayer]);

  useEffect(() => {
    if (isError) router.push("/login");
  }, [isError, router]);

  if (isLoading) {
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
    <div className="min-h-screen pl-72 pr-6 py-6">
      <Sidebar />
      <main className="relative z-10">{children}</main>
    </div>
  );
}
