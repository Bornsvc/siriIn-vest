import type { Position } from "@/shared/types";
import { cn } from "@/shared/lib/cn";
import { formatPct, formatUsd } from "@/shared/lib/format";
import {
  Card,
  CardBody,
  CardHeader,
  Delta,
  Money,
  Monogram,
} from "@/shared/ui";
import type { AllocationSlice, PerformanceData } from "../lib/analytics";

/**
 * Where the money sits and which positions earned it. Allocation is drawn as
 * a stacked bar rather than a pie: at this size a reader can compare segment
 * lengths far more precisely than wedge angles.
 */
export function PerformancePanel({ data }: { data: PerformanceData }) {
  const widestShare = Math.max(
    ...data.contributions.map((item) => Math.abs(item.shareOfGain)),
    0.0001,
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <AllocationCard
          eyebrow="ການແບ່ງສັນຕາມຫຼັກຊັບ"
          title="Allocation by position"
          caption="Share of invested value"
          slices={data.byPosition}
        />
        <AllocationCard
          eyebrow="ການແບ່ງສັນຕາມກຸ່ມທຸລະກິດ"
          title="Allocation by sector"
          caption="Positions grouped by the sector they trade in"
          slices={data.bySector}
        />
      </div>

      <Card>
        <CardHeader
          eyebrow="ດີທີ່ສຸດ ແລະ ອ່ອນທີ່ສຸດ"
          title="Best and weakest"
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <PerformerTile
            eyebrow="ດີທີ່ສຸດ"
            label="Best performer"
            position={data.best}
            tone="gain"
          />
          <PerformerTile
            eyebrow="ອ່ອນທີ່ສຸດ"
            label="Weakest performer"
            position={data.worst}
            tone="loss"
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          eyebrow="ສ່ວນຮ່ວມຕໍ່ຜົນຕອບແທນ"
          title="Contribution to return"
          action={
            <span className="text-[12px] text-ink-400">
              Total{" "}
              <Money value={data.totalGain} signed className="font-medium" />
            </span>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left">
            <caption className="sr-only">
              What each position added to, or took from, the portfolio&apos;s
              total return.
            </caption>
            <thead>
              <tr className="border-b border-line">
                <th
                  scope="col"
                  className="py-2.5 pl-5 pr-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-400"
                >
                  Asset
                </th>
                <th
                  scope="col"
                  className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-[0.06em] text-ink-400"
                >
                  Gain
                </th>
                <th
                  scope="col"
                  className="py-2.5 pl-3 pr-5 text-left text-[11px] font-medium uppercase tracking-[0.06em] text-ink-400"
                >
                  Share of return
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.contributions.map((item) => (
                <tr key={item.symbol}>
                  <th scope="row" className="py-3 pl-5 pr-3 font-normal">
                    <span className="flex items-center gap-2.5">
                      <Monogram
                        symbol={item.symbol}
                        color={item.color}
                        size="sm"
                      />
                      <span className="min-w-0">
                        <span className="block font-display text-[13px] font-medium leading-tight tracking-tight text-ink-950">
                          {item.symbol}
                        </span>
                        <span className="block max-w-[160px] truncate text-[11px] leading-tight text-ink-400">
                          {item.name}
                        </span>
                      </span>
                    </span>
                  </th>

                  <td className="px-3 py-3 text-right">
                    <Money
                      value={item.gain}
                      signed
                      className="block text-[13px] font-medium leading-tight"
                    />
                    <Delta
                      value={item.gainPct}
                      size="sm"
                      className="leading-tight"
                    />
                  </td>

                  <td className="py-3 pl-3 pr-5">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-full min-w-[40px] max-w-[120px] overflow-hidden rounded-pill bg-line">
                        <span
                          className={cn(
                            "block h-full rounded-pill",
                            item.gain < 0 ? "bg-loss" : "bg-gain",
                          )}
                          style={{
                            width: `${
                              (Math.abs(item.shareOfGain) / widestShare) * 100
                            }%`,
                          }}
                        />
                      </span>
                      <span
                        data-numeric
                        className="w-16 shrink-0 text-right text-[12px] text-ink-500"
                      >
                        {formatPct(item.shareOfGain * 100, { sign: true })}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.contributions.some((item) => item.gain < 0) ? (
          <p className="border-t border-line px-5 py-3 text-[12px] leading-relaxed text-ink-400">
            A negative share means the position pulled against the total, so the
            winners had to carry more than 100% of it.
          </p>
        ) : null}
      </Card>
    </div>
  );
}

function AllocationCard({
  eyebrow,
  title,
  caption,
  slices,
}: {
  eyebrow: string;
  title: string;
  caption: string;
  slices: AllocationSlice[];
}) {
  const description = slices
    .map((slice) => `${slice.label} ${formatPct(slice.share * 100)}`)
    .join(", ");

  return (
    <Card className="flex flex-col">
      <CardHeader eyebrow={eyebrow} title={title} />
      <CardBody className="flex-1 space-y-4">
        <div
          role="img"
          aria-label={`${title}: ${description}`}
          className="flex h-4 w-full overflow-hidden rounded-pill bg-line"
        >
          {slices.map((slice) => (
            <span
              key={slice.key}
              className="block h-full border-r border-surface last:border-r-0"
              style={{
                width: `${slice.share * 100}%`,
                backgroundColor: slice.color,
              }}
            />
          ))}
        </div>

        <p className="text-[12px] text-ink-400">{caption}</p>

        <ul className="space-y-2.5">
          {slices.map((slice) => (
            <li key={slice.key} className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-[3px]"
                style={{ backgroundColor: slice.color }}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium leading-tight text-ink-950">
                  {slice.label}
                </span>
                <span className="lao block truncate text-[11px] leading-tight text-ink-400">
                  {slice.sublabel}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span
                  data-numeric
                  className="block font-display text-[13px] font-medium leading-tight tracking-tight text-ink-950"
                >
                  {formatPct(slice.share * 100)}
                </span>
                <span
                  data-numeric
                  className="block text-[11px] leading-tight text-ink-400"
                >
                  {formatUsd(slice.value)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

function PerformerTile({
  eyebrow,
  label,
  position,
  tone,
}: {
  eyebrow: string;
  label: string;
  position?: Position;
  tone: "gain" | "loss";
}) {
  if (!position) {
    return (
      <div className="rounded-tile border border-dashed border-line-strong p-4 text-[13px] text-ink-400">
        {label} needs at least two positions.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-tile border p-4",
        tone === "gain"
          ? "border-gain/20 bg-gain-soft/50"
          : "border-loss/20 bg-loss-soft/50",
      )}
    >
      <p>
        <span className="lao block text-[11px] leading-none text-ink-500">
          {eyebrow}
        </span>
        <span className="mt-1 block text-[12px] font-medium uppercase tracking-[0.06em] text-ink-400">
          {label}
        </span>
      </p>

      <div className="mt-3 flex items-center gap-3">
        <Monogram
          symbol={position.symbol}
          color={position.stock.brandColor}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <p className="font-display text-[15px] font-medium leading-tight tracking-tight text-ink-950">
            {position.symbol}
          </p>
          <p className="truncate text-[12px] leading-tight text-ink-400">
            {position.stock.name}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <Money
            value={position.gain}
            signed
            className="block font-display text-[15px] font-medium leading-tight tracking-tight"
          />
          <Delta value={position.gainPct} size="sm" className="leading-tight" />
        </div>
      </div>
    </div>
  );
}
