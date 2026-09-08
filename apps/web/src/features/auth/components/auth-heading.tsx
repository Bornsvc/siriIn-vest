import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * `PageHeader` belongs to the app shell, so the signed-out screens carry
 * their own heading — same pattern, Lao eyebrow over an English title, sized
 * for a 400px form column.
 */
export function AuthHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-7", className)}>
      <p className="lao text-[13px] leading-none text-brand-600">{eyebrow}</p>
      <h1 className="mt-1.5 font-display text-[26px] font-medium leading-none tracking-[-0.02em] text-ink-950">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 text-[13px] leading-relaxed text-ink-400">
          {description}
        </p>
      ) : null}
    </header>
  );
}
