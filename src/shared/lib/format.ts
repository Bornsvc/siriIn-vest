/** Indicative kip rate. Real builds pull this from the FX desk. */
export const USD_LAK = 21_650;

export function usdToLak(usd: number): number {
  return usd * USD_LAK;
}

export function lakToUsd(lak: number): number {
  return lak / USD_LAK;
}

/** $1,793.20 — always two decimals, money is never rounded away. */
export function formatUsd(value: number, opts?: { sign?: boolean }): string {
  const body = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  if (!opts?.sign) return value < 0 ? `-${body}` : body;
  return `${value < 0 ? "−" : "+"}${body}`;
}

/** ₭38,819,180 — kip has no minor unit in practice. */
export function formatLak(value: number): string {
  return `₭${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(value))}`;
}

/** +2.45% / −1.23% — true minus sign, not a hyphen. */
export function formatPct(value: number, opts?: { sign?: boolean }): string {
  const body = `${Math.abs(value).toFixed(2)}%`;
  if (!opts?.sign) return value < 0 ? `−${body}` : body;
  return `${value < 0 ? "−" : "+"}${body}`;
}

/** 1.2T / 3.4B / 890M — for market cap and volume. */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

/** Fractional shares are real; show up to 4 places but trim trailing zeros. */
export function formatShares(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4,
  }).format(value);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** "2 minutes ago" — relative to a caller-supplied now, so it stays testable. */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, "hour");
  return rtf.format(-Math.round(hours / 24), "day");
}

export type Direction = "up" | "down" | "flat";

export function directionOf(value: number): Direction {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}
