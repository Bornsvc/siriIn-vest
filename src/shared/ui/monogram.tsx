import { cn } from "@/shared/lib/cn";

const SIZES = {
  sm: "size-8 text-[11px] rounded-[8px]",
  md: "size-10 text-[13px] rounded-[10px]",
  lg: "size-14 text-[17px] rounded-[14px]",
};

/**
 * We draw a monogram tile rather than shipping third-party logo files —
 * it keeps the list visually even and avoids redistributing brand marks.
 */
export function Monogram({
  symbol,
  color,
  size = "md",
  className,
}: {
  symbol: string;
  color: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      style={{ backgroundColor: color }}
      className={cn(
        "grid shrink-0 place-items-center font-display font-semibold uppercase leading-none tracking-tight text-white",
        SIZES[size],
        className,
      )}
    >
      {symbol.slice(0, 2)}
    </span>
  );
}
