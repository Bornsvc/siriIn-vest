"use client";

import { useId, useState, type KeyboardEvent, type PointerEvent } from "react";
import { getRangeChange } from "@/mock/selectors";
import { toLinePath } from "@/mock/series";
import { directionOf, formatPct, formatUsd } from "@/shared/lib/format";
import { RANGES, type Range } from "@/shared/types";
import { Delta, Tabs, type TabItem } from "@/shared/ui";
import type { RangeSeries } from "../lib/analytics";

/**
 * The portfolio's own line. Drawn by hand in SVG — a chart library would be a
 * dependency and a bundle for one path.
 *
 * The crosshair is the interactive part: pointer or arrow keys move a cursor
 * along the series and the readout above reports the value at that point, so
 * the chart is legible without a mouse and, through the summary beneath, with
 * no sight of it at all.
 */

const VIEW_W = 1000;
const VIEW_H = 240;
const PAD = 12;
const INNER_H = VIEW_H - PAD * 2;

const RANGE_LABEL: Record<Range, string> = {
  "1D": "1 day",
  "1W": "1 week",
  "1M": "1 month",
  "3M": "3 months",
  "1Y": "1 year",
  "5Y": "5 years",
};

const RANGE_ITEMS: TabItem<Range>[] = RANGES.map((range) => ({
  value: range,
  label: range,
}));

export function PortfolioChart({ series }: { series: RangeSeries[] }) {
  const rawId = useId();
  const [range, setRange] = useState<Range>("1M");
  const [cursor, setCursor] = useState<number | null>(null);

  const active = series.find((item) => item.range === range) ?? series[0];
  if (!active || active.values.length < 2) return null;

  const gradientId = `portfolio-area-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const values = active.values;
  const lastIndex = values.length - 1;
  const index = cursor === null ? null : Math.min(cursor, lastIndex);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const yFraction = (value: number) =>
    (PAD + INNER_H - ((value - min) / span) * INNER_H) / VIEW_H;

  const linePath = toLinePath(values, VIEW_W, VIEW_H, PAD);
  const areaPath = `${linePath} L ${VIEW_W} ${VIEW_H} L 0 ${VIEW_H} Z`;
  const openY = yFraction(values[0]) * VIEW_H;

  const direction = directionOf(active.changePct);
  const tone =
    direction === "up"
      ? "var(--color-gain)"
      : direction === "down"
        ? "var(--color-loss)"
        : "var(--color-ink-300)";

  // The cursor's own reading: value at the point, and the move to it from the
  // start of the range. Both come off the series through the shared selector.
  const point = index === null ? values[lastIndex] : values[index];
  const move =
    index === null
      ? { change: active.change, changePct: active.changePct }
      : getRangeChange(values.slice(0, index + 1));

  const valueText = `Point ${(index ?? lastIndex) + 1} of ${values.length}, ${formatUsd(
    point,
  )}, ${formatPct(move.changePct, { sign: true })} from the start of the range`;

  const indexFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return 0;
    const ratio = (event.clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(lastIndex, Math.round(ratio * lastIndex)));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const from = index ?? lastIndex;
    const page = Math.max(1, Math.round(lastIndex / 10));
    let next: number;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = Math.min(lastIndex, from + 1);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = Math.max(0, from - 1);
        break;
      case "PageUp":
        next = Math.min(lastIndex, from + page);
        break;
      case "PageDown":
        next = Math.max(0, from - page);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = lastIndex;
        break;
      case "Escape":
        event.preventDefault();
        setCursor(null);
        return;
      default:
        return;
    }

    event.preventDefault();
    setCursor(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="min-h-[42px]">
          <p className="lao text-[11px] leading-none text-ink-400">
            {index === null ? "ມູນຄ່າປັດຈຸບັນ" : "ມູນຄ່າທີ່ຈຸດນີ້"}
          </p>
          <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span
              data-numeric
              className="font-display text-[19px] font-medium leading-none tracking-tight text-ink-950"
            >
              {formatUsd(point)}
            </span>
            <Delta value={move.changePct} amount={move.change} size="sm" />
          </p>
        </div>

        <div className="scrollbar-thin max-w-full overflow-x-auto">
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
      </div>

      <div
        role="slider"
        tabIndex={0}
        aria-label={`Portfolio value over ${RANGE_LABEL[range]}`}
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={lastIndex}
        aria-valuenow={index ?? lastIndex}
        aria-valuetext={valueText}
        onKeyDown={onKeyDown}
        onFocus={() => setCursor((current) => current ?? lastIndex)}
        onBlur={() => setCursor(null)}
        onPointerDown={(event) => setCursor(indexFromPointer(event))}
        onPointerMove={(event) => setCursor(indexFromPointer(event))}
        onPointerLeave={() => setCursor(null)}
        className="relative touch-pan-y select-none rounded-tile"
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          aria-hidden
          className="block h-[150px] w-full sm:h-[210px] lg:h-[240px]"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tone} stopOpacity="0.20" />
              <stop offset="100%" stopColor={tone} stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Where the range opened — the line above it is profit. */}
          <line
            x1="0"
            x2={VIEW_W}
            y1={openY}
            y2={openY}
            stroke="var(--color-line-strong)"
            strokeWidth="1"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />

          <path
            d={linePath}
            fill="none"
            stroke={tone}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Crosshair sits in HTML so the dot stays round under the stretched
            viewBox, and so it can never intercept the pointer. */}
        {index !== null ? (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <span
              className="absolute bottom-0 top-0 w-px bg-line-strong"
              style={{ left: `${(index / lastIndex) * 100}%` }}
            />
            <span
              className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface"
              style={{
                left: `${(index / lastIndex) * 100}%`,
                top: `${yFraction(point) * 100}%`,
                backgroundColor: tone,
              }}
            />
          </div>
        ) : null}
      </div>

      <p className="sr-only">
        {`Portfolio value over ${RANGE_LABEL[range]}: opened at ${formatUsd(
          values[0],
        )} and stands at ${formatUsd(values[lastIndex])}, ${
          direction === "up" ? "up" : direction === "down" ? "down" : "flat at"
        } ${formatPct(Math.abs(active.changePct))} across the range. High ${formatUsd(
          max,
        )}, low ${formatUsd(min)} over ${values.length} points. Focus the chart and use the arrow keys to read a point at a time.`}
      </p>
    </div>
  );
}
