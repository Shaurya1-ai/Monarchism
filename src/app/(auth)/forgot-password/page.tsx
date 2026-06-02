"use client";

import { useState } from "react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApi } from "@/hooks/use-api";

export default function ForgotPasswordPage() {
  const { request } = useApi();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await request("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <GlassPanel className="w-full max-w-md">
        <h1 className="text-hologram text-xl font-semibold">Reset Password</h1>
        {sent ? (
          <p className="mt-4 text-slate-400">If that email exists, a reset link was sent. Check server logs in dev.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" loading={loading} className="w-full">Send Reset Link</Button>
          </form>
        )}
        <Link href="/login" className="mt-6 block text-center text-sm text-sky-400">Back to login</Link>
      </GlassPanel>
    </div>
  );
}
