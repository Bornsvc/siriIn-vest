import type { Range } from "@/shared/types";

/**
 * Deterministic price series.
 *
 * Seeded from symbol + range so the server and the client always render the
 * identical path — a Math.random() series would hydrate as a mismatch and
 * flash a different chart on load.
 */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFrom(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const RANGE_SHAPE: Record<Range, { points: number; drift: number; vol: number }> =
  {
    "1D": { points: 78, drift: 0.6, vol: 0.35 },
    "1W": { points: 56, drift: 1.4, vol: 0.7 },
    "1M": { points: 60, drift: 3, vol: 1.4 },
    "3M": { points: 66, drift: 7, vol: 2.6 },
    "1Y": { points: 72, drift: 18, vol: 5 },
    "5Y": { points: 80, drift: 55, vol: 11 },
  };

/**
 * Walks backwards from the live price so the series always terminates at the
 * quote shown beside it, then reverses. `changePct` sets the slope: a stock
 * down on the day slopes down across every range's tail.
 */
export function getSeries(
  symbol: string,
  range: Range,
  price: number,
  changePct: number,
): number[] {
  const { points, drift, vol } = RANGE_SHAPE[range];
  const random = mulberry32(seedFrom(`${symbol}:${range}`));
  const direction = changePct >= 0 ? 1 : -1;

  // Total ground the series covers, as a fraction of price.
  const span = (price * drift) / 100;
  const step = span / points;

  const reversed: number[] = [price];
  let current = price;

  for (let i = 1; i < points; i++) {
    const noise = (random() - 0.5) * 2 * ((price * vol) / 100);
    // Mean-reverting pull keeps the walk from wandering off the axis.
    const pull = (price - current) * 0.04;
    current = current - direction * step + noise + pull;
    reversed.push(Math.max(current, price * 0.35));
  }

  return reversed.reverse().map((value) => Number(value.toFixed(2)));
}

/** Builds the `d` attribute for a smoothed line through a series. */
export function toLinePath(
  values: number[],
  width: number,
  height: number,
  padding = 0,
): string {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const innerH = height - padding * 2;

  const points = values.map((value, index) => {
    const x = (index / (values.length - 1 || 1)) * width;
    const y = padding + innerH - ((value - min) / span) * innerH;
    return [x, y] as const;
  });

  // Catmull-Rom style smoothing, expressed as cubic beziers.
  let d = `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[Math.max(0, i - 1)];
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const [x3, y3] = points[Math.min(points.length - 1, i + 2)];
    const c1x = x1 + (x2 - x0) / 6;
    const c1y = y1 + (y2 - y0) / 6;
    const c2x = x2 - (x3 - x1) / 6;
    const c2y = y2 - (y3 - y1) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }
  return d;
}
