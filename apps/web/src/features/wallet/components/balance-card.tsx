import type { Wallet } from "@/shared/types";
import { cn } from "@/shared/lib/cn";
import { formatLak, formatUsd, usdToLak } from "@/shared/lib/format";
import { ButtonLink, Card, CardBody, CardHeader, Note } from "@/shared/ui";
import { IconDeposit, IconWithdraw } from "@/shared/ui/icons";
import { RATE_LINE } from "../lib/currency";

/**
 * Settled cash and pending cash are two different things, and confusing them
 * is how a customer places an order that cannot fill. They get separate lines,
 * separate weights and a label that says which is spendable.
 */
export function BalanceCard({
  wallet,
  className,
}: {
  wallet: Wallet;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader
        eyebrow="ຍອດເງິນທີ່ໃຊ້ໄດ້"
        title="Available to trade"
        action={
          <span
            data-numeric
            className="hidden font-mono text-[11px] text-ink-400 sm:block"
          >
            {RATE_LINE}
          </span>
        }
      />
      <CardBody className="flex flex-1 flex-col gap-5">
        <div>
          <p
            data-numeric
            className="font-display text-[40px] font-medium leading-none tracking-[-0.02em] text-ink-950 sm:text-[48px]"
          >
            {formatUsd(wallet.availableUsd)}
          </p>
          <p data-numeric className="mt-2 text-[14px] text-ink-400">
            ≈ {formatLak(usdToLak(wallet.availableUsd))}
          </p>
        </div>

        <div className="rounded-tile border border-line bg-canvas px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="min-w-0">
              <span className="lao block text-[11px] leading-none text-brand-600">
                ກຳລັງດຳເນີນການ
              </span>
              <span className="mt-1 block text-[13px] font-medium text-ink-700">
                Pending deposits
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span
                data-numeric
                className="block font-display text-[19px] font-medium leading-none tracking-tight text-ink-700"
              >
                {formatUsd(wallet.pendingUsd)}
              </span>
              <span data-numeric className="mt-1 block text-[12px] text-ink-400">
                ≈ {formatLak(usdToLak(wallet.pendingUsd))}
              </span>
            </span>
          </div>
          <Note className="mt-2.5">
            Pending money is still clearing. It is not part of the balance above
            and cannot be traded yet.
          </Note>
        </div>

        <div className="mt-auto flex flex-col gap-2 sm:flex-row">
          <ButtonLink href="/wallet/deposit" size="lg" className="flex-1">
            <IconDeposit className="size-4" />
            Add funds
          </ButtonLink>
          <ButtonLink
            href="/wallet/withdraw"
            size="lg"
            variant="secondary"
            className="flex-1"
          >
            <IconWithdraw className="size-4" />
            Withdraw
          </ButtonLink>
        </div>
      </CardBody>
    </Card>
  );
}
