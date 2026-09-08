export type Range = "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y";

export const RANGES: Range[] = ["1D", "1W", "1M", "3M", "1Y", "5Y"];

export type Sector =
  | "Technology"
  | "Finance"
  | "Health"
  | "Consumer"
  | "Energy";

export type AssetKind = "stock" | "etf";

export type Stock = {
  symbol: string;
  name: string;
  kind: AssetKind;
  sector: Sector;
  /** Brand hue used for the monogram tile — we draw marks, not logos. */
  brandColor: string;
  price: number;
  /** Absolute change in USD over the current session. */
  change: number;
  changePct: number;
  marketCap: number;
  peRatio: number | null;
  volume: number;
  dayHigh: number;
  dayLow: number;
  weekHigh52: number;
  weekLow52: number;
  dividendYield: number | null;
  about: string;
  aboutLo: string;
};

export type Holding = {
  symbol: string;
  shares: number;
  avgCost: number;
};

/** A holding joined with its live quote. Produced by `getPositions()`. */
export type Position = Holding & {
  stock: Stock;
  value: number;
  cost: number;
  gain: number;
  gainPct: number;
  /** Share of total portfolio value, 0–1. */
  weight: number;
};

export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit";
export type OrderStatus = "filled" | "pending" | "cancelled";

export type Order = {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  shares: number;
  /** Execution price for filled orders, limit price for pending ones. */
  price: number;
  fees: number;
  status: OrderStatus;
  placedAt: string;
};

export type NotificationKind =
  | "order"
  | "account"
  | "price"
  | "promotion";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  at: string;
  read: boolean;
};

export type TransferKind = "deposit" | "withdrawal";
export type TransferStatus = "completed" | "processing" | "failed";

export type Transfer = {
  id: string;
  kind: TransferKind;
  /** Amount in the currency the customer moved, before conversion. */
  amount: number;
  currency: "LAK" | "USD";
  method: string;
  status: TransferStatus;
  at: string;
};

export type BankAccount = {
  id: string;
  bank: string;
  holder: string;
  /** Masked — we never hold a full account number in the client. */
  maskedNumber: string;
  isDefault: boolean;
};

export type KycStatus = "unverified" | "pending" | "verified";

export type User = {
  name: string;
  email: string;
  phone: string;
  initials: string;
  kycStatus: KycStatus;
  joinedAt: string;
};

export type Wallet = {
  /** Settled cash available to trade or withdraw, in USD. */
  availableUsd: number;
  /** Deposits still converting or clearing. */
  pendingUsd: number;
};
