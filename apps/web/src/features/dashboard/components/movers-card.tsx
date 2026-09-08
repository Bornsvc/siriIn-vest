"use client";

import Link from "next/link";
import { useState } from "react";
import type { Stock } from "@/shared/types";
import { Card, CardHeader } from "@/shared/ui/card";
import { RowList, StockRow } from "@/shared/ui/stock-row";
import { Tabs } from "@/shared/ui/tabs";

export type MoverItem = { stock: Stock; series: number[] };
export type MoverGroups = Record<"gainers" | "losers" | "active", MoverItem[]>;

type Group = keyof MoverGroups;

const TABS = [
  { value: "gainers" as const, label: "Gainers" },
  { value: "losers" as const, label: "Losers" },
  { value: "active" as const, label: "Most active" },
];

export function MoversCard({ groups }: { groups: MoverGroups }) {
  const [group, setGroup] = useState<Group>("gainers");

  return (
    <Card>
      <CardHeader
        eyebrow="ຫຸ້ນເຄື່ອນໄຫວ"
        title="Top movers"
        action={
          <Link
            href="/market"
            className="text-[13px] font-medium text-brand-700 hover:text-brand-800"
          >
            See all
          </Link>
        }
      />
      <div className="px-5 pt-4">
        <Tabs items={TABS} value={group} onChange={setGroup} size="sm" />
      </div>
      <RowList className="mt-3 border-t border-line">
        {groups[group].map(({ stock, series }) => (
          <StockRow key={stock.symbol} stock={stock} series={series} />
        ))}
      </RowList>
    </Card>
  );
}
