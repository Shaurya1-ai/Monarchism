"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { request } = useApi();
  const token = params.get("token");
  const email = params.get("email");
  const [status, setStatus] = useState<"pending" | "ok" | "error">("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    request("/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then(() => {
        setStatus("ok");
        setTimeout(() => router.push("/login"), 2000);
      })
      .catch((e) => {
        setStatus("error");
        setMessage(e.message);
      });
  }, [token, request, router]);

  return (
    <GlassPanel hologram className="max-w-md text-center">
      {token ? (
        status === "pending" ? (
          <p className="text-slate-400">Verifying email...</p>
        ) : status === "ok" ? (
          <p className="text-emerald-400">Email verified! Redirecting...</p>
        ) : (
          <p className="text-rose-400">{message}</p>
        )
      ) : (
        <>
          <h1 className="text-hologram text-xl font-semibold">Check Your Email</h1>
          <p className="mt-4 text-slate-400">
            {email
              ? `Verification link sent to ${email}. In development, check server logs.`
              : "Click the link in your email to verify your account."}
          </p>
          <Link href="/login" className="mt-6 inline-block">
            <Button>Go to Login</Button>
          </Link>
        </>
      )}
    </GlassPanel>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={<p className="text-slate-400">Loading...</p>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
