import type { ReactNode } from "react";
import type { Stock } from "@/shared/types";
import { cn } from "@/shared/lib/cn";
import { formatCompact, formatPct, formatUsd } from "@/shared/lib/format";
import { Card, CardBody, CardHeader } from "@/shared/ui";

/**
 * The six figures that decide whether a customer reads further. A missing
 * value shows an em dash rather than a zero — an ETF has no P/E, and pretending
 * otherwise is worse than saying nothing.
 */
export function KeyStatistics({ stock }: { stock: Stock }) {
  return (
    <Card>
      <CardHeader eyebrow="ສະຖິຕິສຳຄັນ" title="Key statistics" />
      <CardBody className="grid grid-cols-2 gap-x-4 gap-y-5">
        <Stat label="Market cap" value={`$${formatCompact(stock.marketCap)}`} />
        <Stat
          label="P/E ratio"
          value={stock.peRatio === null ? null : stock.peRatio.toFixed(1)}
        />
        <Stat label="Volume" value={formatCompact(stock.volume)} />
        <Stat
          label="Dividend yield"
          value={
            stock.dividendYield === null ? null : formatPct(stock.dividendYield)
          }
        />
        <Stat
          label="Day range"
          compact
          value={`${formatUsd(stock.dayLow)} – ${formatUsd(stock.dayHigh)}`}
        />
        <Stat
          label="52-week range"
          compact
          value={`${formatUsd(stock.weekLow52)} – ${formatUsd(stock.weekHigh52)}`}
        />
      </CardBody>
    </Card>
  );
}

function Stat({
  label,
  value,
  compact,
}: {
  label: ReactNode;
  /** `null` renders the em dash — the figure does not exist for this asset. */
  value: string | null;
  compact?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11.5px] leading-none text-ink-400">{label}</p>
      <p
        data-numeric
        className={cn(
          "mt-1.5 font-display font-medium leading-none tracking-tight",
          compact ? "text-[13px]" : "text-[16px]",
          value === null ? "text-ink-300" : "text-ink-950",
        )}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}
