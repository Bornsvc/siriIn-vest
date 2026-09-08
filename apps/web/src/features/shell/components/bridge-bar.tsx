"use client";

import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { USD_LAK } from "@/shared/lib/format";
import {
  formatCountdown,
  getMarketStatus,
  SESSION_COPY,
  type MarketStatus,
} from "@/shared/lib/market";

/**
 * The Bridge Bar.
 *
 * A Lao investor's money is in kip, the market they are buying is in dollars,
 * and it opens at 20:30 their time. Rather than bury that in a settings screen,
 * the whole app sits underneath it: two clocks, the session, and the rate.
 *
 * Rendered client-side after mount — a server-rendered clock would hydrate
 * as a mismatch the moment the minute rolled over.
 */
export function BridgeBar() {
  const [status, setStatus] = useState<MarketStatus | null>(null);

  useEffect(() => {
    const tick = () => setStatus(getMarketStatus());
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  const session = status ? SESSION_COPY[status.state] : null;
  const live = status?.state === "open";

  return (
    <div className="sticky top-0 z-40 h-9 border-b border-brand-900 bg-brand-950 text-white">
      <div className="bg-grid flex h-full items-center gap-5 overflow-x-auto px-4 text-[12px] scrollbar-thin sm:px-6">
        {/* Two clocks — the gap between them is the product. */}
        <div className="flex shrink-0 items-center gap-3 font-mono">
          <Clock city="ວຽງຈັນ" abbr="VTE" time={status?.vientianeTime} />
          <span aria-hidden className="text-brand-300/50">
            ⇄
          </span>
          <Clock city="ນິວຢອກ" abbr="NYC" time={status?.newYorkTime} />
        </div>

        <span aria-hidden className="h-3.5 w-px shrink-0 bg-white/15" />

        {/* Session state */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="relative flex size-1.5">
            {live ? (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-300 opacity-60" />
            ) : null}
            <span
              className={cn(
                "relative inline-flex size-1.5 rounded-full",
                live ? "bg-brand-300" : "bg-white/35",
              )}
            />
          </span>
          <span className="lao text-brand-100">
            {session?.lo ?? "ກຳລັງໂຫຼດ"}
          </span>
          {/* On the narrowest screens the rate outranks the countdown, so the
              countdown is what gives way rather than scrolling the rate off. */}
          {status && session ? (
            <span className="hidden text-white/45 sm:inline">
              <span className="lao">{session.next.lo}</span>{" "}
              <span data-numeric className="font-mono text-white/70">
                {formatCountdown(status.minutesToChange)}
              </span>
            </span>
          ) : null}
        </div>

        <span aria-hidden className="h-3.5 w-px shrink-0 bg-white/15" />

        {/* The rate every deposit is converted at */}
        <div className="flex shrink-0 items-center gap-2 font-mono">
          <span className="text-white/45">1&nbsp;USD</span>
          <span aria-hidden className="text-brand-300/50">
            =
          </span>
          <span data-numeric className="font-medium text-brand-100">
            ₭{USD_LAK.toLocaleString("en-US")}
          </span>
        </div>

        <p className="lao ml-auto hidden shrink-0 text-[11px] text-white/35 lg:block">
          ອັດຕາແລກປ່ຽນອ້າງອີງ · ປັບປຸງທຸກໆ 15 ນາທີ
        </p>
      </div>
    </div>
  );
}

function Clock({
  city,
  abbr,
  time,
}: {
  city: string;
  abbr: string;
  time?: string;
}) {
  return (
    <span className="flex items-baseline gap-1.5">
      <abbr
        title={city}
        className="text-[10px] uppercase tracking-[0.08em] text-white/40 no-underline"
      >
        {abbr}
      </abbr>
      <span
        data-numeric
        className={cn(
          "font-medium tabular-nums transition-opacity",
          time ? "opacity-100" : "opacity-30",
        )}
      >
        {time ?? "--:--"}
      </span>
    </span>
  );
}
