import type { ReactNode } from "react";
import type { Position } from "@/shared/types";
import { formatShares, formatUsd } from "@/shared/lib/format";
import { Card, CardBody, CardHeader, Delta, Money } from "@/shared/ui";

/**
 * Shown only when the customer already holds the symbol. Every figure comes
 * from `getPositionFor` so this card can never disagree with the portfolio.
 */
export function PositionCard({ position }: { position: Position }) {
  return (
    <Card>
      <CardHeader
        eyebrow="ສະຖານະຂອງທ່ານ"
        title="Your position"
        action={
          <span data-numeric className="text-[12px] text-ink-400">
            {formatShares(position.shares)}{" "}
            {position.shares === 1 ? "share" : "shares"}
          </span>
        }
      />
      <CardBody className="space-y-3">
        <Line label="Shares" value={formatShares(position.shares)} />
        <Line label="Average cost" value={formatUsd(position.avgCost)} />
        <Line label="Market value" value={formatUsd(position.value)} />

        <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
          <span className="text-[13px] text-ink-500">Total return</span>
          <span className="flex flex-wrap items-baseline justify-end gap-x-2">
            <Money
              value={position.gain}
              signed
              className="font-display text-[15px] font-medium tracking-tight"
            />
            <Delta value={position.gainPct} size="sm" />
          </span>
        </div>
      </CardBody>
    </Card>
  );
}

function Line({ label, value }: { label: ReactNode; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[13px] text-ink-500">{label}</span>
      <span data-numeric className="text-[13px] font-medium text-ink-950">
        {value}
      </span>
    </div>
  );
}
