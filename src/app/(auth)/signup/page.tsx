"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApi } from "@/hooks/use-api";
import { TrafficLights } from "@/components/layout/traffic-lights";

export default function SignupPage() {
  const router = useRouter();
  const { request } = useApi();
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
    hunterName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await request("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.push(`/verify?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <GlassPanel hologram className="w-full max-w-md">
        <TrafficLights />
        <h1 className="text-hologram mt-4 text-2xl font-semibold">Awaken Hunter</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Display Name" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} required />
          <Input label="Hunter Name" value={form.hunterName} onChange={(e) => setForm({ ...form, hunterName: e.target.value })} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">Register</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/login" className="text-sky-400 hover:underline">Already registered?</Link>
        </p>
      </GlassPanel>
    </div>
  );
}
