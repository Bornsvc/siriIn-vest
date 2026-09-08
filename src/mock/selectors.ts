import type { Position, Range, Stock } from "@/shared/types";
import { HOLDINGS, ORDERS, WALLET } from "./account";
import { getSeries } from "./series";
import { getStock, STOCKS } from "./stocks";

/**
 * Every derived portfolio number funnels through here. Screens read positions
 * and totals rather than doing their own arithmetic, so the dashboard, the
 * portfolio page and the order ticket can never disagree.
 */

export function getPositions(): Position[] {
  const priced = HOLDINGS.flatMap((holding) => {
    const stock = getStock(holding.symbol);
    if (!stock) return [];
    const value = holding.shares * stock.price;
    const cost = holding.shares * holding.avgCost;
    return [{ holding, stock, value, cost }];
  });

  const investedValue = priced.reduce((sum, item) => sum + item.value, 0);

  return priced
    .map(({ holding, stock, value, cost }) => ({
      ...holding,
      stock,
      value,
      cost,
      gain: value - cost,
      gainPct: cost === 0 ? 0 : ((value - cost) / cost) * 100,
      weight: investedValue === 0 ? 0 : value / investedValue,
    }))
    .sort((a, b) => b.value - a.value);
}

export type PortfolioSummary = {
  positions: Position[];
  /** Market value of holdings only. */
  investedValue: number;
  cash: number;
  /** Holdings plus settled cash — the headline figure. */
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPct: number;
  dayGain: number;
  dayGainPct: number;
};

export function getPortfolioSummary(): PortfolioSummary {
  const positions = getPositions();
  const investedValue = positions.reduce((sum, p) => sum + p.value, 0);
  const totalCost = positions.reduce((sum, p) => sum + p.cost, 0);
  const cash = WALLET.availableUsd;
  const totalValue = investedValue + cash;
  const totalGain = investedValue - totalCost;

  // Session move, weighted by position size.
  const dayGain = positions.reduce(
    (sum, p) => sum + p.shares * p.stock.change,
    0,
  );
  const previousValue = investedValue - dayGain;

  return {
    positions,
    investedValue,
    cash,
    totalValue,
    totalCost,
    totalGain,
    totalGainPct: totalCost === 0 ? 0 : (totalGain / totalCost) * 100,
    dayGain,
    dayGainPct: previousValue === 0 ? 0 : (dayGain / previousValue) * 100,
  };
}

/** Portfolio value over time, built from the constituent series. */
export function getPortfolioSeries(range: Range): number[] {
  const positions = getPositions();
  if (positions.length === 0) return [];

  const legs = positions.map((position) =>
    getSeries(
      position.symbol,
      range,
      position.stock.price,
      position.stock.changePct,
    ).map((price) => price * position.shares),
  );

  const length = Math.min(...legs.map((leg) => leg.length));
  return Array.from({ length }, (_, index) =>
    legs.reduce((sum, leg) => sum + leg[index], WALLET.availableUsd),
  );
}

export function getStockSeries(stock: Stock, range: Range): number[] {
  return getSeries(stock.symbol, range, stock.price, stock.changePct);
}

/** Change across a range, read off the ends of its own series. */
export function getRangeChange(
  values: number[],
): { change: number; changePct: number } {
  if (values.length < 2) return { change: 0, changePct: 0 };
  const first = values[0];
  const last = values[values.length - 1];
  return {
    change: last - first,
    changePct: first === 0 ? 0 : ((last - first) / first) * 100,
  };
}

export function getOrdersFor(symbol?: string) {
  const sorted = [...ORDERS].sort(
    (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
  );
  return symbol
    ? sorted.filter((order) => order.symbol === symbol.toUpperCase())
    : sorted;
}

export function getPositionFor(symbol: string): Position | undefined {
  return getPositions().find(
    (position) => position.symbol === symbol.toUpperCase(),
  );
}

/** Movers, derived rather than hand-listed so they follow the quotes. */
export function getMovers(kind: "gainers" | "losers" | "active"): Stock[] {
  const stocks = [...STOCKS];
  if (kind === "gainers") {
    return stocks.sort((a, b) => b.changePct - a.changePct).slice(0, 5);
  }
  if (kind === "losers") {
    return stocks.sort((a, b) => a.changePct - b.changePct).slice(0, 5);
  }
  return stocks.sort((a, b) => b.volume - a.volume).slice(0, 5);
}
