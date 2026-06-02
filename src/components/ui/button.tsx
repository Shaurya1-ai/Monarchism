"use client";

import { cn } from "@/lib/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  loading?: boolean;
};

export function Button({
  className,
  variant = "primary",
  loading,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-400/40 hover:scale-[1.02] active:scale-[0.98]",
    ghost:
      "glass text-sky-300 hover:bg-white/5 border border-sky-500/20 hover:scale-[1.02] active:scale-[0.98]",
    danger:
      "bg-rose-600/80 text-white hover:bg-rose-500 hover:scale-[1.02] active:scale-[0.98]",
  };

  return (
    <button
      type={type}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      )}
      {children}
    </button>
  );
}
