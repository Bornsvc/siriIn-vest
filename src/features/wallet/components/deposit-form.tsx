"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { formatLak, formatUsd, lakToUsd, usdToLak } from "@/shared/lib/format";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  Note,
  Tabs,
  type TabItem,
} from "@/shared/ui";
import { IconClock } from "@/shared/ui/icons";
import {
  formatMoney,
  makeReference,
  MIN_DEPOSIT,
  parseAmountInput,
  QUICK_AMOUNTS,
  RATE_LINE,
  toAmountInput,
  type Currency,
} from "../lib/currency";
import { AmountInput, QuickAmounts } from "./amount-input";
import {
  BlockedReason,
  ConversionPanel,
  SummaryRow,
  SummaryTotal,
} from "./panels";
import { SuccessPanel } from "./success-panel";

export type DepositMethod = {
  id: string;
  name: string;
  nameLo: string;
  detail: string;
  fee: string;
  eta: string;
  available: boolean;
};

type Receipt = {
  reference: string;
  currency: Currency;
  /** Kip leaving the customer's bank. */
  sentLak: number;
  /** Dollars landing in the trading account. */
  creditedUsd: number;
  method: DepositMethod;
};

const CURRENCY_TABS: TabItem<Currency>[] = [
  { value: "LAK", label: "LAK ₭" },
  { value: "USD", label: "USD $" },
];

const AMOUNT_ID = "deposit-amount";

export function DepositForm({ methods }: { methods: DepositMethod[] }) {
  // Kip is the default because kip is what customers hold.
  const [currency, setCurrency] = useState<Currency>("LAK");
  const [raw, setRaw] = useState("");
  const [methodId, setMethodId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const amount = parseAmountInput(raw);
  const minimum = MIN_DEPOSIT[currency];
  const method = methods.find((item) => item.id === methodId) ?? null;

  const sentLak = currency === "LAK" ? amount : usdToLak(amount);
  const creditedUsd = currency === "LAK" ? lakToUsd(amount) : amount;

  const belowMinimum = amount > 0 && amount < minimum;
  const blocker =
    amount <= 0
      ? "Enter an amount to continue."
      : belowMinimum
        ? `The minimum deposit is ${formatMoney(minimum, currency)}.`
        : !method
          ? "Choose how you want to pay."
          : null;

  function switchCurrency(next: Currency) {
    if (next === currency) return;
    // An amount in kip means nothing in dollars — start the figure again
    // rather than silently reinterpreting it.
    setCurrency(next);
    setRaw("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (blocker || !method) return;
    setReceipt({
      reference: makeReference("DEP"),
      currency,
      sentLak,
      creditedUsd,
      method,
    });
  }

  if (receipt) {
    return (
      <DepositSuccess
        receipt={receipt}
        onAgain={() => {
          setReceipt(null);
          setRaw("");
          setMethodId(null);
        }}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]"
    >
      <div className="min-w-0 space-y-5">
        {/* Amount ------------------------------------------------------ */}
        <Card>
          <CardHeader
            eyebrow="ຈຳນວນເງິນ"
            title="Amount"
            action={
              <Tabs
                items={CURRENCY_TABS}
                value={currency}
                onChange={switchCurrency}
                size="sm"
              />
            }
          />
          <CardBody className="space-y-4">
            <Field
              htmlFor={AMOUNT_ID}
              label={
                <span className="flex flex-wrap items-baseline gap-x-2">
                  Amount to deposit
                  <span className="lao text-[11px] font-normal text-ink-400">
                    ຈຳນວນເງິນທີ່ຈະຝາກ
                  </span>
                </span>
              }
              hint={`Minimum ${formatMoney(minimum, currency)} per deposit.`}
              error={
                belowMinimum
                  ? `The minimum deposit is ${formatMoney(minimum, currency)}. Enter a larger amount.`
                  : undefined
              }
            >
              <AmountInput
                id={AMOUNT_ID}
                currency={currency}
                value={raw}
                onValueChange={setRaw}
                invalid={belowMinimum}
                describedBy={`${AMOUNT_ID}-status`}
              />
            </Field>
            {/* Description for the field itself, not a live region — the
                blocked reason beside the Continue button announces changes. */}
            <p id={`${AMOUNT_ID}-status`} className="sr-only">
              {belowMinimum
                ? `The minimum deposit is ${formatMoney(minimum, currency)}.`
                : amount > 0
                  ? `${formatLak(sentLak)} converts to ${formatUsd(creditedUsd)} at ${RATE_LINE}.`
                  : `Enter an amount in ${currency}. Minimum ${formatMoney(minimum, currency)}.`}
            </p>

            <QuickAmounts
              amounts={QUICK_AMOUNTS[currency]}
              currency={currency}
              active={amount}
              onPick={(value) => setRaw(toAmountInput(value, currency))}
              format={formatMoney}
            />

            <ConversionPanel
              from={
                currency === "LAK"
                  ? {
                      label: "You transfer",
                      labelLo: "ຈຳນວນທີ່ທ່ານໂອນ",
                      value: amount > 0 ? formatLak(sentLak) : "₭—",
                    }
                  : {
                      label: "You want to add",
                      labelLo: "ຈຳນວນທີ່ຕ້ອງການເພີ່ມ",
                      value: amount > 0 ? formatUsd(creditedUsd) : "$—",
                    }
              }
              to={
                currency === "LAK"
                  ? {
                      label: "Lands in your account",
                      labelLo: "ເຂົ້າບັນຊີຂອງທ່ານ",
                      value: amount > 0 ? formatUsd(creditedUsd) : "$—",
                    }
                  : {
                      label: "You transfer",
                      labelLo: "ຈຳນວນທີ່ທ່ານໂອນ",
                      value: amount > 0 ? formatLak(sentLak) : "₭—",
                    }
              }
              footnote="Shown at today's indicative rate. The rate that settles the transfer is the one that counts."
            />
          </CardBody>
        </Card>

        {/* Method ------------------------------------------------------ */}
        <Card className="overflow-hidden">
          <CardHeader eyebrow="ວິທີການຈ່າຍ" title="Deposit method" />
          <fieldset className="divide-y divide-line">
            <legend className="sr-only">Deposit method</legend>
            {methods.map((item) => (
              <MethodOption
                key={item.id}
                method={item}
                checked={methodId === item.id}
                onSelect={() => setMethodId(item.id)}
              />
            ))}
          </fieldset>
        </Card>
      </div>

      {/* Summary ------------------------------------------------------- */}
      <div className="min-w-0 space-y-4 lg:sticky lg:top-29">
        <Card>
          <CardHeader eyebrow="ສະຫຼຸບ" title="Summary" />
          <CardBody className="pt-3">
            <div className="divide-y divide-line">
              <SummaryRow
                label="You transfer"
                labelLo="ທ່ານໂອນ"
                value={amount > 0 ? formatLak(sentLak) : "—"}
                muted={amount <= 0}
              />
              <SummaryRow
                label="Method"
                labelLo="ວິທີການ"
                numeric={false}
                value={method ? method.name : "Not chosen"}
                muted={!method}
              />
              <SummaryRow
                label="Fee"
                labelLo="ຄ່າທຳນຽມ"
                numeric={false}
                value={method ? method.fee : "—"}
                muted={!method}
              />
              <SummaryRow
                label="Arrives"
                labelLo="ເວລາດຳເນີນການ"
                numeric={false}
                value={method ? method.eta : "—"}
                muted={!method}
              />
            </div>

            <SummaryTotal
              labelLo="ເຂົ້າບັນຊີການຄ້າ"
              label="Credited to your account"
              value={amount > 0 ? formatUsd(creditedUsd) : "$—"}
              sub={amount > 0 ? `from ${formatLak(sentLak)}` : undefined}
            />

            <Button
              type="submit"
              size="lg"
              block
              className="mt-4"
              disabled={blocker !== null}
              aria-describedby={blocker ? "deposit-blocker" : undefined}
            >
              Continue
            </Button>
            {blocker ? (
              <BlockedReason id="deposit-blocker">{blocker}</BlockedReason>
            ) : (
              <p className="mt-2 text-center text-[12px] text-ink-400">
                You will see the transfer instructions next. Nothing moves yet.
              </p>
            )}
          </CardBody>
        </Card>

        <Note>
          Your kip is converted to U.S. dollars so it can trade on the U.S.
          market. The conversion uses the rate at the moment the transfer
          settles, which may differ from the rate shown here.
        </Note>
      </div>
    </form>
  );
}

function MethodOption({
  method,
  checked,
  onSelect,
}: {
  method: DepositMethod;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "flex gap-3 px-5 py-4 transition-colors",
        method.available
          ? "cursor-pointer hover:bg-brand-50/60"
          : "cursor-not-allowed bg-canvas/50",
      )}
    >
      <input
        type="radio"
        name="deposit-method"
        value={method.id}
        checked={checked}
        disabled={!method.available}
        onChange={onSelect}
        className="mt-1 size-4 shrink-0 accent-brand-700"
      />

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={cn(
              "text-[13px] font-medium",
              method.available ? "text-ink-950" : "text-ink-400",
            )}
          >
            {method.name}
          </span>
          <span
            className={cn(
              "lao text-[11px]",
              method.available ? "text-brand-600" : "text-ink-300",
            )}
          >
            {method.nameLo}
          </span>
          {method.available ? null : <Badge tone="warn">Coming soon</Badge>}
        </span>

        <span className="mt-0.5 block text-[12px] leading-snug text-ink-400">
          {method.detail}
        </span>

        {method.available ? (
          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-500">
            <span data-numeric className="font-medium text-brand-700">
              {method.fee}
            </span>
            <span aria-hidden className="text-line-strong">
              ·
            </span>
            <span className="inline-flex items-center gap-1">
              <IconClock className="size-3.5 text-ink-300" />
              <span data-numeric>{method.eta}</span>
            </span>
          </span>
        ) : null}
      </span>
    </label>
  );
}

function DepositSuccess({
  receipt,
  onAgain,
}: {
  receipt: Receipt;
  onAgain: () => void;
}) {
  const first =
    receipt.method.id === "qr"
      ? `Open BCEL One or your bank app and scan the SiriInvest QR code shown on the transfer screen.`
      : `Transfer ${formatLak(receipt.sentLak)} from your Lao bank account to the SiriInvest collection account.`;

  return (
    <SuccessPanel
      eyebrow="ສົ່ງຄຳຂໍແລ້ວ"
      title="Deposit started"
      lead={`We are ready for ${formatLak(receipt.sentLak)}. Once it settles we credit about ${formatUsd(receipt.creditedUsd)} to your trading account.`}
      reference={receipt.reference}
      rows={[
        { label: "You transfer", labelLo: "ທ່ານໂອນ", value: formatLak(receipt.sentLak) },
        {
          label: "Credited",
          labelLo: "ເຂົ້າບັນຊີ",
          value: `≈ ${formatUsd(receipt.creditedUsd)}`,
        },
        {
          label: "Method",
          labelLo: "ວິທີການ",
          value: receipt.method.name,
          numeric: false,
        },
        { label: "Fee", labelLo: "ຄ່າທຳນຽມ", value: receipt.method.fee, numeric: false },
      ]}
      steps={[
        first,
        `Quote reference ${receipt.reference} so we can match the payment to your account.`,
        "We convert the kip to U.S. dollars and credit your trading balance. You get a notification the moment it lands.",
      ]}
      timing={{
        label: "Expected to clear",
        value: receipt.method.eta,
      }}
      note="Funds convert to USD for U.S. market trading, at the rate shown at the time the transfer settles. Until then the amount sits in your wallet as a pending deposit and cannot be traded."
      secondaryAction={{ label: "Add more funds", onClick: onAgain }}
    />
  );
}
