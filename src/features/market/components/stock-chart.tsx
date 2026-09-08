"use client";

import { useId, useMemo, useState, type KeyboardEvent, type PointerEvent } from "react";
import { toLinePath } from "@/mock/series";
import { RANGES, type Range } from "@/shared/types";
import { directionOf, formatPct, formatUsd } from "@/shared/lib/format";
import { Card, Delta, Tabs, type TabItem } from "@/shared/ui";

/**
 * The price chart.
 *
 * Drawn by hand rather than pulled from a charting library: the product needs
 * one line, one fill and one crosshair, and a dependency would cost more than
 * it saves. The SVG itself is decorative — the readable version of the chart
 * is the summary sentence and the keyboard cursor underneath it.
 */

/** Drawing space. `preserveAspectRatio="none"` stretches x to the container. */
const W = 720;
const H = 240;
const PAD = 12;

const RANGE_ITEMS: TabItem<Range>[] = RANGES.map((value) => ({
  value,
  label: value,
}));

const RANGE_WORD: Record<Range, string> = {
  "1D": "the last day",
  "1W": "the last week",
  "1M": "the last month",
  "3M": "the last three months",
  "1Y": "the last year",
  "5Y": "the last five years",
};

export type RangeChange = { change: number; changePct: number };

export function StockChart({
  symbol,
  price,
  change,
  changePct,
  series,
  changes,
  initialRange = "1M",
}: {
  symbol: string;
  price: number;
  /** Session change in dollars. */
  change: number;
  /** Session change as a percentage. */
  changePct: number;
  series: Record<Range, number[]>;
  /** Each range's own change, so the chart never derives its own figures. */
  changes: Record<Range, RangeChange>;
  initialRange?: Range;
}) {
  const rawId = useId();
  const gradientId = `chart-fill-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  const [range, setRange] = useState<Range>(initialRange);
  const [cursor, setCursor] = useState<number | null>(null);

  const values = series[range];
  const rangeChange = changes[range];
  const direction = directionOf(rangeChange.changePct);

  const stroke =
    direction === "up"
      ? "var(--color-gain)"
      : direction === "down"
        ? "var(--color-loss)"
        : "var(--color-ink-300)";

  const geometry = useMemo(() => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const innerH = H - PAD * 2;
    const line = toLinePath(values, W, H, PAD);
    return {
      min,
      max,
      /** y as a percentage of the plot box, so the height can stay responsive. */
      yPct: (value: number) =>
        ((PAD + innerH - ((value - min) / span) * innerH) / H) * 100,
      line,
      area: `${line} L ${W} ${H} L 0 ${H} Z`,
    };
  }, [values]);

  const last = values.length - 1;
  const activeIndex = cursor ?? last;
  const activeValue = values[activeIndex];
  const open = values[0];
  const fromOpen = open === 0 ? 0 : ((activeValue - open) / open) * 100;

  const moveTo = (index: number) =>
    setCursor(Math.min(last, Math.max(0, index)));

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = (event.clientX - rect.left) / rect.width;
    moveTo(Math.round(Math.min(1, Math.max(0, ratio)) * last));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = Math.max(1, Math.round(values.length / 20));
    switch (event.key) {
      case "ArrowRight":
        moveTo(activeIndex + 1);
        break;
      case "ArrowLeft":
        moveTo(activeIndex - 1);
        break;
      case "PageUp":
        moveTo(activeIndex + step);
        break;
      case "PageDown":
        moveTo(activeIndex - step);
        break;
      case "Home":
        moveTo(0);
        break;
      case "End":
        moveTo(last);
        break;
      case "Escape":
        setCursor(null);
        return;
      default:
        return;
    }
    event.preventDefault();
  };

  const xPct = (activeIndex / (last || 1)) * 100;
  // Keep the readout chip inside the plot at both ends, including at 375px.
  const chipPct = Math.min(84, Math.max(16, xPct));

  const summary = `${symbol} over ${RANGE_WORD[range]}: ${
    direction === "up" ? "up" : direction === "down" ? "down" : "unchanged at"
  } ${formatPct(rangeChange.changePct)}, ${formatUsd(rangeChange.change, {
    sign: true,
  })}, from ${formatUsd(open)} to ${formatUsd(values[last])}. Range high ${formatUsd(
    geometry.max,
  )}, low ${formatUsd(geometry.min)}.`;

  return (
    <Card>
      {/* Headline quote — the session move, which never depends on the range. */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-5 pt-5">
        <div className="min-w-0">
          <p className="lao text-[12px] leading-none text-brand-600">
            ລາຄາປັດຈຸບັນ
          </p>
          <p
            data-numeric
            className="mt-1.5 font-display text-[32px] font-medium leading-none tracking-[-0.02em] text-ink-950 sm:text-[38px]"
          >
            {formatUsd(price)}
          </p>
          <p className="mt-2 flex flex-wrap items-baseline gap-2">
            <Delta value={changePct} amount={change} size="lg" />
            <span className="text-[12px] text-ink-400">Today</span>
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-[11px] uppercase tracking-[0.06em] text-ink-300">
            <span data-numeric>{range}</span> change
          </p>
          <div className="mt-1">
            <Delta value={rangeChange.changePct} amount={rangeChange.change} />
          </div>
        </div>
      </div>

      {/* Plot. The drawing is hidden from assistive tech; the sentence below
          and the keyboard cursor carry the same information in text. */}
      <div className="relative mt-4 h-48 sm:h-60 lg:h-68">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="size-full"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.16" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={geometry.area} fill={`url(#${gradientId})`} />
          <path
            d={geometry.line}
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Where the range opened — the line every gain or loss is measured from. */}
        <div
          aria-hidden
          style={{ top: `${geometry.yPct(open)}%` }}
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-line-strong"
        />

        {cursor !== null ? (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div
              style={{ left: `${xPct}%` }}
              className="absolute inset-y-0 w-px -translate-x-1/2 bg-ink-200"
            />
            <div
              style={{
                left: `${xPct}%`,
                top: `${geometry.yPct(activeValue)}%`,
                backgroundColor: stroke,
              }}
              className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface"
            />
            <div
              style={{ left: `${chipPct}%` }}
              className="absolute top-2 -translate-x-1/2 whitespace-nowrap rounded-[10px] border border-line bg-surface px-2.5 py-1.5 text-center shadow-card"
            >
              <span
                data-numeric
                className="block font-display text-[14px] font-medium leading-none tracking-tight text-ink-950"
              >
                {formatUsd(activeValue)}
              </span>
              <span className="mt-1 block leading-none">
                <Delta value={fromOpen} size="sm" />
              </span>
            </div>
          </div>
        ) : null}

        {/* The interactive layer. Pointer and keyboard drive the same cursor. */}
        <div
          role="slider"
          tabIndex={0}
          aria-label={`${symbol} price over ${RANGE_WORD[range]}`}
          aria-valuemin={0}
          aria-valuemax={last}
          aria-valuenow={activeIndex}
          aria-valuetext={`${formatUsd(activeValue)}, ${formatPct(fromOpen, {
            sign: true,
          })} from the start of the range`}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setCursor(null)}
          onPointerDown={onPointerMove}
          onKeyDown={onKeyDown}
          onBlur={() => setCursor(null)}
          className="absolute inset-0 cursor-crosshair touch-pan-y"
        />
      </div>

      <p className="sr-only">
        {summary} Use the arrow keys to read individual points.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
        <div className="-mx-1 min-w-0 overflow-x-auto px-1 scrollbar-thin">
          <Tabs
            items={RANGE_ITEMS}
            value={range}
            size="sm"
            onChange={(next) => {
              setRange(next);
              setCursor(null);
            }}
          />
        </div>

        <p className="hidden shrink-0 text-[12px] text-ink-400 sm:block">
          High{" "}
          <span data-numeric className="text-ink-700">
            {formatUsd(geometry.max)}
          </span>
          <span aria-hidden className="mx-1.5 text-ink-200">
            ·
          </span>
          Low{" "}
          <span data-numeric className="text-ink-700">
            {formatUsd(geometry.min)}
          </span>
        </p>
      </div>
    </Card>
  );
}
