"use client";

import { useId, useState } from "react";
import { Card, CardHeader } from "@/shared/ui";
import { IconShield } from "@/shared/ui/icons";
import { AccountRow } from "./account-row";
import { IconDevices, IconKey } from "@/shared/ui/icons";
import { SettingRow } from "./setting-row";
import { Switch } from "./switch";

export function SecuritySettings() {
  const uid = useId();
  const [twoFactor, setTwoFactor] = useState(false);
  const labelId = `${uid}-2fa-label`;
  const descriptionId = `${uid}-2fa-desc`;

  return (
    <Card id="security" className="scroll-mt-28">
      <CardHeader eyebrow="ຄວາມປອດໄພ" title="Security" />
      <div className="divide-y divide-line">
        <SettingRow
          icon={IconShield}
          eyebrow="ຢືນຢັນສອງຂັ້ນຕອນ"
          label="Two-factor authentication"
          description={
            twoFactor
              ? "A code from your phone is required on every new sign-in."
              : "Ask for a code from your phone on every new sign-in."
          }
          labelId={labelId}
          descriptionId={descriptionId}
          control={
            <Switch
              checked={twoFactor}
              onChange={setTwoFactor}
              labelledBy={labelId}
              describedBy={descriptionId}
            />
          }
        />
        <AccountRow
          icon={IconKey}
          eyebrow="ປ່ຽນລະຫັດຜ່ານ"
          label="Change password"
          soon
        />
        <AccountRow
          icon={IconDevices}
          eyebrow="ອຸປະກອນທີ່ເຂົ້າໃຊ້"
          label="Active sessions"
          value={<span data-numeric>2 devices</span>}
          soon
        />
      </div>
    </Card>
  );
}
