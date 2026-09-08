import { PageHeader } from "@/features/shell";
import { ButtonLink, Card, EmptyState } from "@/shared/ui";

/**
 * Reached when `notFound()` fires for a symbol we do not list. The action is
 * the point: send the customer back to something they can actually buy.
 */
export default function StockNotFound() {
  return (
    <>
      <PageHeader eyebrow="ບໍ່ພົບຫຼັກຊັບ" title="Symbol not found" />

      <Card>
        <EmptyState
          title="We do not list that symbol"
          body="SiriInvest carries a curated set of U.S. stocks and ETFs. Search the market to see everything you can buy from Laos today."
          action={<ButtonLink href="/market">Browse the market</ButtonLink>}
        />
      </Card>
    </>
  );
}
