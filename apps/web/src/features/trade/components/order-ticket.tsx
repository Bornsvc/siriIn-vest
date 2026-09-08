"use client";

import { useEffect, useId, useState } from "react";
import type { OrderSide, OrderType, Stock } from "@/shared/types";
import { cn } from "@/shared/lib/cn";
import {
  formatLak,
  formatShares,
  formatUsd,
  usdToLak,
  USD_LAK,
} from "@/shared/lib/format";
import {
  formatCountdown,
  getMarketStatus,
  type MarketStatus,
} from "@/shared/lib/market";
import {
  Badge,
  Button,
  Delta,
  Field,
  Input,
  Monogram,
  Note,
  Sheet,
  Tabs,
  type TabItem,
} from "@/shared/ui";
import { IconCheck } from "@/shared/ui/icons";

/**
 * The order ticket.
 *
 * Two steps in one sheet — enter, then review — with the stock still visible
 * behind it. The kip line is not decoration: the customer's money is in kip
 * and the total in dollars is an abstraction until it is converted.
 *
 * Nothing is persisted. This is an MVP against mock data, so confirming an
 * order mints an id and stops there.
 */

/** Flat per-order commission, in USD. */
const COMMISSION = 1;

type Step = "ticket" | "review" | "done";
type AmountMode = "shares" | "dollars";

const TYPE_ITEMS: TabItem<OrderType>[] = [
  { value: "market", label: "Market" },
  { value: "limit", label: "Limit" },
];

const MODE_ITEMS: TabItem<AmountMode>[] = [
  { value: "shares", label: "Shares" },
  { value: "dollars", label: "Dollars" },
];

function toAmount(input: string): number {
  const value = Number(input.replace(/,/g, "").trim());
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function OrderTicket({
  stock,
  side,
  heldShares,
  availableUsd,
  onClose,
}: {
  stock: Stock;
  side: OrderSide;
  /** Shares the customer already holds — the ceiling on a sell. */
  heldShares: number;
  /** Settled cash — the ceiling on a buy. */
  availableUsd: number;
  onClose: () => void;
}) {
  const fieldId = useId();
  const [step, setStep] = useState<Step>("ticket");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [mode, setMode] = useState<AmountMode>("shares");
  const [sharesInput, setSharesInput] = useState("");
  const [dollarsInput, setDollarsInput] = useState("");
  const [limitInput, setLimitInput] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  // The session is time-dependent, so it is subscribed to after mount rather
  // than read during render — a server-rendered clock would hydrate as a
  // mismatch, and a ticket left open would otherwise show a stale countdown.
  const [status, setStatus] = useState<MarketStatus | null>(null);
  useEffect(() => {
    const tick = () => setStatus(getMarketStatus());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const buying = side === "buy";
  const limitPrice = toAmount(limitInput);
  const execPrice =
    orderType === "limit" ? limitPrice : stock.price;

  const shares =
    execPrice <= 0
      ? 0
      : mode === "shares"
        ? toAmount(sharesInput)
        : toAmount(dollarsInput) / execPrice;

  const estimate = shares * execPrice;
  const total = buying ? estimate + COMMISSION : Math.max(0, estimate - COMMISSION);
  const kip = usdToLak(total);

  const blocker = ((): { message: string; hard: boolean } | null => {
    if (orderType === "limit" && limitPrice <= 0) {
      return { message: "Enter a limit price", hard: false };
    }
    if (shares <= 0) {
      return {
        message:
          mode === "shares" ? "Enter a number of shares" : "Enter an amount",
        hard: false,
      };
    }
    if (buying && total > availableUsd) {
      return {
        message: `You have ${formatUsd(availableUsd)} available`,
        hard: true,
      };
    }
    if (!buying && shares > heldShares) {
      return {
        message:
          heldShares === 0
            ? `You do not hold any ${stock.symbol} shares`
            : `You hold ${formatShares(heldShares)} ${heldShares === 1 ? "share" : "shares"}`,
        hard: true,
      };
    }
    return null;
  })();

  const queued = status !== null && status.state !== "open";
  const opensIn =
    status && (status.state === "closed" || status.state === "pre")
      ? formatCountdown(status.minutesToChange)
      : null;

  const sideLabel = `${buying ? "Buy" : "Sell"} ${stock.symbol}`;
  const confirmLabel = buying ? "Confirm buy" : "Confirm sell";

  const place = () => {
    setOrderId(`SI-${Math.floor(4_820_000 + Math.random() * 179_999)}`);
    setStep("done");
  };

  // Until a quantity is entered there is no order to price. Showing a $1.00
  // commission — and a $1.00 total — against zero shares would be a small lie.
  const priced = shares > 0;
  const or = (value: string) => (priced ? value : "—");

  const summary = (
    <dl className="space-y-2.5">
      <Line label="Order type" value={orderType === "limit" ? "Limit" : "Market"} />
      <Line label="Side" value={buying ? "Buy" : "Sell"} />
      <Line
        label="Shares"
        value={or(formatShares(Number(shares.toFixed(4))))}
      />
      <Line
        label={orderType === "limit" ? "Limit price" : "Market price"}
        value={execPrice > 0 ? formatUsd(execPrice) : "—"}
      />
      <Line
        label={buying ? "Estimated cost" : "Estimated proceeds"}
        value={or(formatUsd(estimate))}
      />
      <Line label="Commission" value={or(formatUsd(COMMISSION))} />
      <div className="flex items-baseline justify-between gap-4 border-t border-line pt-2.5">
        <dt className="text-[13px] font-medium text-ink-950">Total</dt>
        <dd
          data-numeric
          className="font-display text-[17px] font-medium tracking-tight text-ink-950"
        >
          {or(formatUsd(total))}
        </dd>
      </div>
      <div className="flex items-baseline justify-between gap-4 rounded-tile bg-brand-50 px-3 py-2.5">
        <dt className="min-w-0">
          <span className="lao block text-[12px] leading-none text-brand-700">
            ລວມເປັນກີບ
          </span>
          <span className="mt-1 block text-[11px] leading-none text-brand-600/70">
            Kip equivalent
          </span>
        </dt>
        <dd
          data-numeric
          className="font-display text-[17px] font-medium tracking-tight text-brand-900"
        >
          {or(formatLak(kip))}
        </dd>
      </div>
    </dl>
  );

  return (
    <Sheet
      open
      onClose={onClose}
      eyebrow={buying ? "ຊື້ຮຸ້ນ" : "ຂາຍຮຸ້ນ"}
      title={sideLabel}
      footer={
        step === "done" ? (
          <Button block size="lg" variant="secondary" onClick={onClose}>
            Done
          </Button>
        ) : (
          <div className="space-y-2.5">
            {step === "ticket" && blocker ? (
              <p
                role={blocker.hard ? "status" : undefined}
                className={cn(
                  "text-center text-[12px]",
                  blocker.hard ? "text-loss" : "text-ink-400",
                )}
              >
                {blocker.message}
              </p>
            ) : null}

            <Button
              block
              size="lg"
              variant={buying ? "primary" : "sell"}
              disabled={step === "ticket" && blocker !== null}
              onClick={step === "ticket" ? () => setStep("review") : place}
            >
              {step === "ticket" ? sideLabel : confirmLabel}
            </Button>

            {step === "review" ? (
              <Button
                block
                variant="ghost"
                size="sm"
                onClick={() => setStep("ticket")}
              >
                Edit order
              </Button>
            ) : null}
          </div>
        )
      }
    >
      {/* Identity strip — which stock, at what price, on every step. */}
      <div className="mb-5 flex items-center gap-3 rounded-tile border border-line bg-canvas/60 p-3">
        <Monogram symbol={stock.symbol} color={stock.brandColor} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[14px] font-medium leading-tight tracking-tight text-ink-950">
            {stock.symbol}
          </p>
          <p className="truncate text-[12px] leading-tight text-ink-400">
            {stock.name}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p
            data-numeric
            className="font-display text-[14px] font-medium leading-tight tracking-tight text-ink-950"
          >
            {formatUsd(stock.price)}
          </p>
          <Delta value={stock.changePct} size="sm" className="leading-tight" />
        </div>
      </div>

      {step === "ticket" ? (
        <div className="space-y-5">
          <div>
            <p className="lao mb-2 text-[12px] leading-none text-brand-600">
              ປະເພດຄຳສັ່ງ
            </p>
            <Tabs items={TYPE_ITEMS} value={orderType} onChange={setOrderType} />
          </div>

          {orderType === "limit" ? (
            <Field
              label="Limit price"
              htmlFor={`${fieldId}-limit`}
              hint={`We will only ${buying ? "buy" : "sell"} at ${
                limitPrice > 0 ? formatUsd(limitPrice) : "your price"
              } or better.`}
            >
              <Input
                id={`${fieldId}-limit`}
                inputMode="decimal"
                placeholder={stock.price.toFixed(2)}
                value={limitInput}
                onChange={(event) => setLimitInput(event.target.value)}
              />
            </Field>
          ) : null}

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor={`${fieldId}-amount`}
                className="text-[13px] font-medium text-ink-700"
              >
                {mode === "shares" ? "Shares" : "Amount"}
              </label>
              <Tabs
                items={MODE_ITEMS}
                value={mode}
                onChange={setMode}
                size="sm"
              />
            </div>

            <div className="relative">
              {mode === "dollars" ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-400"
                >
                  $
                </span>
              ) : null}
              <Input
                id={`${fieldId}-amount`}
                inputMode="decimal"
                placeholder={mode === "shares" ? "0" : "0.00"}
                className={cn(mode === "dollars" && "pl-7")}
                value={mode === "shares" ? sharesInput : dollarsInput}
                onChange={(event) =>
                  mode === "shares"
                    ? setSharesInput(event.target.value)
                    : setDollarsInput(event.target.value)
                }
              />
            </div>

            <p className="mt-1.5 text-[12px] text-ink-400">
              {mode === "shares" ? (
                <>
                  ≈{" "}
                  <span data-numeric className="text-ink-700">
                    {formatUsd(estimate)}
                  </span>{" "}
                  at {orderType === "limit" ? "your limit" : "the market price"}
                </>
              ) : (
                <>
                  ≈{" "}
                  <span data-numeric className="text-ink-700">
                    {formatShares(Number(shares.toFixed(4)))}
                  </span>{" "}
                  shares · fractional shares are supported
                </>
              )}
            </p>
          </div>

          <div className="border-t border-line pt-4">{summary}</div>

          <div className="space-y-2">
            <Note>
              Converted at ₭
              <span data-numeric>{USD_LAK.toLocaleString("en-US")}</span> per
              dollar. The rate is indicative and settles at the desk rate on
              execution.
            </Note>
            {queued && orderType === "market" ? (
              <Note>
                New York is closed. Market orders are queued and fill at the
                open{opensIn ? `, in ${opensIn}` : ""}.
              </Note>
            ) : null}
          </div>
        </div>
      ) : null}

      {step === "review" ? (
        <div className="space-y-5">
          <div>
            <p className="lao text-[12px] leading-none text-brand-600">
              ກວດສອບຄຳສັ່ງ
            </p>
            <h3 className="mt-1.5 font-display text-[17px] font-medium tracking-tight text-ink-950">
              Review your order
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-400">
              Check the figures below. Nothing is sent until you press{" "}
              {confirmLabel.toLowerCase()}.
            </p>
          </div>

          {summary}

          <div className="space-y-2">
            <Note>
              Converted at ₭
              <span data-numeric>{USD_LAK.toLocaleString("en-US")}</span> per
              dollar. The rate is indicative and settles at the desk rate on
              execution.
            </Note>
            {queued && orderType === "market" ? (
              <Note>
                New York is closed. Market orders are queued and fill at the
                open{opensIn ? `, in ${opensIn}` : ""}.
              </Note>
            ) : null}
          </div>
        </div>
      ) : null}

      {step === "done" ? (
        <div className="space-y-5">
          <div className="text-center">
            <span
              aria-hidden
              className="mx-auto grid size-12 place-items-center rounded-full bg-brand-50 text-brand-700"
            >
              <IconCheck className="size-6" />
            </span>
            <p className="lao mt-4 text-[12px] leading-none text-brand-600">
              ສົ່ງຄຳສັ່ງແລ້ວ
            </p>
            <h3 className="mt-1.5 font-display text-[19px] font-medium tracking-tight text-ink-950">
              Order placed
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-400">
              {buying ? "Buying" : "Selling"}{" "}
              <span data-numeric className="text-ink-700">
                {formatShares(Number(shares.toFixed(4)))}
              </span>{" "}
              {stock.symbol} {shares === 1 ? "share" : "shares"} for{" "}
              <span data-numeric className="text-ink-700">
                {formatUsd(total)}
              </span>
              .
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-tile border border-line bg-canvas/60 px-3.5 py-3">
            <span className="text-[12px] text-ink-400">Order id</span>
            <span
              data-numeric
              className="font-mono text-[13px] font-medium text-ink-950"
            >
              {orderId}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-[13px] text-ink-500">Status</span>
            <Badge tone={queued && orderType === "market" ? "warn" : "brand"}>
              {queued && orderType === "market" ? "Queued" : "Submitted"}
            </Badge>
          </div>

          <div className="space-y-2 border-t border-line pt-4">
            {queued && orderType === "market" ? (
              <Note>
                The market is closed, so this order fills when New York opens
                {opensIn ? `, in ${opensIn}` : ""}. You can cancel it until then.
              </Note>
            ) : (
              <Note>
                You will get a notification the moment this order fills.
              </Note>
            )}
            <Note>
              <span data-numeric>{formatLak(kip)}</span> will be reserved from
              your kip balance at settlement.
            </Note>
          </div>
        </div>
      ) : null}
    </Sheet>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[13px] text-ink-500">{label}</dt>
      <dd data-numeric className="text-[13px] font-medium text-ink-950">
        {value}
      </dd>
    </div>
  );
}
