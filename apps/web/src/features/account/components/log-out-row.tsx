"use client";

import { useRouter } from "next/navigation";
import { clearSession } from "@/features/auth";
import { IconLogout } from "@/shared/ui/icons";
import { AccountRow } from "./account-row";

/**
 * Logging out is the one row that acts rather than navigates: the token has to
 * be dropped before the login screen, or the shell would send the customer
 * straight back in.
 */
export function LogOutRow() {
  const router = useRouter();

  return (
    <AccountRow
      icon={IconLogout}
      eyebrow="ອອກຈາກລະບົບ"
      label="Log out"
      tone="loss"
      onClick={() => {
        clearSession();
        // `replace`, so the back button does not return to a signed-in screen.
        router.replace("/login");
      }}
    />
  );
}
