"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { IconStar } from "@/shared/ui/icons";

/**
 * Following a symbol is a local preference in this MVP — nothing is persisted,
 * so the control owns its own state and says plainly what it did.
 */
export function WatchlistToggle({
  symbol,
  initial = false,
  className,
}: {
  symbol: string;
  initial?: boolean;
  className?: string;
}) {
  const [watching, setWatching] = useState(initial);

  return (
    <button
      type="button"
      aria-pressed={watching}
      onClick={() => setWatching((value) => !value)}
      title={watching ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-pill border px-3 text-[13px] font-medium transition-colors",
        watching
          ? "border-brand-200 bg-brand-50 text-brand-800"
          : "border-line-strong bg-white text-ink-500 hover:border-brand-300 hover:text-brand-800",
        className,
      )}
    >
      <IconStar
        className={cn("size-4", watching && "fill-brand-500 text-brand-600")}
      />
      <span className="hidden sm:inline">
        {watching ? "Watching" : "Watch"}
      </span>
      <span className="sr-only sm:hidden">
        {watching
          ? `Remove ${symbol} from watchlist`
          : `Add ${symbol} to watchlist`}
      </span>
    </button>
  );
}
