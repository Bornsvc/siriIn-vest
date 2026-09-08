"use client";

import { useMemo, useState } from "react";
import type { Transfer, TransferStatus } from "@/shared/types";
import { cn } from "@/shared/lib/cn";
import { formatLak, formatUsd, lakToUsd, usdToLak } from "@/shared/lib/format";
import {
  Badge,
  ButtonLink,
  Card,
  CardHeader,
  EmptyState,
  RowList,
  Tabs,
  type TabItem,
} from "@/shared/ui";
import { IconDeposit, IconWithdraw } from "@/shared/ui/icons";
import { RelativeTime } from "@/shared/ui/relative-time";

type Filter = "all" | "deposit" | "withdrawal";

const STATUS: Record<
  TransferStatus,
  { label: string; tone: "brand" | "warn" | "loss" }
> = {
  completed: { label: "Completed", tone: "brand" },
  processing: { label: "Processing", tone: "warn" },
  failed: { label: "Failed", tone: "loss" },
};

const EMPTY: Record<Filter, { title: string; body: string }> = {
  all: {
    title: "No transfers yet",
    body: "Money you add or withdraw will appear here with the rate it converted at.",
  },
  deposit: {
    title: "No deposits yet",
    body: "Add kip from your Lao bank account and we convert it to dollars ready to trade.",
  },
  withdrawal: {
    title: "No withdrawals yet",
    body: "When you sell and want the cash back in kip, the withdrawal will be listed here.",
  },
};

export function TransferHistory({
  transfers,
  className,
}: {
  transfers: Transfer[];
  className?: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const sorted = useMemo(
    () =>
      [...transfers].sort(
        (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
      ),
    [transfers],
  );

  const items: TabItem<Filter>[] = [
    { value: "all", label: "All", count: sorted.length },
    {
      value: "deposit",
      label: "Deposits",
      count: sorted.filter((t) => t.kind === "deposit").length,
    },
    {
      value: "withdrawal",
      label: "Withdrawals",
      count: sorted.filter((t) => t.kind === "withdrawal").length,
    },
  ];

  const visible =
    filter === "all" ? sorted : sorted.filter((t) => t.kind === filter);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader eyebrow="ປະຫວັດການໂອນ" title="Transfers" />

      <div className="border-b border-line px-5 py-3">
        <div className="-mx-5 overflow-x-auto px-5 scrollbar-thin">
          <Tabs items={items} value={filter} onChange={setFilter} size="sm" />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={EMPTY[filter].title}
          body={EMPTY[filter].body}
          action={
            <ButtonLink href="/wallet/deposit" size="sm">
              Add funds
            </ButtonLink>
          }
        />
      ) : (
        <RowList>
          {visible.map((transfer) => (
            <TransferRow key={transfer.id} transfer={transfer} />
          ))}
        </RowList>
      )}
    </Card>
  );
}

function TransferRow({ transfer }: { transfer: Transfer }) {
  const deposit = transfer.kind === "deposit";
  const Icon = deposit ? IconDeposit : IconWithdraw;
  const status = STATUS[transfer.status];

  // Show the amount as it was moved, then the other side of the bridge — the
  // customer sent kip but the account works in dollars, and both are true.
  const original =
    transfer.currency === "LAK"
      ? formatLak(transfer.amount)
      : formatUsd(transfer.amount);
  const converted =
    transfer.currency === "LAK"
      ? formatUsd(lakToUsd(transfer.amount))
      : formatLak(usdToLak(transfer.amount));

  return (
    <div className="flex items-start gap-3 px-5 py-3.5">
      <span
        aria-hidden
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-[10px] ring-1 ring-inset",
          deposit
            ? "bg-brand-50 text-brand-700 ring-brand-100"
            : "bg-canvas text-ink-500 ring-line",
        )}
      >
        <Icon className="size-[17px]" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium leading-snug text-ink-950">
          {deposit ? "Deposit" : "Withdrawal"}
          <span className="sr-only">, {status.label}</span>
        </p>
        <p className="truncate text-[12px] leading-snug text-ink-400">
          {transfer.method}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Badge tone={status.tone}>{status.label}</Badge>
          <RelativeTime iso={transfer.at} className="text-[12px] text-ink-400" />
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p
          data-numeric
          className="font-display text-[14px] font-medium leading-tight tracking-tight text-ink-950"
        >
          <span aria-hidden>{deposit ? "+" : "−"}</span>
          {original}
        </p>
        <p data-numeric className="mt-0.5 text-[12px] leading-tight text-ink-400">
          ≈ {converted}
        </p>
      </div>
    </div>
  );
}
