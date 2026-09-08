import { Card, CardHeader } from "@/shared/ui";
import { AccountRow } from "./account-row";
import { IconDocument, IconInfo, IconLock } from "@/shared/ui/icons";
import { SettingRow } from "./setting-row";

export const APP_VERSION = "v1.0.0";

export function AboutCard() {
  return (
    <Card>
      <CardHeader eyebrow="ກ່ຽວກັບ" title="About" />
      <div className="divide-y divide-line">
        <SettingRow
          icon={IconInfo}
          eyebrow="ເວີຊັນ"
          label="Version"
          description="SiriInvest for web. Market data in this build is sample data."
          control={
            <span
              data-numeric
              className="font-mono text-[12.5px] text-ink-400"
            >
              {APP_VERSION}
            </span>
          }
        />
        <AccountRow
          icon={IconDocument}
          eyebrow="ເງື່ອນໄຂການໃຫ້ບໍລິການ"
          label="Terms of service"
          href="/legal/terms"
        />
        <AccountRow
          icon={IconLock}
          eyebrow="ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ"
          label="Privacy policy"
          href="/legal/privacy"
        />
      </div>
    </Card>
  );
}
