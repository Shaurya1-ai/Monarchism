"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrafficLights } from "@/components/layout/traffic-lights";
import { usePlayerStore } from "@/stores/player-store";

export default function HomePage() {
  const router = useRouter();
  const [hunterName, setHunterName] = useState("");
  const [mounted, setMounted] = useState(false);
  const { player, initializePlayer } = usePlayerStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && player) {
      router.push("/dashboard");
    }
  }, [mounted, player, router]);

  const handleEnter = () => {
    if (hunterName.trim().length < 2) return;
    initializePlayer(hunterName.trim());
    router.push("/dashboard");
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500/30 border-t-sky-400" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute left-[-120px] top-[-100px] h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-140px] right-[-120px] h-96 w-96 rounded-full bg-indigo-500/20 blur-[130px]" />
      <div className="mb-8">
        <TrafficLights />
      </div>
      <GlassPanel hologram glow className="max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-sky-500/80">
          Welcome, Hunter
        </p>
        <h1 className="text-hologram mt-4 text-5xl font-black tracking-tight md:text-7xl">
          MONARCH SYSTEM
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">
          A premium hunter management interface inspired by Solo Leveling.
          Level up, complete daily quests, conquer dungeons, and command your
          shadow army.
        </p>
        <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-sky-400/20 bg-slate-900/40 p-3 text-sm text-slate-200">Dynamic leveling engine</div>
          <div className="rounded-xl border border-sky-400/20 bg-slate-900/40 p-3 text-sm text-slate-200">Procedural dungeon gates</div>
          <div className="rounded-xl border border-sky-400/20 bg-slate-900/40 p-3 text-sm text-slate-200">Shadow army management</div>
        </div>
        
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="w-full max-w-sm">
            <label className="mb-2 block text-left text-xs uppercase tracking-wider text-slate-400">
              Enter Your Hunter Name
            </label>
            <Input
              value={hunterName}
              onChange={(e) => setHunterName(e.target.value)}
              placeholder="e.g. Sung Jin-Woo"
              onKeyDown={(e) => e.key === "Enter" && handleEnter()}
              className="text-center"
            />
          </div>
          <Button 
            onClick={handleEnter}
            disabled={hunterName.trim().length < 2}
            className="px-8 py-3 text-base"
          >
            Enter System
          </Button>
        </div>
      </GlassPanel>
    </div>
  );
}
