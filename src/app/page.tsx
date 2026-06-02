import Link from "next/link";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { TrafficLights } from "@/components/layout/traffic-lights";

export default function HomePage() {
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
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/login">
            <Button className="px-8 py-3 text-base">Enter System</Button>
          </Link>
          <Link href="/signup">
            <Button variant="ghost" className="px-8 py-3 text-base">Awaken Account</Button>
          </Link>
        </div>
      </GlassPanel>
    </div>
  );
}
