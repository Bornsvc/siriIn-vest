import type {
  AppNotification,
  BankAccount,
  Holding,
  Order,
  Transfer,
  User,
  Wallet,
} from "@/shared/types";

export const USER: User = {
  name: "Sayasith Souvannachack",
  email: "sayasith@email.com",
  phone: "+856 20 5551 8842",
  initials: "SS",
  kycStatus: "verified",
  joinedAt: "2025-03-14T09:12:00+07:00",
};

export const WALLET: Wallet = {
  availableUsd: 2_450.0,
  pendingUsd: 320.0,
};

/**
 * Cost basis, not market value — value and P/L are derived in `selectors.ts`
 * so a quote change never leaves the portfolio disagreeing with itself.
 */
export const HOLDINGS: Holding[] = [
  { symbol: "AAPL", shares: 19.8885, avgCost: 159.46 },
  { symbol: "NVDA", shares: 5, avgCost: 408.01 },
  { symbol: "MSFT", shares: 3, avgCost: 383.75 },
  { symbol: "TSLA", shares: 4.3956, avgCost: 261.9 },
  { symbol: "AMZN", shares: 5.5323, avgCost: 167.79 },
  { symbol: "VOO", shares: 2.8, avgCost: 421.3 },
];

export const ORDERS: Order[] = [
  {
    id: "SI-4820193",
    symbol: "AAPL",
    side: "buy",
    type: "market",
    shares: 10,
    price: 179.32,
    fees: 1.0,
    status: "filled",
    placedAt: "2026-09-07T20:42:00+07:00",
  },
  {
    id: "SI-4819774",
    symbol: "NVDA",
    side: "buy",
    type: "limit",
    shares: 2,
    price: 475.0,
    fees: 1.0,
    status: "pending",
    placedAt: "2026-09-07T20:15:00+07:00",
  },
  {
    id: "SI-4817052",
    symbol: "VOO",
    side: "buy",
    type: "market",
    shares: 1.4,
    price: 444.18,
    fees: 1.0,
    status: "filled",
    placedAt: "2026-09-04T21:03:00+07:00",
  },
  {
    id: "SI-4811930",
    symbol: "TSLA",
    side: "sell",
    type: "market",
    shares: 1.2,
    price: 254.6,
    fees: 1.0,
    status: "filled",
    placedAt: "2026-08-29T22:37:00+07:00",
  },
  {
    id: "SI-4809118",
    symbol: "MSFT",
    side: "buy",
    type: "limit",
    shares: 1,
    price: 372.4,
    fees: 1.0,
    status: "cancelled",
    placedAt: "2026-08-22T20:51:00+07:00",
  },
  {
    id: "SI-4802664",
    symbol: "AMZN",
    side: "buy",
    type: "market",
    shares: 3.1,
    price: 166.02,
    fees: 1.0,
    status: "filled",
    placedAt: "2026-08-14T21:19:00+07:00",
  },
];

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    kind: "order",
    title: "Order filled",
    body: "Your order to buy 10 AAPL shares has been filled at $179.32.",
    at: "2026-09-07T20:42:00+07:00",
    read: false,
  },
  {
    id: "n2",
    kind: "account",
    title: "Deposit received",
    body: "₭21,650,000 has been received and converted to $1,000.00.",
    at: "2026-09-07T19:30:00+07:00",
    read: false,
  },
  {
    id: "n3",
    kind: "price",
    title: "Price alert",
    body: "TSLA is down 5% today and has crossed your $250.00 alert.",
    at: "2026-09-07T17:20:00+07:00",
    read: true,
  },
  {
    id: "n4",
    kind: "promotion",
    title: "Recurring investment is available",
    body: "Set a weekly amount and we will buy on every market open for you.",
    at: "2026-09-06T10:00:00+07:00",
    read: true,
  },
  {
    id: "n5",
    kind: "account",
    title: "Identity verified",
    body: "Your documents cleared review. Trading and withdrawals are unlocked.",
    at: "2026-09-02T14:05:00+07:00",
    read: true,
  },
];

export const TRANSFERS: Transfer[] = [
  {
    id: "t1",
    kind: "deposit",
    amount: 21_650_000,
    currency: "LAK",
    method: "BCEL One transfer",
    status: "completed",
    at: "2026-09-07T19:30:00+07:00",
  },
  {
    id: "t2",
    kind: "deposit",
    amount: 6_928_000,
    currency: "LAK",
    method: "QR payment",
    status: "processing",
    at: "2026-09-07T08:11:00+07:00",
  },
  {
    id: "t3",
    kind: "withdrawal",
    amount: 500,
    currency: "USD",
    method: "Bank transfer to BCEL",
    status: "completed",
    at: "2026-08-30T11:45:00+07:00",
  },
  {
    id: "t4",
    kind: "deposit",
    amount: 43_300_000,
    currency: "LAK",
    method: "Bank transfer (LDB)",
    status: "completed",
    at: "2026-08-12T15:02:00+07:00",
  },
];

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "b1",
    bank: "Banque Pour Le Commerce Extérieur Lao (BCEL)",
    holder: "Sayasith Souvannachack",
    maskedNumber: "•••• 4471",
    isDefault: true,
  },
  {
    id: "b2",
    bank: "Lao Development Bank",
    holder: "Sayasith Souvannachack",
    maskedNumber: "•••• 9028",
    isDefault: false,
  },
];

/** Deposit rails available in Laos today. Order matters — cheapest first. */
export const DEPOSIT_METHODS = [
  {
    id: "bank",
    name: "Bank transfer",
    nameLo: "ໂອນຜ່ານທະນາຄານ",
    detail: "From any Lao bank account in kip",
    fee: "Free",
    eta: "1–2 business days",
    available: true,
  },
  {
    id: "qr",
    name: "QR payment",
    nameLo: "ຈ່າຍຜ່ານ QR",
    detail: "Scan with BCEL One or your bank app",
    fee: "Free",
    eta: "Within 30 minutes",
    available: true,
  },
  {
    id: "card",
    name: "Debit card",
    nameLo: "ບັດເດບິດ",
    detail: "Coming soon",
    fee: "—",
    eta: "—",
    available: false,
  },
];
