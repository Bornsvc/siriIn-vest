"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import type { Position } from "@/shared/types";
import { cn } from "@/shared/lib/cn";
import { formatPct, formatShares, formatUsd } from "@/shared/lib/format";
import {
  Card,
  CardHeader,
  Delta,
  Money,
  Monogram,
  RowList,
  Select,
  StockRow,
} from "@/shared/ui";

/**
 * Desktop gets the table it has room for; below md the same positions
 * collapse into the product's standard StockRow with the position value as
 * the trailing block. One sort state drives both.
 */

type SortKey =
  | "symbol"
  | "shares"
  | "avgCost"
  | "price"
  | "value"
  | "gainPct"
  | "weight";

type SortDirection = "asc" | "desc";

type Column = {
  key: SortKey;
  label: string;
  align: "left" | "right";
  /** Numbers read high-to-low first; a ticker reads A–Z first. */
  initial: SortDirection;
  className?: string;
};

const COLUMNS: Column[] = [
  { key: "symbol", label: "Asset", align: "left", initial: "asc" },
  { key: "shares", label: "Shares", align: "right", initial: "desc" },
  { key: "avgCost", label: "Avg cost", align: "right", initial: "desc" },
  { key: "price", label: "Price", align: "right", initial: "desc" },
  { key: "value", label: "Market value", align: "right", initial: "desc" },
  { key: "gainPct", label: "Total return", align: "right", initial: "desc" },
  { key: "weight", label: "Allocation", align: "left", initial: "desc" },
];

function sortValue(position: Position, key: SortKey): number | string {
  switch (key) {
    case "symbol":
      return position.symbol;
    case "shares":
      return position.shares;
    case "avgCost":
      return position.avgCost;
    case "price":
      return position.stock.price;
    case "value":
      return position.value;
    case "gainPct":
      return position.gainPct;
    case "weight":
      return position.weight;
  }
}

export function HoldingsPanel({ positions }: { positions: Position[] }) {
  const sortId = useId();
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: "value",
    direction: "desc",
  });

  const sorted = useMemo(() => {
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...positions].sort((a, b) => {
      const left = sortValue(a, sort.key);
      const right = sortValue(b, sort.key);
      if (typeof left === "string" || typeof right === "string") {
        return String(left).localeCompare(String(right)) * factor;
      }
      return (left - right) * factor;
    });
  }, [positions, sort]);

  const toggle = (column: Column) => {
    setSort((current) =>
      current.key === column.key
        ? {
            key: column.key,
            direction: current.direction === "asc" ? "desc" : "asc",
          }
        : { key: column.key, direction: column.initial },
    );
  };

  const ariaSort = (key: SortKey) =>
    sort.key === key
      ? sort.direction === "asc"
        ? ("ascending" as const)
        : ("descending" as const)
      : ("none" as const);

  return (
    <Card>
      <CardHeader
        eyebrow="ຫຼັກຊັບທີ່ຖືຢູ່"
        title="Holdings"
        action={
          <p className="hidden text-[12px] text-ink-400 md:block">
            Sort by any column
          </p>
        }
      />

      {/* Below md the column headers are gone, so sorting gets its own control. */}
      <div className="flex items-center gap-2 border-b border-line px-5 py-3 md:hidden">
        <label
          htmlFor={sortId}
          className="shrink-0 text-[12px] font-medium text-ink-500"
        >
          Sort by
        </label>
        <Select
          id={sortId}
          className="min-w-0 flex-1"
          value={sort.key}
          onChange={(event) => {
            const key = event.target.value as SortKey;
            const column = COLUMNS.find((item) => item.key === key);
            setSort({ key, direction: column?.initial ?? "desc" });
          }}
        >
          {COLUMNS.map((column) => (
            <option key={column.key} value={column.key}>
              {column.label}
            </option>
          ))}
        </Select>
        <button
          type="button"
          onClick={() =>
            setSort((current) => ({
              key: current.key,
              direction: current.direction === "asc" ? "desc" : "asc",
            }))
          }
          aria-label={
            sort.direction === "asc"
              ? "Sorted low to high. Sort high to low"
              : "Sorted high to low. Sort low to high"
          }
          className="grid size-11 shrink-0 place-items-center rounded-[10px] border border-line-strong bg-white text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-800"
        >
          <span aria-hidden className="text-[11px]">
            {sort.direction === "asc" ? "▲" : "▼"}
          </span>
        </button>
      </div>

      {/* ------------------------------------------------------- desktop */}
      <div className="scrollbar-thin hidden overflow-x-auto rounded-b-card md:block">
        <table className="w-full min-w-[720px] text-left">
          <caption className="sr-only">
            Your holdings. Every column header is a button that sorts the table.
          </caption>
          <thead>
            <tr className="border-b border-line">
              {COLUMNS.map((column, columnIndex) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={ariaSort(column.key)}
                  className={cn(
                    "px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-400",
                    column.align === "right" ? "text-right" : "text-left",
                    columnIndex === 0 && "pl-5",
                    columnIndex === COLUMNS.length - 1 && "pr-5",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggle(column)}
                    className={cn(
                      "group inline-flex items-center gap-1 transition-colors hover:text-brand-800",
                      sort.key === column.key && "text-ink-700",
                    )}
                  >
                    {column.label}
                    <span
                      aria-hidden
                      className={cn(
                        "text-[8px] leading-none transition-opacity",
                        sort.key === column.key
                          ? "text-brand-600 opacity-100"
                          : "opacity-0 group-hover:opacity-40",
                      )}
                    >
                      {sort.key === column.key && sort.direction === "asc"
                        ? "▲"
                        : "▼"}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-line">
            {sorted.map((position) => (
              <tr
                key={position.symbol}
                className="transition-colors hover:bg-brand-50/50"
              >
                <th scope="row" className="py-3 pl-5 pr-3 font-normal">
                  <Link
                    href={`/market/${position.symbol}`}
                    className="flex items-center gap-3"
                  >
                    <Monogram
                      symbol={position.symbol}
                      color={position.stock.brandColor}
                      size="sm"
                    />
                    <span className="min-w-0">
                      <span className="block font-display text-[14px] font-medium leading-tight tracking-tight text-ink-950">
                        {position.symbol}
                      </span>
                      <span className="block max-w-[180px] truncate text-[12px] leading-tight text-ink-400">
                        {position.stock.name}
                      </span>
                    </span>
                  </Link>
                </th>

                <td
                  data-numeric
                  className="px-3 py-3 text-right text-[13px] text-ink-700"
                >
                  {formatShares(position.shares)}
                </td>

                <td
                  data-numeric
                  className="px-3 py-3 text-right text-[13px] text-ink-500"
                >
                  {formatUsd(position.avgCost)}
                </td>

                <td className="px-3 py-3 text-right">
                  <span
                    data-numeric
                    className="block text-[13px] leading-tight text-ink-950"
                  >
                    {formatUsd(position.stock.price)}
                  </span>
                  <Delta
                    value={position.stock.changePct}
                    size="sm"
                    className="leading-tight"
                  />
                </td>

                <td className="px-3 py-3 text-right">
                  <span
                    data-numeric
                    className="block font-display text-[14px] font-medium leading-tight tracking-tight text-ink-950"
                  >
                    {formatUsd(position.value)}
                  </span>
                </td>

                <td className="px-3 py-3 text-right">
                  <Money
                    value={position.gain}
                    signed
                    className="block text-[13px] font-medium leading-tight"
                  />
                  <Delta
                    value={position.gainPct}
                    size="sm"
                    className="leading-tight"
                  />
                </td>

                <td className="py-3 pl-3 pr-5">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-full min-w-[52px] max-w-[104px] overflow-hidden rounded-pill bg-line">
                      <span
                        className="block h-full rounded-pill bg-brand-600"
                        style={{ width: `${position.weight * 100}%` }}
                      />
                    </span>
                    <span
                      data-numeric
                      className="w-11 shrink-0 text-right text-[12px] text-ink-500"
                    >
                      {formatPct(position.weight * 100)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* -------------------------------------------------------- mobile */}
      <RowList className="md:hidden">
        {sorted.map((position) => (
          <StockRow
            key={position.symbol}
            stock={position.stock}
            subtitle={`${formatShares(position.shares)} shares · avg ${formatUsd(
              position.avgCost,
            )}`}
            trailing={
              <div className="shrink-0 text-right">
                <p
                  data-numeric
                  className="font-display text-[14px] font-medium leading-tight tracking-tight text-ink-950"
                >
                  {formatUsd(position.value)}
                </p>
                <Delta
                  value={position.gainPct}
                  size="sm"
                  className="leading-tight"
                />
                <p
                  data-numeric
                  className="text-[11px] leading-tight text-ink-300"
                >
                  {formatPct(position.weight * 100)} of holdings
                </p>
              </div>
            }
          />
        ))}
      </RowList>
    </Card>
  );
}
