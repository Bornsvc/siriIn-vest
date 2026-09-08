import Link from "next/link";
import type { ReactNode } from "react";
import type { Stock } from "@/shared/types";
import { cn } from "@/shared/lib/cn";
import { directionOf, formatUsd } from "@/shared/lib/format";
import { Delta } from "./delta";
import { Monogram } from "./monogram";
import { Sparkline } from "./sparkline";

/**
 * The repeating unit of the whole product — used by Home, Market, the
 * watchlist and search. Owning it here keeps every list identical.
 */
export function StockRow({
  stock,
  series,
  trailing,
  subtitle,
  dense,
  className,
}: {
  stock: Stock;
  /** Optional trend line, hidden on narrow screens. */
  series?: number[];
  /** Replaces the default price + delta block. */
  trailing?: ReactNode;
  /** Replaces the company name, e.g. "12 shares · avg $159.46". */
  subtitle?: ReactNode;
  dense?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/market/${stock.symbol}`}
      className={cn(
        "group flex items-center gap-3 px-5 transition-colors hover:bg-brand-50/60",
        dense ? "py-2.5" : "py-3",
        className,
      )}
    >
      <Monogram
        symbol={stock.symbol}
        color={stock.brandColor}
        size={dense ? "sm" : "md"}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[14px] font-medium leading-tight tracking-tight text-ink-950">
          {stock.symbol}
        </p>
        <p className="truncate text-[12px] leading-tight text-ink-400">
          {subtitle ?? stock.name}
        </p>
      </div>

      {series ? (
        <Sparkline
          values={series}
          direction={directionOf(stock.changePct)}
          width={72}
          height={28}
          className="hidden shrink-0 sm:block"
        />
      ) : null}

      {trailing ?? (
        <div className="shrink-0 text-right">
          <p
            data-numeric
            className="font-display text-[14px] font-medium leading-tight tracking-tight text-ink-950"
          >
            {formatUsd(stock.price)}
          </p>
          <Delta value={stock.changePct} size="sm" className="leading-tight" />
        </div>
      )}
    </Link>
  );
}

/** Divided list container that pairs with StockRow. */
export function RowList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("divide-y divide-line", className)}>{children}</div>
  );
}
