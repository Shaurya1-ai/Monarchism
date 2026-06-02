"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";

export default function ShadowsPage() {
  const { request } = useApi();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["shadows"],
    queryFn: () =>
      request<{
        templates: Array<{ id: string; name: string; title: string; grade: string; basePower: number; icon: string }>;
        shadows: Array<{ id: string; level: number; power: number; template: { name: string; icon: string; grade: string } }>;
      }>("/api/shadows").then((r) => r.data!),
  });

  const summon = useMutation({
    mutationFn: (templateId: string) =>
      request("/api/shadows", {
        method: "POST",
        body: JSON.stringify({ templateId }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shadows"] }),
  });

  const upgrade = useMutation({
    mutationFn: (shadowId: string) =>
      request("/api/shadows", {
        method: "POST",
        body: JSON.stringify({ shadowId }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shadows"] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Shadow Army</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data?.shadows.map((s) => (
          <motion.div
            key={s.id}
            whileHover={{ y: -8, rotateY: 5 }}
            style={{ perspective: 1000 }}
          >
            <GlassPanel hologram glow className="text-center">
              <motion.span
                animate={{ textShadow: ["0 0 20px #38bdf8", "0 0 40px #22d3ee", "0 0 20px #38bdf8"] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-4xl"
              >
                {s.template.icon}
              </motion.span>
              <h3 className="mt-2 font-medium">{s.template.name}</h3>
              <p className="text-xs text-slate-500">{s.template.grade}</p>
              <p className="mt-2 text-sky-400">PWR {s.power} · Lv.{s.level}</p>
              <Button
                variant="ghost"
                className="mt-3 w-full"
                onClick={() => upgrade.mutate(s.id)}
                loading={upgrade.isPending}
              >
                Upgrade
              </Button>
            </GlassPanel>
          </motion.div>
        ))}
      </div>

      <h2 className="text-xl text-slate-300">Summon</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {data?.templates.map((t) => (
          <GlassPanel key={t.id}>
            <span className="text-3xl">{t.icon}</span>
            <h3 className="mt-2 font-medium">{t.name}</h3>
            <p className="text-xs text-slate-500">{t.title}</p>
            <Button
              className="mt-4 w-full"
              onClick={() => summon.mutate(t.id)}
              loading={summon.isPending}
            >
              Summon ({t.basePower * 10} gold)
            </Button>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
