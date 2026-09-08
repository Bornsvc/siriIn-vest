import { BANK_ACCOUNTS, TRANSFERS, WALLET } from "@/mock/account";
import { PageHeader } from "@/features/shell";
import {
  BalanceCard,
  LinkedAccountsCard,
  TransferHistory,
} from "@/features/wallet";

export default function WalletPage() {
  return (
    <>
      <PageHeader
        eyebrow="ກະເປົາເງິນ"
        title="Wallet"
        description="Your cash sits here in U.S. dollars, because that is what the market trades in. Every deposit and withdrawal shows the kip figure beside it."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <BalanceCard wallet={WALLET} className="lg:col-span-2" />
        <LinkedAccountsCard accounts={BANK_ACCOUNTS} />
        <TransferHistory transfers={TRANSFERS} className="lg:col-span-3" />
      </div>
    </>
  );
}
