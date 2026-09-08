"use client";

import { useState } from "react";
import type { BankAccount } from "@/shared/types";
import { cn } from "@/shared/lib/cn";
import { formatLak, formatUsd, usdToLak } from "@/shared/lib/format";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  Note,
} from "@/shared/ui";
import { IconBank, IconClock } from "@/shared/ui/icons";
import {
  makeReference,
  MIN_WITHDRAW_USD,
  parseAmountInput,
  RATE_LINE,
  toAmountInput,
} from "../lib/currency";
import { AmountInput } from "./amount-input";
import {
  BlockedReason,
  ConversionPanel,
  SummaryRow,
  SummaryTotal,
} from "./panels";
import { SuccessPanel } from "./success-panel";

const PROCESSING = "1–3 business days";
const AMOUNT_ID = "withdraw-amount";

type Receipt = {
  reference: string;
  amountUsd: number;
  landsLak: number;
  account: BankAccount;
};

export function WithdrawForm({
  availableUsd,
  accounts,
}: {
  availableUsd: number;
  accounts: BankAccount[];
}) {
  const preselected =
    accounts.find((account) => account.isDefault) ?? accounts[0];

  const [raw, setRaw] = useState("");
  const [accountId, setAccountId] = useState<string | undefined>(
    preselected?.id,
  );
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const amount = parseAmountInput(raw);
  const account = accounts.find((item) => item.id === accountId);
  const landsLak = usdToLak(amount);

  const belowMinimum = amount > 0 && amount < MIN_WITHDRAW_USD;
  const overBalance = amount > availableUsd;

  const blocker =
    amount <= 0
      ? "Enter an amount to withdraw."
      : belowMinimum
        ? `The minimum withdrawal is ${formatUsd(MIN_WITHDRAW_USD)}.`
        : overBalance
          ? `You can withdraw up to ${formatUsd(availableUsd)}.`
          : !account
            ? "Choose where the money should land."
            : null;

  const fieldError = belowMinimum
    ? `The minimum withdrawal is ${formatUsd(MIN_WITHDRAW_USD)}. Enter a larger amount.`
    : overBalance
      ? `That is more than your available balance. You can withdraw up to ${formatUsd(availableUsd)}.`
      : undefined;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (blocker || !account) return;
    setReceipt({
      reference: makeReference("WDL"),
      amountUsd: amount,
      landsLak,
      account,
    });
  }

  if (receipt) {
    return (
      <WithdrawSuccess
        receipt={receipt}
        onAgain={() => {
          setReceipt(null);
          setRaw("");
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
        {/* Available balance — the ceiling on everything below it. */}
        <Card>
          <CardBody className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div className="min-w-0">
              <p className="lao text-[12px] leading-none text-brand-600">
                ຍອດເງິນທີ່ຖອນໄດ້
              </p>
              <p className="mt-1.5 text-[13px] font-medium text-ink-700">
                Available to withdraw
              </p>
              <p
                data-numeric
                className="mt-2 font-display text-[36px] font-medium leading-none tracking-[-0.02em] text-ink-950"
              >
                {formatUsd(availableUsd)}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p data-numeric className="text-[14px] text-ink-400">
                ≈ {formatLak(usdToLak(availableUsd))}
              </p>
              <p data-numeric className="mt-1 font-mono text-[11px] text-ink-300">
                {RATE_LINE}
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Amount ------------------------------------------------------ */}
        <Card>
          <CardHeader
            eyebrow="ຈຳນວນເງິນ"
            title="Amount"
            action={
              <Badge tone="neutral">
                <span data-numeric>USD</span>
              </Badge>
            }
          />
          <CardBody className="space-y-4">
            <Field
              htmlFor={AMOUNT_ID}
              label={
                <span className="flex flex-wrap items-baseline gap-x-2">
                  Amount to withdraw
                  <span className="lao text-[11px] font-normal text-ink-400">
                    ຈຳນວນເງິນທີ່ຈະຖອນ
                  </span>
                </span>
              }
              hint={`Minimum ${formatUsd(MIN_WITHDRAW_USD)}. Your balance is held in U.S. dollars, so withdrawals are entered in dollars.`}
              error={fieldError}
            >
              <AmountInput
                id={AMOUNT_ID}
                currency="USD"
                value={raw}
                onValueChange={setRaw}
                invalid={belowMinimum || overBalance}
                describedBy={`${AMOUNT_ID}-status`}
                trailing={
                  <button
                    type="button"
                    onClick={() => setRaw(toAmountInput(availableUsd, "USD"))}
                    className="h-8 rounded-[8px] border border-line-strong bg-white px-2.5 text-[12px] font-medium text-brand-800 transition-colors hover:border-brand-300 hover:bg-brand-50"
                  >
                    Max
                  </button>
                }
              />
            </Field>
            {/* Description for the field itself, not a live region — the
                blocked reason beside the Withdraw button announces changes. */}
            <p id={`${AMOUNT_ID}-status`} className="sr-only">
              {fieldError ??
                (amount > 0
                  ? `${formatUsd(amount)} converts to about ${formatLak(landsLak)} at ${RATE_LINE}.`
                  : `Enter an amount in US dollars. Minimum ${formatUsd(MIN_WITHDRAW_USD)}, maximum ${formatUsd(availableUsd)}.`)}
            </p>

            <ConversionPanel
              from={{
                label: "You withdraw",
                labelLo: "ຈຳນວນທີ່ຖອນ",
                value: amount > 0 ? formatUsd(amount) : "$—",
              }}
              to={{
                label: "Lands in your bank",
                labelLo: "ເຂົ້າບັນຊີທະນາຄານ",
                value: amount > 0 ? formatLak(landsLak) : "₭—",
              }}
              footnote="An estimate. Kip is converted at the rate at the moment we send the transfer."
            />
          </CardBody>
        </Card>

        {/* Destination ------------------------------------------------- */}
        <Card className="overflow-hidden">
          <CardHeader eyebrow="ບັນຊີປາຍທາງ" title="Where it goes" />
          <fieldset className="divide-y divide-line">
            <legend className="sr-only">Destination account</legend>
            {accounts.map((item) => (
              <AccountOption
                key={item.id}
                account={item}
                checked={accountId === item.id}
                onSelect={() => setAccountId(item.id)}
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
                label="You withdraw"
                labelLo="ທ່ານຖອນ"
                value={amount > 0 ? formatUsd(amount) : "—"}
                muted={amount <= 0}
              />
              <SummaryRow
                label="Rate"
                labelLo="ອັດຕາແລກປ່ຽນ"
                value={RATE_LINE}
              />
              <SummaryRow
                label="To"
                labelLo="ປາຍທາງ"
                numeric={false}
                value={
                  account
                    ? `${shortBank(account.bank)} ${account.maskedNumber}`
                    : "Not chosen"
                }
                muted={!account}
              />
              <SummaryRow
                label="Processing time"
                labelLo="ເວລາດຳເນີນການ"
                numeric={false}
                value={PROCESSING}
              />
            </div>

            <SummaryTotal
              labelLo="ເຂົ້າບັນຊີທະນາຄານ"
              label="Lands in your bank account"
              value={amount > 0 ? formatLak(landsLak) : "₭—"}
              sub={amount > 0 ? `from ${formatUsd(amount)}` : undefined}
            />

            <Button
              type="submit"
              size="lg"
              block
              className="mt-4"
              disabled={blocker !== null}
              aria-describedby={blocker ? "withdraw-blocker" : undefined}
            >
              Withdraw
            </Button>
            {blocker ? (
              <BlockedReason id="withdraw-blocker">{blocker}</BlockedReason>
            ) : (
              <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[12px] text-ink-400">
                <IconClock className="size-3.5 text-ink-300" />
                <span data-numeric>Arrives in {PROCESSING}</span>
              </p>
            )}
          </CardBody>
        </Card>

        <Note>
          Withdrawals convert from U.S. dollars back to kip when the transfer is
          sent, so the final amount your bank credits can differ slightly from
          the estimate. SiriInvest charges no withdrawal fee; your bank may.
        </Note>
      </div>
    </form>
  );
}

/** "Banque Pour Le Commerce Extérieur Lao (BCEL)" → "BCEL" where it exists. */
function shortBank(bank: string): string {
  const match = bank.match(/\(([^)]+)\)/);
  return match ? match[1] : bank;
}

function AccountOption({
  account,
  checked,
  onSelect,
}: {
  account: BankAccount;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label className="flex cursor-pointer gap-3 px-5 py-4 transition-colors hover:bg-brand-50/60">
      <input
        type="radio"
        name="withdraw-destination"
        value={account.id}
        checked={checked}
        onChange={onSelect}
        className="mt-1 size-4 shrink-0 accent-brand-700"
      />

      <span
        aria-hidden
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-[10px] ring-1 ring-inset transition-colors",
          checked
            ? "bg-brand-50 text-brand-700 ring-brand-100"
            : "bg-canvas text-ink-400 ring-line",
        )}
      >
        <IconBank className="size-[17px]" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[13px] font-medium leading-snug text-ink-950">
            {account.bank}
          </span>
          {account.isDefault ? <Badge tone="brand">Default</Badge> : null}
        </span>
        <span className="mt-0.5 block truncate text-[12px] text-ink-400">
          {account.holder}
        </span>
        <span
          data-numeric
          className="mt-0.5 block font-mono text-[12px] text-ink-500"
        >
          {account.maskedNumber}
        </span>
      </span>
    </label>
  );
}

function WithdrawSuccess({
  receipt,
  onAgain,
}: {
  receipt: Receipt;
  onAgain: () => void;
}) {
  return (
    <SuccessPanel
      eyebrow="ສົ່ງຄຳຂໍແລ້ວ"
      title="Withdrawal requested"
      lead={`We are sending ${formatUsd(receipt.amountUsd)} to your ${shortBank(receipt.account.bank)} account. That is about ${formatLak(receipt.landsLak)} at today's rate.`}
      reference={receipt.reference}
      rows={[
        {
          label: "You withdraw",
          labelLo: "ທ່ານຖອນ",
          value: formatUsd(receipt.amountUsd),
        },
        {
          label: "Lands in your bank",
          labelLo: "ເຂົ້າບັນຊີທະນາຄານ",
          value: `≈ ${formatLak(receipt.landsLak)}`,
        },
        {
          label: "To",
          labelLo: "ປາຍທາງ",
          value: `${shortBank(receipt.account.bank)} ${receipt.account.maskedNumber}`,
          numeric: false,
        },
      ]}
      steps={[
        `${formatUsd(receipt.amountUsd)} has left your available balance, so it can no longer be used to place orders.`,
        "We convert the dollars to kip at the rate at the moment the transfer is sent.",
        `Your bank credits ${receipt.account.maskedNumber}. You get a notification when the transfer leaves us.`,
      ]}
      timing={{ label: "Expected in your account in", value: PROCESSING }}
      note="The kip figure is an estimate. The rate used is the one at the time the transfer is sent, which may differ from the rate shown here."
      secondaryAction={{ label: "Make another withdrawal", onClick: onAgain }}
    />
  );
}
