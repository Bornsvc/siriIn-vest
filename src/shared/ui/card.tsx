import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export function Card({
  className,
  children,
  ...props
}: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "rounded-card border border-line bg-surface shadow-card",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

/**
 * Section heading used across every page. `eyebrow` carries the Lao label and
 * `title` the English one — the product is read in both at once.
 */
export function CardHeader({
  title,
  eyebrow,
  action,
  className,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex items-end justify-between gap-4 border-b border-line px-5 py-4",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="lao mb-0.5 text-[12px] leading-none text-brand-600">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-[15px] font-medium tracking-tight text-ink-950">
          {title}
        </h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function CardBody({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}
