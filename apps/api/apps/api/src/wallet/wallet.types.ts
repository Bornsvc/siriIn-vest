import { FxRateView } from '../fx/fx.types';

/**
 * Money crosses the wire as decimal strings, never JSON numbers. A JSON number
 * is a float64, and a float64 cannot hold 0.1 — which is how a balance ends up
 * a cent out with nobody able to say where it went.
 */
export interface WalletSummary {
  cash: {
    /** Settled and available to trade with. */
    settledUsd: string;
    /** Deposits on their way in, not yet spendable. */
    pendingUsd: string;
  };
  fx: FxRateView;
}

export type TransferKindValue = 'deposit' | 'withdrawal';
export type TransferStatusValue = 'pending' | 'settled' | 'failed';

export interface TransferView {
  id: string;
  reference: string;
  kind: TransferKindValue;
  status: TransferStatusValue;
  amountKip: string;
  amountUsd: string;
  /** Which side the customer typed; the other was derived. */
  enteredIn: 'lak' | 'usd';
  /** The rate this transfer was fixed at, not today's. */
  usdLak: string;
  requestedAt: string;
  settledAt: string | null;
  failureReason: string | null;
}

export interface TransferPage {
  transfers: TransferView[];
  /** Pass back as `cursor` for the next page. Null when there are no more. */
  nextCursor: string | null;
}
