import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-[13px] font-medium text-ink-700"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[12px] text-loss">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputStyles =
  "w-full rounded-[10px] border border-line-strong bg-white px-3.5 text-sm text-ink-950 " +
  "placeholder:text-ink-300 transition-colors hover:border-brand-300 " +
  "focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 " +
  "disabled:bg-canvas disabled:text-ink-400";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputStyles, "h-11", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: ComponentProps<"select">) {
  return (
    <select className={cn(inputStyles, "h-11 pr-8", className)} {...props}>
      {children}
    </select>
  );
}
