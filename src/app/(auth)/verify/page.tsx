import type { Metadata } from "next";
import { AuthHeading, VerifyChecklist } from "@/features/auth";

export const metadata: Metadata = { title: "Verify your identity" };

export default function VerifyPage() {
  return (
    <>
      <AuthHeading
        eyebrow="ຢືນຢັນຕົວຕົນ"
        title="Verify your identity"
        description="Lao anti-money-laundering rules and our U.S. brokerage partner both require a verified identity before an account can hold money or place a trade. It is checked once."
      />

      <VerifyChecklist />
    </>
  );
}
