import { DEPOSIT_METHODS } from "@/mock/account";
import { PageHeader } from "@/features/shell";
import { BackToWallet, DepositForm } from "@/features/wallet";

export default function DepositPage() {
  return (
    <>
      <BackToWallet />
      <PageHeader
        eyebrow="ຝາກເງິນ"
        title="Add funds"
        description="Transfer kip from your Lao bank account. We convert it to U.S. dollars so it is ready to trade — the rate is shown before you commit to anything."
      />
      <DepositForm methods={DEPOSIT_METHODS} />
    </>
  );
}
