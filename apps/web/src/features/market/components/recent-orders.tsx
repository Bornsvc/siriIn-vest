import type { Order, OrderStatus } from "@/shared/types";
import { formatDate, formatShares, formatUsd } from "@/shared/lib/format";
import { Badge, Card, CardHeader, EmptyState, RowList } from "@/shared/ui";

/**
 * This symbol's order history. Dates are absolute rather than relative — a
 * relative time would render differently on the server and the client.
 */

const STATUS_TONE: Record<OrderStatus, "brand" | "warn" | "neutral"> = {
  filled: "brand",
  pending: "warn",
  cancelled: "neutral",
};

export function RecentOrders({
  symbol,
  orders,
}: {
  symbol: string;
  orders: Order[];
}) {
  return (
    <Card>
      <CardHeader
        eyebrow="ຄຳສັ່ງຫຼ້າສຸດ"
        title="Recent orders"
        action={
          orders.length > 0 ? (
            <span data-numeric className="text-[12px] text-ink-400">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          ) : null
        }
      />

      {orders.length > 0 ? (
        <RowList>
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-3 px-5 py-3.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium leading-tight text-ink-950">
                  {order.side === "buy" ? "Buy" : "Sell"}{" "}
                  <span data-numeric>{formatShares(order.shares)}</span>{" "}
                  {order.shares === 1 ? "share" : "shares"}
                  <span aria-hidden className="mx-1.5 text-ink-200">
                    ·
                  </span>
                  <span className="font-normal text-ink-400">
                    {order.type === "limit" ? "Limit" : "Market"}
                  </span>
                </p>
                <p className="mt-1 truncate text-[12px] leading-tight text-ink-400">
                  <span data-numeric className="font-mono">
                    {order.id}
                  </span>
                  <span aria-hidden className="mx-1.5 text-ink-200">
                    ·
                  </span>
                  <span data-numeric>{formatDate(order.placedAt)}</span>
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p
                  data-numeric
                  className="font-display text-[13.5px] font-medium leading-tight tracking-tight text-ink-950"
                >
                  {formatUsd(order.price)}
                </p>
                <span className="mt-1 inline-block">
                  <Badge tone={STATUS_TONE[order.status]}>
                    {order.status}
                  </Badge>
                </span>
              </div>
            </div>
          ))}
        </RowList>
      ) : (
        <EmptyState
          title={`No ${symbol} orders yet`}
          body={`Orders you place for this symbol appear here with their fill price and status. Use Buy ${symbol} below to place your first.`}
        />
      )}
    </Card>
  );
}
