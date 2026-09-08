import { BANK_ACCOUNTS } from "@/mock/account";
import { Card, CardHeader } from "@/shared/ui";
import {
  IconBank,
  IconLogout,
  IconSettings,
  IconShield,
  IconUser,
} from "@/shared/ui/icons";
import { AccountRow } from "./account-row";
import { IconHelp } from "@/shared/ui/icons";

/**
 * The account list. Rows that lead somewhere real are links; the rest are
 * buttons wearing a "Soon" badge, because a stub that admits it is a stub
 * beats a link into a 404.
 */
export function AccountMenu() {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader eyebrow="ການຕັ້ງຄ່າບັນຊີ" title="Account settings" />
        <div className="divide-y divide-line">
          <AccountRow
            icon={IconUser}
            eyebrow="ຂໍ້ມູນສ່ວນຕົວ"
            label="Personal information"
            soon
          />
          <AccountRow
            icon={IconBank}
            eyebrow="ບັນຊີທະນາຄານ"
            label="Bank accounts"
            value={
              <span data-numeric>
                {BANK_ACCOUNTS.length} linked
              </span>
            }
            soon
          />
          <AccountRow
            icon={IconShield}
            eyebrow="ຄວາມປອດໄພ"
            label="Security"
            value="2FA off"
            href="/settings#security"
          />
          <AccountRow
            icon={IconSettings}
            eyebrow="ການຕັ້ງຄ່າ"
            label="Preferences"
            value="Lao · USD"
            href="/settings#display"
          />
          <AccountRow
            icon={IconHelp}
            eyebrow="ຊ່ວຍເຫຼືອ"
            label="Help and support"
            soon
          />
        </div>
      </Card>

      {/* Its own card — logging out is not one more preference. */}
      <Card>
        <AccountRow
          icon={IconLogout}
          eyebrow="ອອກຈາກລະບົບ"
          label="Log out"
          tone="loss"
          href="/login"
        />
      </Card>
    </div>
  );
}
