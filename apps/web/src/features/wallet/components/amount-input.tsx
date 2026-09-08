"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import {
  caretAfterDigits,
  countDigits,
  CURRENCY_SYMBOL,
  normalizeAmountInput,
  type Currency,
} from "../lib/currency";

/**
 * Large money field. The symbol sits outside the input so the field can grow
 * a trailing action ("Max") without fighting the shared input padding, and the
 * ring is carried by the wrapper on `focus-within` so keyboard focus stays
 * obvious.
 */
export function AmountInput({
  id,
  currency,
  value,
  onValueChange,
  invalid,
  describedBy,
  trailing,
}: {
  id: string;
  currency: Currency;
  value: string;
  onValueChange: (next: string) => void;
  invalid?: boolean;
  describedBy?: string;
  trailing?: ReactNode;
}) {
  const ref = useRef<HTMLInputElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const element = event.target;
    const caret = element.selectionStart ?? element.value.length;
    const digitsBefore = countDigits(element.value.slice(0, caret));
    const next = normalizeAmountInput(element.value, currency);

    onValueChange(next);

    // Regrouping shifts characters around; put the caret back where the
    // customer left it, counted in digits rather than characters.
    requestAnimationFrame(() => {
      const input = ref.current;
      if (!input || input.value !== next) return;
      const position = caretAfterDigits(next, digitsBefore);
      input.setSelectionRange(position, position);
    });
  }

  return (
    <div
      className={cn(
        "flex h-14 items-center gap-2 rounded-[12px] border bg-white pl-4 pr-2 transition-colors",
        "focus-within:ring-2 focus-within:ring-brand-500/20",
        invalid
          ? "border-loss focus-within:border-loss"
          : "border-line-strong hover:border-brand-300 focus-within:border-brand-600",
      )}
    >
      <span
        aria-hidden
        className="select-none font-display text-[20px] leading-none text-ink-300"
      >
        {CURRENCY_SYMBOL[currency]}
      </span>
      <input
        ref={ref}
        id={id}
        data-numeric
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0"
        value={value}
        onChange={handleChange}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="min-w-0 flex-1 bg-transparent font-display text-[22px] font-medium tracking-tight text-ink-950 placeholder:font-normal placeholder:text-ink-300 focus:outline-none"
      />
      <span className="shrink-0 text-[12px] font-medium uppercase tracking-[0.06em] text-ink-300">
        {currency}
      </span>
      {trailing ? <span className="shrink-0">{trailing}</span> : null}
    </div>
  );
}

/** Round-number shortcuts — the amounts people actually transfer. */
export function QuickAmounts({
  amounts,
  currency,
  active,
  onPick,
  format,
}: {
  amounts: number[];
  currency: Currency;
  active: number;
  onPick: (value: number) => void;
  format: (value: number, currency: Currency) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {amounts.map((amount) => {
        const selected = active === amount;
        return (
          <button
            key={amount}
            type="button"
            aria-pressed={selected}
            onClick={() => onPick(amount)}
            data-numeric
            className={cn(
              "h-9 rounded-pill border px-3.5 text-[13px] font-medium transition-colors",
              selected
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-line-strong bg-white text-ink-500 hover:border-brand-300 hover:text-brand-800",
            )}
          >
            {format(amount, currency)}
          </button>
        );
      })}
    </div>
  );
}
