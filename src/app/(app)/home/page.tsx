import type { Metadata } from "next";
import { getMovers, getStockSeries } from "@/mock/selectors";
import {
  ActivityCard,
  CashCard,
  Greeting,
  HoldingsPreview,
  MoversCard,
  PortfolioHero,
  WatchlistCard,
  type MoverGroups,
} from "@/features/dashboard";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  // Series are built on the server so the client bundle carries five short
  // arrays instead of the whole quote table.
  const groups: MoverGroups = {
    gainers: toItems("gainers"),
    losers: toItems("losers"),
    active: toItems("active"),
  };

  return (
    <>
      <Greeting />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <PortfolioHero />
          <MoversCard groups={groups} />
          <HoldingsPreview />
        </div>

        <aside className="min-w-0 space-y-5">
          <CashCard />
          <WatchlistCard />
          <ActivityCard />
        </aside>
      </div>
    </>
  );
}

function toItems(kind: "gainers" | "losers" | "active") {
  return getMovers(kind).map((stock) => ({
    stock,
    series: getStockSeries(stock, "1M"),
  }));
}
