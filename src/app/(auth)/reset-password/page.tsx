"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApi } from "@/hooks/use-api";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { request } = useApi();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await request("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassPanel className="w-full max-w-md">
      <h1 className="text-hologram text-xl font-semibold">New Password</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">Update Password</Button>
      </form>
    </GlassPanel>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={<p className="text-slate-400">Loading...</p>}>
        <ResetForm />
      </Suspense>
      <Link href="/login" className="sr-only">Login</Link>
    </div>
  );
}
