/**
 * The floors the deposit and withdrawal forms already enforce, kept in step
 * with `apps/web/src/features/wallet/lib/currency.ts`. They exist so a
 * transfer is worth the bank's processing cost, not to be difficult.
 */
export const MIN_DEPOSIT_KIP = 200_000;
export const MIN_DEPOSIT_USD = 10;
export const MIN_WITHDRAW_USD = 10;

/** Above this, a transfer is almost certainly a typo. */
const MAX_TRANSFER_USD = 1_000_000;

export const CURRENCIES = ['lak', 'usd'] as const;
export type CurrencyValue = (typeof CURRENCIES)[number];

export function validateCurrency(value: unknown): string | null {
  return CURRENCIES.includes(value as CurrencyValue)
    ? null
    : 'Choose kip or dollars.';
}

/**
 * A money amount arriving as JSON. Rejects the shapes a number can take that
 * an amount cannot — infinities, negatives, more precision than a currency
 * has — before any of it reaches a decimal column.
 */
function amount(what: string) {
  return (value: unknown): string | null => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return `Enter the amount you want to ${what}.`;
    }
    if (value <= 0) return `Enter an amount greater than zero.`;
    if (value > MAX_TRANSFER_USD * 30_000) {
      return 'That amount is larger than we can process. Check the figure.';
    }
    // Two decimal places is all either currency carries.
    if (Math.round(value * 100) !== Number((value * 100).toFixed(0))) {
      return 'Amounts go to two decimal places.';
    }
    return null;
  };
}

export const validateDepositAmount = amount('deposit');
export const validateWithdrawAmount = amount('withdraw');
