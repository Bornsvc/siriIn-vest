import { cn } from "@/shared/lib/cn";
import { directionOf, formatPct, formatUsd } from "@/shared/lib/format";

/**
 * Direction is carried by a triangle as well as colour, so the figure still
 * reads correctly in greyscale and for colour-blind customers.
 */
export function Delta({
  value,
  amount,
  size = "md",
  className,
}: {
  /** Percentage change. */
  value: number;
  /** Optional absolute change shown alongside. */
  amount?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const direction = directionOf(value);
  const glyph = direction === "up" ? "▲" : direction === "down" ? "▼" : "—";

  return (
    <span
      data-numeric
      className={cn(
        "inline-flex items-baseline gap-1 font-medium",
        direction === "up" && "text-gain",
        direction === "down" && "text-loss",
        direction === "flat" && "text-ink-400",
        size === "sm" && "text-[12px]",
        size === "md" && "text-[13px]",
        size === "lg" && "text-[15px]",
        className,
      )}
    >
      <span aria-hidden className="text-[0.7em] leading-none">
        {glyph}
      </span>
      {formatPct(value, { sign: true })}
      {amount !== undefined ? (
        <span className="text-ink-400">({formatUsd(amount, { sign: true })})</span>
      ) : null}
    </span>
  );
}

/** Colour-only variant for figures that already sit next to a Delta. */
export function Money({
  value,
  signed,
  className,
}: {
  value: number;
  signed?: boolean;
  className?: string;
}) {
  const direction = directionOf(value);
  return (
    <span
      data-numeric
      className={cn(
        signed && direction === "up" && "text-gain",
        signed && direction === "down" && "text-loss",
        className,
      )}
    >
      {formatUsd(value, { sign: signed })}
    </span>
  );
}
