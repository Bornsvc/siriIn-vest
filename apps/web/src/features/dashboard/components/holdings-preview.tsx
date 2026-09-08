import Link from "next/link";
import { getPositions } from "@/mock/selectors";
import { formatShares, formatUsd } from "@/shared/lib/format";
import { Card, CardHeader } from "@/shared/ui/card";
import { Delta } from "@/shared/ui/delta";
import { EmptyState } from "@/shared/ui/feedback";
import { ButtonLink } from "@/shared/ui/button";
import { RowList, StockRow } from "@/shared/ui/stock-row";

export function HoldingsPreview() {
  const positions = getPositions().slice(0, 5);

  return (
    <Card>
      <CardHeader
        eyebrow="ຫຸ້ນທີ່ຖືຄອງ"
        title="Your holdings"
        action={
          <Link
            href="/portfolio"
            className="text-[13px] font-medium text-brand-700 hover:text-brand-800"
          >
            See all
          </Link>
        }
      />
      {positions.length === 0 ? (
        <EmptyState
          title="You don't own anything yet"
          body="Fund your account in kip, then buy your first U.S. stock or ETF."
          action={<ButtonLink href="/market">Explore the market</ButtonLink>}
        />
      ) : (
        <RowList>
          {positions.map((position) => (
            <StockRow
              key={position.symbol}
              stock={position.stock}
              subtitle={`${formatShares(position.shares)} shares · avg ${formatUsd(position.avgCost)}`}
              trailing={
                <div className="shrink-0 text-right">
                  <p
                    data-numeric
                    className="font-display text-[14px] font-medium leading-tight tracking-tight text-ink-950"
                  >
                    {formatUsd(position.value)}
                  </p>
                  <Delta
                    value={position.gainPct}
                    size="sm"
                    className="leading-tight"
                  />
                </div>
              }
            />
          ))}
        </RowList>
      )}
    </Card>
  );
}
