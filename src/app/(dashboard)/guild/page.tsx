"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlayerStore } from "@/stores/player-store";

type Guild = {
  id: string;
  name: string;
  tag: string;
  members: number;
};

const DEMO_GUILDS: Guild[] = [
  { id: "g1", name: "Ahjin Guild", tag: "AHJ", members: 156 },
  { id: "g2", name: "Hunters Association", tag: "HA", members: 423 },
  { id: "g3", name: "White Tiger", tag: "WT", members: 89 },
  { id: "g4", name: "Scavenger", tag: "SCV", members: 67 },
];

type Message = {
  sender: string;
  content: string;
  time: string;
};

export default function GuildPage() {
  const player = usePlayerStore((s) => s.player);
  const [myGuild, setMyGuild] = useState<Guild | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { sender: "System", content: "Welcome to the guild chat!", time: "12:00" },
  ]);
  const [msg, setMsg] = useState("");
  const [createForm, setCreateForm] = useState({ name: "", tag: "" });

  if (!player) return null;

  function joinGuild(guild: Guild) {
    setMyGuild(guild);
    setMessages((prev) => [
      ...prev,
      { sender: "System", content: `${player.hunterName} has joined the guild!`, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);
  }

  function createGuild() {
    if (createForm.name.length < 3 || createForm.tag.length < 2) return;
    const newGuild: Guild = {
      id: `guild-${Date.now()}`,
      name: createForm.name,
      tag: createForm.tag.toUpperCase(),
      members: 1,
    };
    setMyGuild(newGuild);
    setMessages([
      { sender: "System", content: `Guild "${newGuild.name}" has been created!`, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);
  }

  function sendMessage() {
    if (!msg.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: player.hunterName, content: msg, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setMsg("");
  }

  function leaveGuild() {
    setMyGuild(null);
    setMessages([]);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Guild</h1>

      {myGuild ? (
        <>
          <GlassPanel hologram>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-hologram text-xl">
                  [{myGuild.tag}] {myGuild.name}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {myGuild.members} members
                </p>
              </div>
              <Button variant="danger" onClick={leaveGuild}>
                Leave Guild
              </Button>
            </div>
          </GlassPanel>
          <GlassPanel>
            <h3 className="text-sm uppercase text-slate-500">Guild Chat</h3>
            <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
              {messages.map((m, i) => (
                <p key={i} className="text-sm">
                  <span className="text-slate-500">[{m.time}]</span>{" "}
                  <span className={m.sender === "System" ? "text-cyan-400" : "text-sky-300"}>
                    {m.sender}:
                  </span>{" "}
                  <span className="text-slate-300">{m.content}</span>
                </p>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </GlassPanel>
        </>
      ) : (
        <>
          <GlassPanel>
            <h3 className="font-medium">Create Guild</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              <Input
                placeholder="Guild Name"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="flex-1 min-w-[150px]"
              />
              <Input
                placeholder="Tag (3 chars)"
                value={createForm.tag}
                onChange={(e) => setCreateForm({ ...createForm, tag: e.target.value.toUpperCase().slice(0, 4) })}
                className="w-24"
              />
              <Button onClick={createGuild} disabled={createForm.name.length < 3 || createForm.tag.length < 2}>
                Create
              </Button>
            </div>
          </GlassPanel>
          <h3 className="text-lg text-slate-300">Available Guilds</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {DEMO_GUILDS.map((g) => (
              <GlassPanel key={g.id}>
                <p className="font-medium">[{g.tag}] {g.name}</p>
                <p className="text-sm text-slate-500">{g.members} members</p>
                <Button variant="ghost" className="mt-3" onClick={() => joinGuild(g)}>
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
