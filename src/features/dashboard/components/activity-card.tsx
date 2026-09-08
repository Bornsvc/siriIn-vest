import Link from "next/link";
import { getOrdersFor } from "@/mock/selectors";
import { getStock } from "@/mock/stocks";
import { formatShares, formatUsd } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Card, CardHeader } from "@/shared/ui/card";
import { Monogram } from "@/shared/ui/monogram";

const STATUS_TONE = {
  filled: "gain",
  pending: "warn",
  cancelled: "neutral",
} as const;

/** Absolute timestamps, not "2 hours ago" — an order log is a record. */
function stamp(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Vientiane",
  }).format(new Date(iso));
}

export function ActivityCard() {
  const orders = getOrdersFor().slice(0, 5);

  return (
    <Card>
      <CardHeader
        eyebrow="ຄຳສັ່ງຫຼ້າສຸດ"
        title="Recent orders"
        action={
          <Link
            href="/portfolio"
            className="text-[13px] font-medium text-brand-700 hover:text-brand-800"
          >
            History
          </Link>
        }
      />
      <ul className="divide-y divide-line">
        {orders.map((order) => {
          const stock = getStock(order.symbol);
          return (
            <li key={order.id} className="flex items-center gap-3 px-5 py-3">
              {stock ? (
                <Monogram
                  symbol={stock.symbol}
                  color={stock.brandColor}
                  size="sm"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] leading-tight text-ink-950">
                  <span className="font-medium capitalize">{order.side}</span>{" "}
                  <span data-numeric>{formatShares(order.shares)}</span>{" "}
                  <span className="font-display font-medium">
                    {order.symbol}
                  </span>
                </p>
                <p
                  data-numeric
                  className="mt-0.5 truncate font-mono text-[11px] leading-tight text-ink-400"
                >
                  {stamp(order.placedAt)} · {formatUsd(order.price)}
                </p>
              </div>
              <Badge tone={STATUS_TONE[order.status]}>{order.status}</Badge>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
