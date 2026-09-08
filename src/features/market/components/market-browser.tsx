"use client";

import { useMemo, useState } from "react";
import type { Sector, Stock } from "@/shared/types";
import { cn } from "@/shared/lib/cn";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  EmptyState,
  RowList,
  Select,
  StockRow,
  Tabs,
  inputStyles,
  type TabItem,
} from "@/shared/ui";
import { IconSearch } from "@/shared/ui/icons";

/**
 * The browse surface for the whole market: search, asset class, sector and
 * sort, all resolved on the client so the list reacts as fast as the customer
 * types. The page hands it the quotes and their trend lines already built —
 * nothing here computes a figure of its own.
 */

export type MarketItem = {
  stock: Stock;
  /** 1M trend, built on the server so the row never recalculates it. */
  series: number[];
};

type Group = "stocks" | "etfs" | "watchlist";
type SectorFilter = "All" | Sector;
type SortKey = "change" | "price" | "cap";

const GROUPS: Group[] = ["stocks", "etfs", "watchlist"];

const GROUP_COPY: Record<Group, { eyebrow: string; title: string }> = {
  stocks: { eyebrow: "ຮຸ້ນ", title: "Stocks" },
  etfs: { eyebrow: "ກອງທຶນ ETF", title: "ETFs" },
  watchlist: { eyebrow: "ລາຍການຕິດຕາມ", title: "Watchlist" },
};

const SECTORS: SectorFilter[] = [
  "All",
  "Technology",
  "Finance",
  "Health",
  "Consumer",
  "Energy",
];

function inGroup(stock: Stock, group: Group, watched: Set<string>): boolean {
  if (group === "watchlist") return watched.has(stock.symbol);
  return stock.kind === (group === "etfs" ? "etf" : "stock");
}

export function MarketBrowser({
  items,
  watchlist,
  initialQuery = "",
}: {
  items: MarketItem[];
  /** Symbols the customer follows — the third tab. */
  watchlist: string[];
  /** Seeded from `?q=`, which is where the top bar's search lands. */
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [group, setGroup] = useState<Group>("stocks");
  const [sector, setSector] = useState<SectorFilter>("All");
  const [sort, setSort] = useState<SortKey>("change");

  const watched = useMemo(() => new Set(watchlist), [watchlist]);

  // Query and sector narrow the whole market first, so the tab counts can say
  // where the matches are rather than only counting the tab already open.
  const matched = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(({ stock }) => {
      if (sector !== "All" && stock.sector !== sector) return false;
      if (!q) return true;
      return (
        stock.symbol.toLowerCase().includes(q) ||
        stock.name.toLowerCase().includes(q)
      );
    });
  }, [items, query, sector]);

  const results = useMemo(() => {
    const rows = matched.filter((item) => inGroup(item.stock, group, watched));
    return rows.sort((a, b) => {
      if (sort === "price") return b.stock.price - a.stock.price;
      if (sort === "cap") return b.stock.marketCap - a.stock.marketCap;
      return b.stock.changePct - a.stock.changePct;
    });
  }, [matched, group, sort, watched]);

  const tabs: TabItem<Group>[] = GROUPS.map((value) => ({
    value,
    label: GROUP_COPY[value].title,
    count: matched.filter((item) => inGroup(item.stock, value, watched)).length,
  }));

  const trimmed = query.trim();
  const filtered = trimmed !== "" || sector !== "All";

  const clearFilters = () => {
    setQuery("");
    setSector("All");
    setGroup("stocks");
  };

  return (
    <div className="space-y-4">
      {/* Search and sort — the two controls that outlast every other choice. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-300" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by symbol or company, e.g. AAPL"
            aria-label="Search stocks and ETFs"
            className={cn(inputStyles, "h-11 pl-10")}
          />
        </div>

        <Select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortKey)}
          aria-label="Sort results"
          className="sm:w-[190px]"
        >
          <option value="change">Sort: change %</option>
          <option value="price">Sort: price</option>
          <option value="cap">Sort: market cap</option>
        </Select>
      </div>

      {/* Asset class, then sector. */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 overflow-x-auto px-1 scrollbar-thin">
          <Tabs items={tabs} value={group} onChange={setGroup} />
        </div>

        <div
          role="group"
          aria-label="Filter by sector"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 py-0.5 scrollbar-thin"
        >
          {SECTORS.map((item) => (
            <Chip
              key={item}
              active={sector === item}
              aria-pressed={sector === item}
              onClick={() => setSector(item)}
            >
              {item === "All" ? "All sectors" : item}
            </Chip>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader
          eyebrow={GROUP_COPY[group].eyebrow}
          title={GROUP_COPY[group].title}
          action={
            <span data-numeric className="text-[12px] text-ink-400">
              {results.length} {results.length === 1 ? "result" : "results"}
            </span>
          }
        />

        {results.length > 0 ? (
          <RowList>
            {results.map(({ stock, series }) => (
              <StockRow key={stock.symbol} stock={stock} series={series} />
            ))}
          </RowList>
        ) : (
          <EmptyState
            title="Nothing matches those filters"
            body={
              trimmed
                ? `No ${GROUP_COPY[group].title.toLowerCase()} match “${trimmed}”. Try another symbol, or clear the filters to see everything we list.`
                : `No ${GROUP_COPY[group].title.toLowerCase()} in ${sector}. Clear the filters to see everything we list.`
            }
            action={
              <Button variant="secondary" onClick={clearFilters}>
                {filtered ? "Clear filters" : "Reset to stocks"}
              </Button>
            }
          />
        )}
      </Card>
    </div>
  );
}
