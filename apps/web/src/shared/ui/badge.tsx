import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type Tone = "neutral" | "brand" | "gain" | "loss" | "warn";

const TONES: Record<Tone, string> = {
  neutral: "bg-canvas text-ink-500 border-line",
  brand: "bg-brand-50 text-brand-800 border-brand-100",
  gain: "bg-gain-soft text-gain border-gain/20",
  loss: "bg-loss-soft text-loss border-loss/20",
  warn: "bg-warn-soft text-warn border-warn/25",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-[11px] font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Filter chip used on Market and Notifications. */
export function Chip({
  active,
  children,
  ...props
}: {
  active?: boolean;
  children: ReactNode;
} & React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "h-8 shrink-0 rounded-pill border px-3.5 text-[13px] font-medium transition-colors",
        active
          ? "border-brand-700 bg-brand-700 text-white"
          : "border-line-strong bg-white text-ink-500 hover:border-brand-300 hover:text-brand-800",
      )}
      {...props}
    >
      {children}
    </button>
  );
}
