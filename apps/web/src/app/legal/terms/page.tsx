import type { Metadata } from "next";
import { LegalDoc } from "@/features/marketing/components/legal-doc";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <LegalDoc
      eyebrow="ເງື່ອນໄຂການໃຫ້ບໍລິການ"
      title="Terms of service"
      updated="7 September 2026"
      intro="SiriInvest is a demonstration build. No account you open here is real, no order reaches a market, and no money moves. These terms describe how the finished product would work."
      sections={[
        {
          heading: "Who can open an account",
          body: "You must be at least 18, resident in Laos, and able to provide a valid national ID or passport. We verify every account before it can trade or withdraw, because both Lao regulations and U.S. brokerage rules require it.",
        },
        {
          heading: "Funding and currency conversion",
          body: "You deposit in kip. We convert to U.S. dollars at the rate shown before you confirm the transfer, and that rate is what settles — if it moves before your bank transfer clears, we show you the difference rather than absorbing it silently.",
        },
        {
          heading: "Orders and execution",
          body: "Market orders execute at the next available price once the New York market opens, which is 20:30 Vientiane time. Limit orders execute only at your price or better. An order placed while the market is closed is queued, not filled, and you can cancel it until it does.",
        },
        {
          heading: "Fees",
          body: "A flat $1.00 commission applies per order. Deposits by bank transfer and QR payment are free. We charge nothing to withdraw, though your own bank may.",
        },
        {
          heading: "Risk",
          body: "Investments can lose value, including the whole of your capital. Currency movement between the kip and the dollar affects your returns independently of how your holdings perform. Nothing in this product is investment advice.",
        },
        {
          heading: "Closing your account",
          body: "You can sell your holdings and withdraw your balance to a linked Lao bank account at any time. Settlement takes one to three business days.",
        },
      ]}
    />
  );
}
