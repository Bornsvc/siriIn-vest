"use client";

import { useState, type ReactNode } from "react";
import { Tabs, type TabItem } from "@/shared/ui";

/**
 * The mobile app's three sections, kept as three sections here. Panels arrive
 * as props so the ones that need no state — Performance — stay server
 * components and ship no JavaScript of their own.
 */

type PanelKey = "holdings" | "performance" | "history";

export function PortfolioTabs({
  holdings,
  performance,
  history,
  holdingsCount,
  historyCount,
}: {
  holdings: ReactNode;
  performance: ReactNode;
  history: ReactNode;
  holdingsCount: number;
  historyCount: number;
}) {
  const [tab, setTab] = useState<PanelKey>("holdings");

  const items: TabItem<PanelKey>[] = [
    { value: "holdings", label: "Holdings", count: holdingsCount },
    { value: "performance", label: "Performance" },
    { value: "history", label: "History", count: historyCount },
  ];

  return (
    <section className="mt-6">
      <div className="scrollbar-thin mb-4 max-w-full overflow-x-auto">
        <Tabs items={items} value={tab} onChange={setTab} size="sm" />
      </div>

      <div role="tabpanel" aria-label="Holdings" hidden={tab !== "holdings"}>
        {holdings}
      </div>
      <div
        role="tabpanel"
        aria-label="Performance"
        hidden={tab !== "performance"}
      >
        {performance}
      </div>
      <div role="tabpanel" aria-label="History" hidden={tab !== "history"}>
        {history}
      </div>
    </section>
  );
}
