import { WALLET } from "@/mock/account";
import { formatLak, formatUsd, usdToLak } from "@/shared/lib/format";
import { ButtonLink } from "@/shared/ui/button";
import { Card, CardHeader } from "@/shared/ui/card";
import { Note } from "@/shared/ui/feedback";

export function CashCard() {
  return (
    <Card>
      <CardHeader eyebrow="ເງິນທີ່ໃຊ້ໄດ້" title="Buying power" />
      <div className="p-5">
        <p
          data-numeric
          className="font-display text-[30px] font-medium leading-none tracking-[-0.02em] text-ink-950"
        >
          {formatUsd(WALLET.availableUsd)}
        </p>
        <p data-numeric className="mt-2 font-mono text-[12px] text-ink-400">
          {formatLak(usdToLak(WALLET.availableUsd))}
        </p>

        {WALLET.pendingUsd > 0 ? (
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3.5">
            <span className="lao text-[12px] text-ink-400">
              ກຳລັງດຳເນີນການ
              <span className="ml-1.5 font-sans text-ink-300">Pending</span>
            </span>
            <span
              data-numeric
              className="font-display text-[14px] font-medium text-ink-500"
            >
              {formatUsd(WALLET.pendingUsd)}
            </span>
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <ButtonLink href="/wallet/deposit" size="sm" block>
            Add funds
          </ButtonLink>
          <ButtonLink href="/wallet/withdraw" variant="secondary" size="sm" block>
            Withdraw
          </ButtonLink>
        </div>

        <Note className="mt-4">
          Deposits arrive in kip and convert to U.S. dollars before they can be
          traded.
        </Note>
      </div>
    </Card>
  );
}
