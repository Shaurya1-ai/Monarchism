"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApi } from "@/hooks/use-api";
import { TrafficLights } from "@/components/layout/traffic-lights";

export default function LoginPage() {
  const router = useRouter();
  const { request } = useApi();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <GlassPanel hologram glow className="w-full max-w-md border-sky-400/30">
        <div className="mb-6">
          <TrafficLights />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Authentication Required</p>
        <h1 className="text-hologram mt-2 text-3xl font-semibold">System Login</h1>
        <p className="mt-1 text-sm text-slate-300">Authenticate to access your hunter profile</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <Button type="submit" loading={loading} className="w-full py-3 text-base">
            Access System
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/forgot-password" className="text-sky-400 hover:underline">Forgot password?</Link>
          {" · "}
          <Link href="/signup" className="text-sky-400 hover:underline">Create account</Link>
        </p>
      </GlassPanel>
    </div>
  );
}
