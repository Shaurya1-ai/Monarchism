"use client";

import { cn } from "@/lib/utils/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full rounded-xl border border-sky-500/20 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 backdrop-blur-xl transition focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20",
          error && "border-rose-500/50",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
