"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApi } from "@/hooks/use-api";

export default function GuildPage() {
  const { request } = useApi();
  const qc = useQueryClient();
  const [msg, setMsg] = useState("");
  const [createForm, setCreateForm] = useState({ name: "", tag: "", description: "" });

  const { data } = useQuery({
    queryKey: ["guild"],
    queryFn: () =>
      request<{
        membership: { guild: { name: string; tag: string; members: unknown[]; messages: Array<{ content: string; createdAt: string }> } } | null;
        guilds: Array<{ id: string; name: string; tag: string; _count: { members: number } }>;
      }>("/api/guild").then((r) => r.data!),
  });

  const sendMsg = useMutation({
    mutationFn: () =>
      request("/api/guild", { method: "POST", body: JSON.stringify({ content: msg }) }),
    onSuccess: () => {
      setMsg("");
      qc.invalidateQueries({ queryKey: ["guild"] });
    },
  });

  const join = useMutation({
    mutationFn: (guildId: string) =>
      request("/api/guild", { method: "POST", body: JSON.stringify({ guildId }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["guild"] }),
  });

  const create = useMutation({
    mutationFn: () =>
      request("/api/guild", { method: "POST", body: JSON.stringify(createForm) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["guild"] }),
  });

  const guild = data?.membership?.guild;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Guild</h1>

      {guild ? (
        <>
          <GlassPanel hologram>
            <h2 className="text-hologram text-xl">
              [{guild.tag}] {guild.name}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {Array.isArray(guild.members) ? guild.members.length : 0} members
            </p>
          </GlassPanel>
          <GlassPanel>
            <h3 className="text-sm uppercase text-slate-500">Guild Chat</h3>
            <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
              {guild.messages?.map((m, i) => (
                <p key={i} className="text-sm text-slate-300">
                  {m.content}
                </p>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Message..."
                className="flex-1"
              />
              <Button onClick={() => sendMsg.mutate()} loading={sendMsg.isPending}>
                Send
              </Button>
            </div>
          </GlassPanel>
        </>
      ) : (
        <>
          <GlassPanel>
            <h3 className="font-medium">Create Guild</h3>
            <div className="mt-4 space-y-3">
              <Input label="Name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
              <Input label="Tag" value={createForm.tag} onChange={(e) => setCreateForm({ ...createForm, tag: e.target.value.toUpperCase() })} />
              <Button onClick={() => create.mutate()} loading={create.isPending}>Create</Button>
            </div>
          </GlassPanel>
          <div className="grid gap-3 md:grid-cols-2">
            {data?.guilds.map((g) => (
              <GlassPanel key={g.id}>
                <p className="font-medium">[{g.tag}] {g.name}</p>
                <p className="text-sm text-slate-500">{g._count.members} members</p>
                <Button variant="ghost" className="mt-3" onClick={() => join.mutate(g.id)}>
                  Join
                </Button>
              </GlassPanel>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
