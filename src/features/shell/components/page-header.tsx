import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * Every page opens the same way: Lao eyebrow, English title, one line of
 * orientation, actions on the right. Consistency here is what makes the app
 * feel like one product rather than fourteen screens.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="lao text-[13px] leading-none text-brand-600">{eyebrow}</p>
        <h1 className="mt-1.5 font-display text-[26px] font-medium leading-none tracking-[-0.02em] text-ink-950">
          {title}
        </h1>
        {description ? (
          <p className="mt-2.5 max-w-xl text-[13px] leading-relaxed text-ink-400">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
