import type { Metadata } from "next";
import { AccountMenu, IdentityCard } from "@/features/account";
import { PageHeader } from "@/features/shell";
import { USER } from "@/mock/account";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <>
      <PageHeader
        eyebrow="ບັນຊີຂອງຂ້ອຍ"
        title="Account"
        description="Who you are on the record, and everything that hangs off it."
      />

      <div className="max-w-[640px] space-y-5">
        <IdentityCard user={USER} />
        <AccountMenu />
      </div>
    </>
  );
}
