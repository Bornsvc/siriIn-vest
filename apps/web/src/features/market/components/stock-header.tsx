import Link from "next/link";
import type { Stock } from "@/shared/types";
import { Badge, Monogram } from "@/shared/ui";
import { IconArrowLeft } from "@/shared/ui/icons";
import { WatchlistToggle } from "./watchlist-toggle";

/**
 * The detail page opens on identity rather than price: which company this is,
 * what kind of instrument, which sector — then the quote below it. Matches
 * `PageHeader`'s type scale so the two pages feel like one product.
 */
export function StockHeader({
  stock,
  watching,
}: {
  stock: Stock;
  watching: boolean;
}) {
  return (
    <header className="mb-6">
      <Link
        href="/market"
        className="inline-flex items-center gap-1.5 text-[12px] text-ink-400 transition-colors hover:text-brand-700"
      >
        <IconArrowLeft className="size-3.5" />
        Market
      </Link>

      <div className="mt-3 flex items-start gap-4">
        <Monogram symbol={stock.symbol} color={stock.brandColor} size="lg" />

        <div className="min-w-0 flex-1">
          <p className="lao text-[13px] leading-none text-brand-600">
            ລາຍລະອຽດຫຼັກຊັບ
          </p>
          <h1 className="mt-1.5 font-display text-[26px] font-medium leading-none tracking-[-0.02em] text-ink-950">
            {stock.symbol}
          </h1>
          <p className="mt-1.5 truncate text-[13px] text-ink-400">
            {stock.name}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <Badge tone="brand">
              {stock.kind === "etf" ? "ETF" : "Stock"}
            </Badge>
            <Badge>{stock.sector}</Badge>
          </div>
        </div>

        <WatchlistToggle symbol={stock.symbol} initial={watching} />
      </div>
    </header>
  );
}
