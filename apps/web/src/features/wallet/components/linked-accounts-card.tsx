import type { BankAccount } from "@/shared/types";
import { cn } from "@/shared/lib/cn";
import { Badge, Card, CardBody, CardHeader, Note, RowList } from "@/shared/ui";
import { IconBank } from "@/shared/ui/icons";

/**
 * The accounts money can leave to. Numbers are masked here and everywhere —
 * a full account number never reaches the client.
 */
export function LinkedAccountsCard({
  accounts,
  className,
}: {
  accounts: BankAccount[];
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader eyebrow="ບັນຊີທະນາຄານ" title="Linked accounts" />

      <RowList>
        {accounts.map((account) => (
          <div key={account.id} className="flex items-start gap-3 px-5 py-4">
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100"
            >
              <IconBank className="size-[17px]" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="min-w-0 text-[13px] font-medium leading-snug text-ink-950">
                  {account.bank}
                </p>
                {account.isDefault ? <Badge tone="brand">Default</Badge> : null}
              </div>
              <p className="mt-1 truncate text-[12px] text-ink-400">
                {account.holder}
              </p>
              <p
                data-numeric
                className="mt-0.5 font-mono text-[12px] text-ink-500"
              >
                {account.maskedNumber}
              </p>
            </div>
          </div>
        ))}
      </RowList>

      <CardBody className="mt-auto border-t border-line pt-4">
        <Note>
          Withdrawals can only be sent to an account in your own name. To add
          another account, verify it from Account settings first.
        </Note>
      </CardBody>
    </Card>
  );
}
