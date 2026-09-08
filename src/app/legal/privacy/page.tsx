import type { Metadata } from "next";
import { LegalDoc } from "@/features/marketing/components/legal-doc";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalDoc
      eyebrow="ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ"
      title="Privacy policy"
      updated="7 September 2026"
      intro="SiriInvest is a demonstration build running on sample data. Nothing you type into it is transmitted, stored or shared. This policy describes how the finished product would handle your information."
      sections={[
        {
          heading: "What we collect",
          body: "Your name, email address, phone number and date of birth; the ID document and selfie you submit for verification; your bank account details for deposits and withdrawals; and a record of every transfer and order you place.",
        },
        {
          heading: "Why we collect it",
          body: "To verify who you are, to move money between your bank and your account, to place your orders with our U.S. broker, and to meet the record-keeping obligations that both Lao and U.S. regulators place on us.",
        },
        {
          heading: "Who we share it with",
          body: "Our identity verification provider, our U.S. executing broker, and your bank — each receiving only what that specific step requires. We do not sell your information, and we do not share it for advertising.",
        },
        {
          heading: "How long we keep it",
          body: "For as long as your account is open, and for seven years after you close it, which is the retention period financial record-keeping rules require.",
        },
        {
          heading: "How it is protected",
          body: "Documents are encrypted in transit and at rest. Access is limited to staff who need it for verification or support, and every access is logged.",
        },
        {
          heading: "Your rights",
          body: "You can request a copy of everything we hold about you, correct anything inaccurate, and ask us to delete what we are not legally required to retain. Write to privacy@siriinvest.la and we will respond within 30 days.",
        },
      ]}
    />
  );
}
