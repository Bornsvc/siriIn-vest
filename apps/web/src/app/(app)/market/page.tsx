import type { Metadata } from "next";
import { MarketBrowser, type MarketItem } from "@/features/market";
import { PageHeader } from "@/features/shell";
import { getStockSeries } from "@/mock/selectors";
import { listStocks, WATCHLIST } from "@/mock/stocks";

export const metadata: Metadata = {
  title: "Market",
};

/**
 * Browse and search. The page resolves the quotes and their trend lines on the
 * server, then hands the finished rows to a client component that does nothing
 * but filter and sort them.
 */
export default async function MarketPage({
  searchParams,
}: PageProps<"/market">) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q) ?? "";

  const items: MarketItem[] = listStocks().map((stock) => ({
    stock,
    series: getStockSeries(stock, "1M"),
  }));

  return (
    <>
      <PageHeader
        eyebrow="ຕະຫຼາດ"
        title="Market"
        description="Search U.S. stocks and ETFs, then buy them in dollars from your kip balance."
      />

      {/* Keyed on the query so a fresh search from the top bar reseeds the
          input rather than leaving the previous term in place. */}
      <MarketBrowser
        key={query}
        items={items}
        watchlist={WATCHLIST}
        initialQuery={query}
      />
    </>
  );
}
