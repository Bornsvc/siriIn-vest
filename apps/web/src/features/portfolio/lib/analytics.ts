import {
  getPortfolioSeries,
  getRangeChange,
  type PortfolioSummary,
} from "@/mock/selectors";
import { formatDate } from "@/shared/lib/format";
import { RANGES, type Order, type Position, type Range, type Sector } from "@/shared/types";

/**
 * Shapes the Portfolio screen reads.
 *
 * Nothing here invents a money figure: every value is either taken straight
 * off `@/mock/selectors` (`value`, `gain`, `weight`, the summary totals) or is
 * a grouping of those. Components then render — they never do arithmetic.
 */

/* ------------------------------------------------------------------ chart */

export type RangeSeries = {
  range: Range;
  values: number[];
  /** Change across this range, read off the ends of its own series. */
  change: number;
  changePct: number;
};

/** One series per range, so the chart can switch without a round trip. */
export function buildRangeSeries(): RangeSeries[] {
  return RANGES.map((range) => {
    const values = getPortfolioSeries(range);
    const { change, changePct } = getRangeChange(values);
    return { range, values, change, changePct };
  });
}

/* ------------------------------------------------------- value breakdown */

export type ValueSplit = {
  /** Share of total value held in stocks, 0–1. */
  investedShare: number;
  /** Share of total value sitting as settled cash, 0–1. */
  cashShare: number;
};

export function buildValueSplit(summary: PortfolioSummary): ValueSplit {
  const total = summary.totalValue;
  if (total === 0) return { investedShare: 0, cashShare: 0 };
  return {
    investedShare: summary.investedValue / total,
    cashShare: summary.cash / total,
  };
}

/* ------------------------------------------------------------ allocation */

export type AllocationSlice = {
  key: string;
  label: string;
  /** Lao or English second line — company name, or the Lao sector name. */
  sublabel: string;
  /** A brand hex for positions, a brand token for sectors. */
  color: string;
  value: number;
  /** Share of invested value, 0–1. */
  share: number;
};

const SECTOR_LO: Record<Sector, string> = {
  Technology: "ເຕັກໂນໂລຊີ",
  Finance: "ການເງິນ",
  Health: "ສຸຂະພາບ",
  Consumer: "ສິນຄ້າຜູ້ບໍລິໂພກ",
  Energy: "ພະລັງງານ",
};

/** Sectors have no brand mark of their own, so they take the brand ramp. */
const SECTOR_COLOR: Record<Sector, string> = {
  Technology: "var(--color-brand-700)",
  Finance: "var(--color-brand-500)",
  Consumer: "var(--color-brand-300)",
  Health: "var(--color-brand-900)",
  Energy: "var(--color-brand-200)",
};

export function buildPositionAllocation(positions: Position[]): AllocationSlice[] {
  return positions.map((position) => ({
    key: position.symbol,
    label: position.symbol,
    sublabel: position.stock.name,
    color: position.stock.brandColor,
    value: position.value,
    share: position.weight,
  }));
}

export function buildSectorAllocation(positions: Position[]): AllocationSlice[] {
  const totals = new Map<Sector, { value: number; share: number }>();

  for (const position of positions) {
    const sector = position.stock.sector;
    const running = totals.get(sector) ?? { value: 0, share: 0 };
    totals.set(sector, {
      value: running.value + position.value,
      share: running.share + position.weight,
    });
  }

  return [...totals.entries()]
    .map(([sector, totalsForSector]) => ({
      key: sector,
      label: sector,
      sublabel: SECTOR_LO[sector],
      color: SECTOR_COLOR[sector],
      value: totalsForSector.value,
      share: totalsForSector.share,
    }))
    .sort((a, b) => b.value - a.value);
}

/* ---------------------------------------------------------- contribution */

export type Contribution = {
  symbol: string;
  name: string;
  color: string;
  gain: number;
  gainPct: number;
  /** Share of the portfolio's total return, 0–1. Negative when it dragged. */
  shareOfGain: number;
};

export function buildContributions(
  positions: Position[],
  totalGain: number,
): Contribution[] {
  return positions
    .map((position) => ({
      symbol: position.symbol,
      name: position.stock.name,
      color: position.stock.brandColor,
      gain: position.gain,
      gainPct: position.gainPct,
      shareOfGain: totalGain === 0 ? 0 : position.gain / totalGain,
    }))
    .sort((a, b) => b.gain - a.gain);
}

export type PerformanceData = {
  byPosition: AllocationSlice[];
  bySector: AllocationSlice[];
  contributions: Contribution[];
  best?: Position;
  worst?: Position;
  totalGain: number;
  investedValue: number;
};

export function buildPerformance(summary: PortfolioSummary): PerformanceData {
  const byReturn = [...summary.positions].sort((a, b) => b.gainPct - a.gainPct);

  return {
    byPosition: buildPositionAllocation(summary.positions),
    bySector: buildSectorAllocation(summary.positions),
    contributions: buildContributions(summary.positions, summary.totalGain),
    best: byReturn[0],
    worst: byReturn.length > 1 ? byReturn[byReturn.length - 1] : undefined,
    totalGain: summary.totalGain,
    investedValue: summary.investedValue,
  };
}

/* --------------------------------------------------------------- history */

const MONTH_LO = [
  "ມັງກອນ",
  "ກຸມພາ",
  "ມີນາ",
  "ເມສາ",
  "ພຶດສະພາ",
  "ມິຖຸນາ",
  "ກໍລະກົດ",
  "ສິງຫາ",
  "ກັນຍາ",
  "ຕຸລາ",
  "ພະຈິກ",
  "ທັນວາ",
];

const MONTH_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type OrderRow = Order & {
  /** Cash the order moves: fees load a buy and come out of a sell. */
  total: number;
  /** "2026-09" — grouping key, taken from the Vientiane-local timestamp. */
  monthKey: string;
  monthLo: string;
  monthEn: string;
  dateLabel: string;
};

/**
 * An order's cash total is order-local arithmetic — `@/mock/selectors` owns
 * portfolio totals, and nothing here feeds one.
 */
function orderTotal(order: Order): number {
  const gross = order.shares * order.price;
  return order.side === "buy" ? gross + order.fees : gross - order.fees;
}

/**
 * Labels are built on the server and handed down as strings: the timestamps
 * carry a +07:00 offset, so reading them in the browser's zone could group an
 * evening order into the wrong month and hydrate as a mismatch.
 */
export function toOrderRows(orders: Order[]): OrderRow[] {
  return orders.map((order) => {
    const monthKey = order.placedAt.slice(0, 7);
    const [year, month] = monthKey.split("-");
    const index = Number(month) - 1;

    return {
      ...order,
      total: orderTotal(order),
      monthKey,
      monthLo: `${MONTH_LO[index]} ${year}`,
      monthEn: `${MONTH_EN[index]} ${year}`,
      dateLabel: formatDate(order.placedAt),
    };
  });
}

export type OrderMonth = {
  key: string;
  lo: string;
  en: string;
  rows: OrderRow[];
};

/** Groups an already date-sorted list into months, keeping the given order. */
export function groupByMonth(rows: OrderRow[]): OrderMonth[] {
  const groups: OrderMonth[] = [];

  for (const row of rows) {
    const current = groups[groups.length - 1];
    if (current && current.key === row.monthKey) {
      current.rows.push(row);
    } else {
      groups.push({
        key: row.monthKey,
        lo: row.monthLo,
        en: row.monthEn,
        rows: [row],
      });
    }
  }

  return groups;
}
