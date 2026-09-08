"use client";

import { cn } from "@/shared/lib/cn";

/**
 * A real switch: a button carrying `role="switch"` and `aria-checked`, which
 * means it is keyboard operable and announced correctly without a hidden
 * checkbox underneath. It has no text of its own — the row's visible label is
 * wired in through `labelledBy`, so the name a screen reader announces is the
 * same one on screen.
 *
 * Focus is the global `:focus-visible` ring; `rounded-pill` sits in the
 * utilities layer so the outline follows the pill rather than squaring off.
 */
export function Switch({
  checked,
  onChange,
  labelledBy,
  describedBy,
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  labelledBy: string;
  describedBy?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill border transition-colors duration-150",
        checked
          ? "border-brand-700 bg-brand-700"
          : "border-line-strong bg-canvas hover:border-brand-300",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none block size-[18px] rounded-full bg-surface shadow-card transition-transform duration-150",
          checked ? "translate-x-[22px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}
