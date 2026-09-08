"use client";

import { useEffect, useState } from "react";
import { USD_LAK } from "@/shared/lib/format";
import {
  formatCountdown,
  getMarketStatus,
  SESSION_COPY,
  type MarketStatus,
} from "@/shared/lib/market";

/**
 * The landing hero, drawn as the one fact the whole product exists to solve:
 * two cities, one market, and the hours and exchange rate between them.
 * Live, because a static picture of it would be a claim rather than a proof.
 */
export function LiveBridge() {
  const [status, setStatus] = useState<MarketStatus | null>(null);

  useEffect(() => {
    const tick = () => setStatus(getMarketStatus());
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  const session = status ? SESSION_COPY[status.state] : null;
  const open = status?.state === "open";

  return (
    <figure className="relative rounded-card border border-white/12 bg-white/[0.03] p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <City abbr="VTE" name="ວຽງຈັນ" nameEn="Vientiane" time={status?.vientianeTime} />

        {/* The bridge itself. */}
        <div className="relative min-w-0 flex-1 px-2">
          <svg
            viewBox="0 0 200 40"
            preserveAspectRatio="none"
            aria-hidden
            className="h-10 w-full"
          >
            <path
              d="M4 32 Q 100 2 196 32"
              fill="none"
              stroke="currentColor"
              className="text-brand-500/45"
              strokeWidth="1"
              strokeDasharray="3 4"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx="4" cy="32" r="2.5" className="fill-brand-300" />
            <circle cx="196" cy="32" r="2.5" className="fill-brand-300" />
          </svg>
          <p
            data-numeric
            className="mt-1 text-center font-mono text-[11px] text-white/45"
          >
            {status ? `+7h · ${formatCountdown(status.minutesToChange)}` : "+7h"}
          </p>
        </div>

        <City
          abbr="NYC"
          name="ນິວຢອກ"
          nameEn="New York"
          time={status?.newYorkTime}
          align="right"
        />
      </div>

      <figcaption className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-5 text-[13px]">
        <span className="flex items-center gap-2">
          <span className="relative flex size-1.5">
            {open ? (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-300 opacity-60" />
            ) : null}
            <span
              className={`relative inline-flex size-1.5 rounded-full ${open ? "bg-brand-300" : "bg-white/35"}`}
            />
          </span>
          <span className="lao text-brand-100">{session?.lo ?? "—"}</span>
          {status && session ? (
            <span className="text-white/45">
              <span className="lao">{session.next.lo}</span>{" "}
              <span data-numeric className="font-mono text-white/70">
                {formatCountdown(status.minutesToChange)}
              </span>
            </span>
          ) : null}
        </span>

        <span className="flex items-center gap-2 font-mono">
          <span className="text-white/45">1 USD</span>
          <span aria-hidden className="text-brand-500/60">
            =
          </span>
          <span data-numeric className="font-medium text-brand-100">
            ₭{USD_LAK.toLocaleString("en-US")}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

function City({
  abbr,
  name,
  nameEn,
  time,
  align = "left",
}: {
  abbr: string;
  name: string;
  nameEn: string;
  time?: string;
  align?: "left" | "right";
}) {
  return (
    <div className={`shrink-0 ${align === "right" ? "text-right" : ""}`}>
      <p
        data-numeric
        className={`font-display text-[26px] font-medium leading-none tracking-tight text-white transition-opacity sm:text-[32px] ${
          time ? "opacity-100" : "opacity-25"
        }`}
      >
        {time ?? "--:--"}
      </p>
      <p className="lao mt-2 text-[12px] leading-none text-brand-200">{name}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-white/35">
        {abbr} · {nameEn}
      </p>
    </div>
  );
}
