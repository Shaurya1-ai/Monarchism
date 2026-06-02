"use client";

import { useMemo } from "react";

/** Lightweight CSS particle field — avoids heavy WebGL bundle */
export function ParticleField() {
  const particles = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        left: `${(i * 17) % 100}%`,
        top: `${(i * 23) % 100}%`,
        size: 1 + (i % 3),
        delay: `${(i % 10) * 0.4}s`,
        duration: `${4 + (i % 6)}s`,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-sky-400/40 animate-pulse"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            boxShadow: "0 0 6px rgba(56, 189, 248, 0.5)",
          }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(3,7,18,0.4)_100%)]" />
    </div>
  );
}
