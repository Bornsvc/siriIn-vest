/**
 * NYSE session state, expressed for someone sitting in Vientiane.
 *
 * The whole product turns on this gap: the market a Lao investor buys into
 * opens at 20:30 their time and closes at 03:00. The shell keeps both clocks
 * visible so that is never a surprise.
 */

export const NEW_YORK_TZ = "America/New_York";
export const VIENTIANE_TZ = "Asia/Vientiane";

export type SessionState = "pre" | "open" | "after" | "closed";

export type MarketStatus = {
  state: SessionState;
  /** Minutes until the next session boundary. */
  minutesToChange: number;
  newYorkTime: string;
  vientianeTime: string;
};

const OPEN_MIN = 9 * 60 + 30; // 09:30 ET
const CLOSE_MIN = 16 * 60; // 16:00 ET
const PRE_MIN = 4 * 60; // 04:00 ET
const AFTER_MIN = 20 * 60; // 20:00 ET

type ZonedParts = { minutes: number; weekday: number; clock: string };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function zonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "0";

  // Intl renders midnight as "24" in some engines; normalise it.
  const hour = Number(get("hour")) % 24;
  const minute = Number(get("minute"));
  const weekday = Math.max(0, WEEKDAYS.indexOf(get("weekday")));

  return {
    minutes: hour * 60 + minute,
    weekday,
    clock: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  };
}

export function getMarketStatus(now: Date = new Date()): MarketStatus {
  const ny = zonedParts(now, NEW_YORK_TZ);
  const vte = zonedParts(now, VIENTIANE_TZ);
  const isWeekend = ny.weekday === 0 || ny.weekday === 6;

  let state: SessionState = "closed";
  let minutesToChange = 0;

  if (isWeekend) {
    // Monday pre-market is the next thing that happens.
    const daysToMonday = ny.weekday === 6 ? 2 : 1;
    minutesToChange = daysToMonday * 24 * 60 - ny.minutes + OPEN_MIN;
  } else if (ny.minutes >= OPEN_MIN && ny.minutes < CLOSE_MIN) {
    state = "open";
    minutesToChange = CLOSE_MIN - ny.minutes;
  } else if (ny.minutes >= PRE_MIN && ny.minutes < OPEN_MIN) {
    state = "pre";
    minutesToChange = OPEN_MIN - ny.minutes;
  } else if (ny.minutes >= CLOSE_MIN && ny.minutes < AFTER_MIN) {
    state = "after";
    minutesToChange = AFTER_MIN - ny.minutes;
  } else {
    // Overnight — next open is later today or tomorrow.
    minutesToChange =
      ny.minutes < PRE_MIN
        ? OPEN_MIN - ny.minutes
        : 24 * 60 - ny.minutes + OPEN_MIN;
  }

  return {
    state,
    minutesToChange,
    newYorkTime: ny.clock,
    vientianeTime: vte.clock,
  };
}

/** "2h 16m" / "48m" — countdown to the next boundary. */
export function formatCountdown(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) return `${mins}m`;
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${mins}m`;
}

export const SESSION_COPY: Record<
  SessionState,
  { lo: string; en: string; next: { lo: string; en: string } }
> = {
  open: {
    lo: "ຕະຫຼາດເປີດ",
    en: "Market open",
    next: { lo: "ປິດໃນ", en: "closes in" },
  },
  pre: {
    lo: "ກ່ອນເປີດຕະຫຼາດ",
    en: "Pre-market",
    next: { lo: "ເປີດໃນ", en: "opens in" },
  },
  after: {
    lo: "ຫຼັງປິດຕະຫຼາດ",
    en: "After hours",
    next: { lo: "ສິ້ນສຸດໃນ", en: "ends in" },
  },
  closed: {
    lo: "ຕະຫຼາດປິດ",
    en: "Market closed",
    next: { lo: "ເປີດໃນ", en: "opens in" },
  },
};
