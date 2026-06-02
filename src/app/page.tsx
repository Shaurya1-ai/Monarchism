import Link from "next/link";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { TrafficLights } from "@/components/layout/traffic-lights";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mb-8">
        <TrafficLights />
      </div>
      <GlassPanel hologram glow className="max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-sky-500/80">
          Welcome, Hunter
        </p>
        <h1 className="text-hologram mt-4 text-5xl font-bold tracking-tight md:text-6xl">
          MONARCH SYSTEM
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-slate-400">
          A premium hunter management interface inspired by Solo Leveling.
          Level up, complete daily quests, conquer dungeons, and command your
          shadow army.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/login">
            <Button>Enter System</Button>
          </Link>
          <Link href="/signup">
            <Button variant="ghost">Awaken Account</Button>
          </Link>
        </div>
      </GlassPanel>
    </div>
  );
}
