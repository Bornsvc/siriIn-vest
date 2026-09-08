"use client";

import { useId, useState, type ComponentType, type SVGProps } from "react";
import { Card, CardHeader } from "@/shared/ui";
import { IconBell, IconCheck, IconDeposit, IconStar } from "@/shared/ui/icons";
import { SettingRow } from "./setting-row";
import { Switch } from "./switch";

type NotificationId = "fills" | "alerts" | "deposits" | "news";

type Setting = {
  id: NotificationId;
  eyebrow: string;
  label: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const SETTINGS: Setting[] = [
  {
    id: "fills",
    eyebrow: "ຄຳສັ່ງຖືກຈັບຄູ່",
    label: "Order fills",
    description: "When a buy or sell executes, with the price it filled at.",
    icon: IconCheck,
  },
  {
    id: "alerts",
    eyebrow: "ແຈ້ງເຕືອນລາຄາ",
    label: "Price alerts",
    description: "When a stock crosses a price you set.",
    icon: IconBell,
  },
  {
    id: "deposits",
    eyebrow: "ເງິນຝາກ",
    label: "Deposits",
    description: "When kip arrives and converts to dollars.",
    icon: IconDeposit,
  },
  {
    id: "news",
    eyebrow: "ຂ່າວສານຜະລິດຕະພັນ",
    label: "Product news",
    description: "New features and market notes. Roughly monthly.",
    icon: IconStar,
  },
];

const DEFAULTS: Record<NotificationId, boolean> = {
  fills: true,
  alerts: true,
  deposits: true,
  news: false,
};

export function NotificationSettings() {
  const uid = useId();
  const [enabled, setEnabled] = useState(DEFAULTS);

  return (
    <Card>
      <CardHeader eyebrow="ການແຈ້ງເຕືອນ" title="Notifications" />
      <div className="divide-y divide-line">
        {SETTINGS.map((setting) => {
          const labelId = `${uid}-${setting.id}-label`;
          const descriptionId = `${uid}-${setting.id}-desc`;
          return (
            <SettingRow
              key={setting.id}
              icon={setting.icon}
              eyebrow={setting.eyebrow}
              label={setting.label}
              description={setting.description}
              labelId={labelId}
              descriptionId={descriptionId}
              control={
                <Switch
                  checked={enabled[setting.id]}
                  onChange={(next) =>
                    setEnabled((current) => ({
                      ...current,
                      [setting.id]: next,
                    }))
                  }
                  labelledBy={labelId}
                  describedBy={descriptionId}
                />
              }
            />
          );
        })}
      </div>
    </Card>
  );
}
