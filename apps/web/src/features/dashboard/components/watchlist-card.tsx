import Link from "next/link";
import { getStock, WATCHLIST } from "@/mock/stocks";
import { Card, CardHeader } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/feedback";
import { ButtonLink } from "@/shared/ui/button";
import { RowList, StockRow } from "@/shared/ui/stock-row";

export function WatchlistCard() {
  const stocks = WATCHLIST.map(getStock).filter((stock) => stock !== undefined);

  return (
    <Card>
      <CardHeader
        eyebrow="ລາຍການຕິດຕາມ"
        title="Watchlist"
        action={
          <Link
            href="/market"
            className="text-[13px] font-medium text-brand-700 hover:text-brand-800"
          >
            Edit
          </Link>
        }
      />
      {stocks.length === 0 ? (
        <EmptyState
          title="Nothing on your watchlist"
          body="Follow a stock to keep its price in view without owning it."
          action={
            <ButtonLink href="/market" variant="secondary" size="sm">
              Browse the market
            </ButtonLink>
          }
        />
      ) : (
        <RowList>
          {stocks.map((stock) => (
            <StockRow key={stock.symbol} stock={stock} dense />
          ))}
        </RowList>
      )}
    </Card>
  );
}
