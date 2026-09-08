import type { PortfolioSummary } from "@/mock/selectors";
import { cn } from "@/shared/lib/cn";
import {
  formatLak,
  formatPct,
  formatUsd,
  USD_LAK,
  usdToLak,
} from "@/shared/lib/format";
import { Badge, Card, CardBody, CardHeader, Delta, Money } from "@/shared/ui";
import { buildValueSplit, type RangeSeries } from "../lib/analytics";
import { PortfolioChart } from "./portfolio-chart";

/**
 * The anchor of the page: what the portfolio is worth, what it did today,
 * what it has done since the customer started — and the same figure in kip,
 * which is the number a Lao investor actually feels.
 */
export function PortfolioValueCard({
  summary,
  series,
}: {
  summary: PortfolioSummary;
  series: RangeSeries[];
}) {
  const split = buildValueSplit(summary);

  return (
    <Card>
      <CardHeader
        eyebrow="ມູນຄ່າພອດໂຟລິໂອ"
        title="Portfolio value"
        action={
          <Badge tone="brand">
            <span data-numeric>{summary.positions.length}</span> positions
          </Badge>
        }
      />

      <CardBody className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-6">
          <div className="min-w-0">
            <p className="lao text-[12px] leading-none text-ink-400">
              ມູນຄ່າລວມທັງໝົດ
            </p>
            <p
              data-numeric
              className="mt-2 font-display text-[36px] font-medium leading-none tracking-[-0.03em] text-ink-950 sm:text-[46px]"
            >
              {formatUsd(summary.totalValue)}
            </p>

            {/* Kip sits directly beneath the dollar figure — same money,
                the currency the customer earns and spends in. */}
            <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span
                data-numeric
                className="font-display text-[19px] font-medium leading-none tracking-tight text-brand-800"
              >
                {formatLak(usdToLak(summary.totalValue))}
              </span>
              <span className="lao text-[12px] text-ink-400">ມູນຄ່າເປັນກີບ</span>
              <span data-numeric className="font-mono text-[11px] text-ink-300">
                @ ₭{USD_LAK.toLocaleString("en-US")} / USD
              </span>
            </p>
          </div>

          {/* Two different questions, so two separate tiles — today's move is
              never allowed to be mistaken for the lifetime return. */}
          <dl className="grid w-full max-w-md grid-cols-1 gap-3 sm:w-auto sm:grid-cols-2">
            <MoveTile
              eyebrow="ການເໜັງຕີງມື້ນີ້"
              label="Today"
              amount={summary.dayGain}
              pct={summary.dayGainPct}
              note="Since the last U.S. close"
              emphasis
            />
            <MoveTile
              eyebrow="ຜົນຕອບແທນລວມ"
              label="All time"
              amount={summary.totalGain}
              pct={summary.totalGainPct}
              note={`On ${formatUsd(summary.totalCost)} invested`}
            />
          </dl>
        </div>

        <PortfolioChart series={series} />

        {/* What the total is made of. */}
        <div className="rounded-tile border border-line bg-canvas/60 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
            <SplitItem
              eyebrow="ລົງທຶນໃນຫຼັກຊັບ"
              label="Invested"
              value={summary.investedValue}
              share={split.investedShare}
              swatch="bg-brand-700"
            />
            <SplitItem
              eyebrow="ເງິນສົດພ້ອມໃຊ້"
              label="Settled cash"
              value={summary.cash}
              share={split.cashShare}
              swatch="bg-brand-300"
              align="right"
            />
          </div>

          <div
            role="img"
            aria-label={`${formatPct(split.investedShare * 100)} invested, ${formatPct(
              split.cashShare * 100,
            )} settled cash`}
            className="mt-3 flex h-1.5 w-full overflow-hidden rounded-pill bg-line"
          >
            <span
              className="block h-full bg-brand-700"
              style={{ width: `${split.investedShare * 100}%` }}
            />
            <span
              className="block h-full bg-brand-300"
              style={{ width: `${split.cashShare * 100}%` }}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function MoveTile({
  eyebrow,
  label,
  amount,
  pct,
  note,
  emphasis,
}: {
  eyebrow: string;
  label: string;
  amount: number;
  pct: number;
  note: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-tile border p-3.5",
        emphasis ? "border-brand-100 bg-brand-50/70" : "border-line bg-surface",
      )}
    >
      <dt>
        <span className="lao block text-[11px] leading-none text-brand-600">
          {eyebrow}
        </span>
        <span className="mt-1 block text-[12px] font-medium uppercase tracking-[0.06em] text-ink-400">
          {label}
        </span>
      </dt>
      <dd className="mt-2">
        <Money
          value={amount}
          signed
          className="block font-display text-[20px] font-medium leading-none tracking-tight"
        />
        <Delta value={pct} size="sm" className="mt-1.5" />
        <span className="mt-1.5 block text-[11px] leading-tight text-ink-300">
          {note}
        </span>
      </dd>
    </div>
  );
}

function SplitItem({
  eyebrow,
  label,
  value,
  share,
  swatch,
  align = "left",
}: {
  eyebrow: string;
  label: string;
  value: number;
  share: number;
  swatch: string;
  align?: "left" | "right";
}) {
  return (
    <div className={cn("min-w-0", align === "right" && "text-right")}>
      <p
        className={cn(
          "flex items-center gap-1.5",
          align === "right" && "justify-end",
        )}
      >
        <span aria-hidden className={cn("size-2 rounded-full", swatch)} />
        <span className="lao text-[11px] leading-none text-ink-400">
          {eyebrow}
        </span>
        <span className="text-[11px] leading-none text-ink-300">· {label}</span>
      </p>
      <p className="mt-1.5 flex items-baseline gap-2">
        {align === "right" ? (
          <span data-numeric className="text-[12px] text-ink-400">
            {formatPct(share * 100)}
          </span>
        ) : null}
        <span
          data-numeric
          className="font-display text-[17px] font-medium leading-none tracking-tight text-ink-950"
        >
          {formatUsd(value)}
        </span>
        {align === "left" ? (
          <span data-numeric className="text-[12px] text-ink-400">
            {formatPct(share * 100)}
          </span>
        ) : null}
      </p>
    </div>
  );
}
