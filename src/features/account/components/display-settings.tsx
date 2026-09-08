"use client";

import { useState } from "react";
import { formatLak, formatUsd, USD_LAK, usdToLak } from "@/shared/lib/format";
import { Card, CardHeader, Tabs, type TabItem } from "@/shared/ui";
import { IconCurrency, IconGlobe } from "@/shared/ui/icons";
import { SettingRow } from "./setting-row";

type Language = "lo" | "en";
type Currency = "usd" | "lak";

const LANGUAGES: TabItem<Language>[] = [
  { value: "lo", label: "ລາວ" },
  { value: "en", label: "English" },
];

const CURRENCIES: TabItem<Currency>[] = [
  { value: "usd", label: "USD" },
  { value: "lak", label: "LAK" },
];

/** The figure the price-display example is drawn on. */
const SAMPLE_USD = 1_000;

/**
 * Language and price display. Both are local state in the MVP — nothing is
 * persisted and nothing is translated yet, but the controls are real, so the
 * state they hold is visible in the copy beneath them.
 */
export function DisplaySettings() {
  const [language, setLanguage] = useState<Language>("lo");
  const [currency, setCurrency] = useState<Currency>("usd");

  // `id` is the anchor target for /settings#display; the scroll margin clears
  // the sticky Bridge Bar (36px) and TopBar (64px) above it.
  return (
    <Card id="display" className="scroll-mt-28">
      <CardHeader eyebrow="ການສະແດງຜົນ" title="Display" />
      <div className="divide-y divide-line">
        <SettingRow
          icon={IconGlobe}
          eyebrow="ພາສາ"
          label="Language"
          description={
            language === "lo"
              ? "Labels read in Lao. Tickers, prices and order types stay in English."
              : "Labels read in English. Tickers, prices and order types are unchanged."
          }
          control={
            <Tabs items={LANGUAGES} value={language} onChange={setLanguage} />
          }
        />
        <SettingRow
          icon={IconCurrency}
          eyebrow="ການສະແດງລາຄາ"
          label="Price display"
          description={
            currency === "usd"
              ? `Balances show as ${formatUsd(SAMPLE_USD)}.`
              : `Balances show as ${formatLak(usdToLak(SAMPLE_USD))}, converted at ₭${USD_LAK.toLocaleString("en-US")} to the dollar.`
          }
          control={
            <Tabs items={CURRENCIES} value={currency} onChange={setCurrency} />
          }
        />
      </div>
    </Card>
  );
}
