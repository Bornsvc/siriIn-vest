"use client";

import { useState } from "react";
import type { OrderSide, Stock } from "@/shared/types";
import { formatShares, formatUsd } from "@/shared/lib/format";
import { Button, Delta } from "@/shared/ui";
import { OrderTicket } from "./order-ticket";

/**
 * The action bar that follows the customer down the detail page, and the
 * ticket it opens. It is pinned above the mobile tab bar and clears the side
 * rail on wider screens so it never covers navigation.
 *
 * The ticket is mounted fresh per side, which is how its state resets on close.
 */
export function TradeActions({
  stock,
  heldShares,
  availableUsd,
}: {
  stock: Stock;
  heldShares: number;
  availableUsd: number;
}) {
  const [side, setSide] = useState<OrderSide | null>(null);

  return (
    <>
      <div className="fixed inset-x-0 bottom-[calc(54px_+_env(safe-area-inset-bottom))] z-30 border-t border-line bg-surface/95 backdrop-blur-md md:bottom-0 md:left-[72px] lg:left-[248px]">
        <div className="mx-auto flex w-full max-w-[1280px] items-center gap-3 px-4 py-3 sm:px-6">
          <div className="hidden min-w-0 flex-1 sm:block">
            <p className="lao text-[11px] leading-none text-ink-400">
              ພ້ອມຊື້ຂາຍ
            </p>
            <p className="mt-1.5 flex items-baseline gap-2 leading-none">
              <span
                data-numeric
                className="font-display text-[16px] font-medium tracking-tight text-ink-950"
              >
                {formatUsd(stock.price)}
              </span>
              <Delta value={stock.changePct} size="sm" />
              {heldShares > 0 ? (
                <span className="hidden text-[12px] text-ink-400 lg:inline">
                  <span data-numeric>{formatShares(heldShares)}</span> held
                </span>
              ) : null}
            </p>
          </div>

          <Button
            variant="sell"
            size="lg"
            className="flex-1 sm:flex-none"
            onClick={() => setSide("sell")}
          >
            Sell {stock.symbol}
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1 sm:flex-none"
            onClick={() => setSide("buy")}
          >
            Buy {stock.symbol}
          </Button>
        </div>
      </div>

      {side ? (
        <OrderTicket
          key={side}
          stock={stock}
          side={side}
          heldShares={heldShares}
          availableUsd={availableUsd}
          onClose={() => setSide(null)}
        />
      ) : null}
    </>
  );
}
