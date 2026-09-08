"use client";

import { useMemo, useState } from "react";
import type { OrderSide, OrderStatus } from "@/shared/types";
import { cn } from "@/shared/lib/cn";
import { formatShares, formatUsd } from "@/shared/lib/format";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Chip,
  EmptyState,
} from "@/shared/ui";
import { IconCheck, IconClock, IconX } from "@/shared/ui/icons";
import { groupByMonth, type OrderRow } from "../lib/analytics";

/**
 * Every order the customer has placed, newest first, cut into months. Buy and
 * sell are toned brand and neutral rather than green and red — a sell is not
 * a loss, and the colour would say it was.
 */

type SideFilter = OrderSide | "all";
type StatusFilter = OrderStatus | "all";

const SIDE_FILTERS: { value: SideFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "buy", label: "Buy" },
  { value: "sell", label: "Sell" },
];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "filled", label: "Filled" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  filled: "Filled",
  pending: "Pending",
  cancelled: "Cancelled",
};

export function HistoryPanel({ rows }: { rows: OrderRow[] }) {
  const [side, setSide] = useState<SideFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const groups = useMemo(() => {
    const filtered = rows.filter(
      (row) =>
        (side === "all" || row.side === side) &&
        (status === "all" || row.status === status),
    );
    return groupByMonth(filtered);
  }, [rows, side, status]);

  const filtered = side !== "all" || status !== "all";
  const matches = groups.reduce((count, group) => count + group.rows.length, 0);

  const clear = () => {
    setSide("all");
    setStatus("all");
  };

  return (
    <Card>
      <CardHeader
        eyebrow="ປະຫວັດຄຳສັ່ງ"
        title="Order history"
        action={
          <p className="text-[12px] text-ink-400">
            <span data-numeric>{matches}</span> of{" "}
            <span data-numeric>{rows.length}</span> orders
          </p>
        }
      />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line px-5 py-3">
        <FilterGroup
          eyebrow="ປະເພດ"
          label="Side"
          options={SIDE_FILTERS}
          value={side}
          onChange={setSide}
        />
        <FilterGroup
          eyebrow="ສະຖານະ"
          label="Status"
          options={STATUS_FILTERS}
          value={status}
          onChange={setStatus}
        />
        {filtered ? (
          <Button variant="ghost" size="sm" onClick={clear} className="ml-auto">
            Clear filters
          </Button>
        ) : null}
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title="No orders match these filters"
          body="Nothing in your history is both of that side and that status. Clear the filters to see every order again."
          action={
            <Button variant="secondary" size="sm" onClick={clear}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          {/* ---------------------------------------------------- desktop */}
          <div className="scrollbar-thin hidden overflow-x-auto rounded-b-card md:block">
            <table className="w-full min-w-[760px] table-fixed text-left">
              <caption className="sr-only">
                Your orders, newest first, grouped by month.
              </caption>
              <colgroup>
                <col className="w-[15%]" />
                <col className="w-[9%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[13%]" />
                <col className="w-[15%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-line">
                  <Th className="pl-5">Date</Th>
                  <Th>Side</Th>
                  <Th>Symbol</Th>
                  <Th>Type</Th>
                  <Th align="right">Shares</Th>
                  <Th align="right">Price</Th>
                  <Th align="right">Total</Th>
                  <Th className="pr-5">Status</Th>
                </tr>
              </thead>

              {groups.map((group) => (
                <tbody key={group.key} className="divide-y divide-line">
                  <tr className="border-b border-line bg-canvas/70">
                    <th
                      colSpan={8}
                      scope="colgroup"
                      className="px-5 py-2 text-left font-normal"
                    >
                      <span className="lao text-[12px] font-medium text-brand-700">
                        {group.lo}
                      </span>
                      <span className="ml-2 text-[11px] text-ink-400">
                        {group.en}
                      </span>
                    </th>
                  </tr>

                  {group.rows.map((row) => (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-brand-50/50"
                    >
                      <td
                        data-numeric
                        className="py-3 pl-5 pr-3 text-[13px] text-ink-500"
                      >
                        {row.dateLabel}
                      </td>
                      <td className="px-3 py-3">
                        <SideBadge side={row.side} />
                      </td>
                      <th scope="row" className="px-3 py-3 font-normal">
                        <span className="font-display text-[13px] font-medium tracking-tight text-ink-950">
                          {row.symbol}
                        </span>
                      </th>
                      <td className="px-3 py-3 text-[13px] capitalize text-ink-500">
                        {row.type}
                      </td>
                      <td
                        data-numeric
                        className="px-3 py-3 text-right text-[13px] text-ink-700"
                      >
                        {formatShares(row.shares)}
                      </td>
                      <td
                        data-numeric
                        className="px-3 py-3 text-right text-[13px] text-ink-700"
                      >
                        {formatUsd(row.price)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span
                          data-numeric
                          className="block font-display text-[13px] font-medium leading-tight tracking-tight text-ink-950"
                        >
                          {formatUsd(row.total)}
                        </span>
                        <span
                          data-numeric
                          className="block text-[11px] leading-tight text-ink-300"
                        >
                          {feeCaption(row)}
                        </span>
                      </td>
                      <td className="py-3 pl-3 pr-5">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>

          {/* ----------------------------------------------------- mobile */}
          <div className="md:hidden">
            {groups.map((group) => (
              <section key={group.key}>
                <h3 className="flex items-baseline gap-2 border-b border-line bg-canvas/70 px-5 py-2">
                  <span className="lao text-[12px] font-medium text-brand-700">
                    {group.lo}
                  </span>
                  <span className="text-[11px] text-ink-400">{group.en}</span>
                </h3>
                <ul className="divide-y divide-line">
                  {group.rows.map((row) => (
                    <li key={row.id} className="px-5 py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="flex items-center gap-2">
                          <SideBadge side={row.side} />
                          <span className="font-display text-[14px] font-medium tracking-tight text-ink-950">
                            {row.symbol}
                          </span>
                        </p>
                        <p
                          data-numeric
                          className="shrink-0 font-display text-[14px] font-medium tracking-tight text-ink-950"
                        >
                          {formatUsd(row.total)}
                        </p>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between gap-3">
                        <p
                          data-numeric
                          className="min-w-0 truncate text-[12px] text-ink-400"
                        >
                          {row.dateLabel} · {row.type} ·{" "}
                          {formatShares(row.shares)} @ {formatUsd(row.price)}
                        </p>
                        <StatusBadge status={row.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

/** A cancelled order moved no money, and a sell nets the fee out. Say so. */
function feeCaption(row: OrderRow): string {
  if (row.status === "cancelled") return `${formatUsd(row.fees)} fee not charged`;
  if (row.status === "pending") return `incl. ${formatUsd(row.fees)} fee on fill`;
  return row.side === "buy"
    ? `incl. ${formatUsd(row.fees)} fee`
    : `after ${formatUsd(row.fees)} fee`;
}

function Th({
  children,
  align = "left",
  className,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-400",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

function FilterGroup<T extends string>({
  eyebrow,
  label,
  options,
  value,
  onChange,
}: {
  eyebrow: string;
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="flex items-baseline gap-1.5">
        <span className="lao text-[11px] leading-none text-ink-400">
          {eyebrow}
        </span>
        <span className="text-[11px] uppercase tracking-[0.06em] text-ink-300">
          {label}
        </span>
      </p>
      <div
        role="group"
        aria-label={`Filter by ${label.toLowerCase()}`}
        className="flex flex-wrap items-center gap-1.5"
      >
        {options.map((option) => (
          <Chip
            key={option.value}
            active={option.value === value}
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function SideBadge({ side }: { side: OrderSide }) {
  return (
    <Badge tone={side === "buy" ? "brand" : "neutral"}>
      {side === "buy" ? "Buy" : "Sell"}
    </Badge>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const Icon =
    status === "filled" ? IconCheck : status === "pending" ? IconClock : IconX;

  return (
    <Badge
      tone={status === "filled" ? "gain" : status === "pending" ? "warn" : "neutral"}
      className="shrink-0"
    >
      <Icon className="size-3" />
      {STATUS_LABEL[status]}
    </Badge>
  );
}
