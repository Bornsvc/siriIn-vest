import { useId } from "react";
import { toLinePath } from "@/mock/series";
import { cn } from "@/shared/lib/cn";

/**
 * Compact trend line for table rows and stat tiles. No axes, no labels —
 * it exists to show shape, and the number beside it carries the value.
 */
export function Sparkline({
  values,
  direction,
  width = 96,
  height = 32,
  filled = false,
  className,
}: {
  values: number[];
  direction: "up" | "down" | "flat";
  width?: number;
  height?: number;
  filled?: boolean;
  className?: string;
}) {
  const id = useId();
  if (values.length < 2) return null;

  const stroke =
    direction === "up"
      ? "var(--color-gain)"
      : direction === "down"
        ? "var(--color-loss)"
        : "var(--color-ink-300)";

  const path = toLinePath(values, width, height, 2);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("overflow-visible", className)}
      aria-hidden
      preserveAspectRatio="none"
    >
      {filled ? (
        <>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`${path} L ${width} ${height} L 0 ${height} Z`}
            fill={`url(#${id})`}
          />
        </>
      ) : null}
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
