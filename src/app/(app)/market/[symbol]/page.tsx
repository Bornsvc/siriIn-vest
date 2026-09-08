import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  AboutStock,
  KeyStatistics,
  PositionCard,
  RecentOrders,
  StockChart,
  StockHeader,
  type RangeChange,
} from "@/features/market";
import { TradeActions } from "@/features/trade";
import { WALLET } from "@/mock/account";
import {
  getOrdersFor,
  getPositionFor,
  getRangeChange,
  getStockSeries,
} from "@/mock/selectors";
import { getStock, listStocks, WATCHLIST } from "@/mock/stocks";
import { RANGES, type Range } from "@/shared/types";

/** Every symbol we list is known ahead of time, so prerender all of them. */
export function generateStaticParams() {
  return listStocks().map((stock) => ({ symbol: stock.symbol }));
}

export async function generateMetadata({
  params,
}: PageProps<"/market/[symbol]">): Promise<Metadata> {
  const { symbol } = await params;
  const stock = getStock(symbol);
  return {
    title: stock ? `${stock.symbol} · ${stock.name}` : "Symbol not found",
  };
}

/**
 * The stock detail page. Everything numeric is resolved here — quotes, the six
 * range series and their changes, the position and the order history — so the
 * interactive pieces below only render what they are given.
 */
export default async function StockDetailPage({
  params,
}: PageProps<"/market/[symbol]">) {
  const { symbol } = await params;
  const stock = getStock(symbol);
  if (!stock) notFound();

  const series = {} as Record<Range, number[]>;
  const changes = {} as Record<Range, RangeChange>;
  for (const range of RANGES) {
    const values = getStockSeries(stock, range);
    series[range] = values;
    changes[range] = getRangeChange(values);
  }

  const position = getPositionFor(stock.symbol);
  const orders = getOrdersFor(stock.symbol);

  return (
    <>
      <StockHeader stock={stock} watching={WATCHLIST.includes(stock.symbol)} />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_336px]">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <StockChart
            symbol={stock.symbol}
            price={stock.price}
            change={stock.change}
            changePct={stock.changePct}
            series={series}
            changes={changes}
          />
        </div>

        <div className="space-y-5 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <KeyStatistics stock={stock} />
          {position ? <PositionCard position={position} /> : null}
        </div>

        <div className="min-w-0 space-y-5 lg:col-start-1 lg:row-start-2">
          <AboutStock stock={stock} />
          <RecentOrders symbol={stock.symbol} orders={orders} />
        </div>
      </div>

      {/* Room for the pinned action bar, which sits outside the flow. */}
      <div aria-hidden className="h-20" />

      <TradeActions
        stock={stock}
        heldShares={position?.shares ?? 0}
        availableUsd={WALLET.availableUsd}
      />
    </>
  );
}
