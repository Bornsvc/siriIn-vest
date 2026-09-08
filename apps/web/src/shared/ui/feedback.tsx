import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/** An empty screen is an invitation to act, so it always carries the action. */
export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-5 py-12 text-center", className)}>
      <div
        aria-hidden
        className="mx-auto mb-4 h-px w-10 bg-line-strong"
      />
      <h3 className="font-display text-[15px] font-medium text-ink-950">
        {title}
      </h3>
      <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-400">
        {body}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-[8px] bg-line/70", className)}
      aria-hidden
    />
  );
}

/** Inline note for conversion, fees and clearing times. */
export function Note({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex gap-2 text-[12px] leading-relaxed text-ink-400",
        className,
      )}
    >
      <span aria-hidden className="mt-px select-none text-brand-500">
        ●
      </span>
      <span>{children}</span>
    </p>
  );
}
