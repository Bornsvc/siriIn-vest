import {
  formatLak,
  formatUsd,
  lakToUsd,
  usdToLak,
  USD_LAK,
} from "@/shared/lib/format";

/**
 * The kip⇄dollar bridge, in one place.
 *
 * A customer holds kip and buys a market priced in dollars, so a conversion
 * happens on every deposit and every withdrawal. The rule this file exists to
 * enforce: the rate and the converted figure are shown at the moment the
 * customer types the amount, never revealed at the end.
 */

export type Currency = "LAK" | "USD";

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  LAK: "₭",
  USD: "$",
};

export const CURRENCY_LABEL_LO: Record<Currency, string> = {
  LAK: "ກີບລາວ",
  USD: "ໂດລາສະຫະລັດ",
};

/** Floors that keep a transfer worth the bank's processing cost. */
export const MIN_DEPOSIT: Record<Currency, number> = {
  LAK: 200_000,
  USD: 10,
};

export const MIN_WITHDRAW_USD = 10;

/** Round numbers a Lao customer actually transfers. */
export const QUICK_AMOUNTS: Record<Currency, number[]> = {
  LAK: [500_000, 1_000_000, 2_000_000, 5_000_000],
  USD: [25, 50, 100, 250],
};

/** The line every panel repeats so the rate is never a surprise. */
export const RATE_LINE = `1 USD = ${formatLak(USD_LAK)}`;

export function otherCurrency(currency: Currency): Currency {
  return currency === "LAK" ? "USD" : "LAK";
}

/** Money rendered in the currency it is actually held in. */
export function formatMoney(value: number, currency: Currency): string {
  return currency === "LAK" ? formatLak(value) : formatUsd(value);
}

/** Cross the bridge: kip in, dollars out — or the other way. */
export function convert(amount: number, from: Currency): number {
  return from === "LAK" ? lakToUsd(amount) : usdToLak(amount);
}

/* ------------------------------------------------------------------ *
 * Amount input
 *
 * Kip amounts run to eight digits, so the field groups thousands while
 * the customer types. Grouping is done on the digit string rather than
 * through Number() so a long paste can never lose precision.
 * ------------------------------------------------------------------ */

const MAX_INTEGER_DIGITS = 12;

export function normalizeAmountInput(raw: string, currency: Currency): string {
  const allowDecimal = currency === "USD";
  let cleaned = raw.replace(/[^\d.]/g, "");
  if (!allowDecimal) cleaned = cleaned.replace(/\./g, "");

  const dot = cleaned.indexOf(".");
  const head = (dot === -1 ? cleaned : cleaned.slice(0, dot)).slice(
    0,
    MAX_INTEGER_DIGITS,
  );
  const tail =
    dot === -1 ? "" : cleaned.slice(dot + 1).replace(/\./g, "").slice(0, 2);

  const trimmed = head.replace(/^0+(?=\d)/, "");
  const grouped = trimmed.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (dot === -1) return grouped;
  return `${grouped === "" ? "0" : grouped}.${tail}`;
}

export function parseAmountInput(raw: string): number {
  const cleaned = raw.replace(/,/g, "");
  if (cleaned === "" || cleaned === ".") return 0;
  const value = Number(cleaned);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/** Seed the field from a quick-amount button or a "Max" press. */
export function toAmountInput(value: number, currency: Currency): string {
  const fixed =
    currency === "USD" ? value.toFixed(2) : String(Math.round(value));
  return normalizeAmountInput(fixed, currency);
}

export function countDigits(value: string): number {
  let count = 0;
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code >= 48 && code <= 57) count += 1;
  }
  return count;
}

/** Where the caret belongs after regrouping, counted in digits not characters. */
export function caretAfterDigits(value: string, digits: number): number {
  if (digits <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code >= 48 && code <= 57) {
      seen += 1;
      if (seen === digits) return i + 1;
    }
  }
  return value.length;
}

/** A client-side stand-in for the reference the transfer desk would issue. */
export function makeReference(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-7)}`;
}

export { USD_LAK, usdToLak, lakToUsd };
