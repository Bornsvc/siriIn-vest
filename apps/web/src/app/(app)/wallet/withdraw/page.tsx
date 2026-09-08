import { BANK_ACCOUNTS, WALLET } from "@/mock/account";
import { PageHeader } from "@/features/shell";
import { BackToWallet, WithdrawForm } from "@/features/wallet";

export default function WithdrawPage() {
  return (
    <>
      <BackToWallet />
      <PageHeader
        eyebrow="ຖອນເງິນ"
        title="Withdraw"
        description="Send settled cash back to a Lao bank account in your own name. Dollars convert to kip when the transfer leaves us."
      />
      <WithdrawForm
        availableUsd={WALLET.availableUsd}
        accounts={BANK_ACCOUNTS}
      />
    </>
  );
}
