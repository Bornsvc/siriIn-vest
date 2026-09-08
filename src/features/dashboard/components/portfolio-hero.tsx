import { getPortfolioSeries, getPortfolioSummary } from "@/mock/selectors";
import { toLinePath } from "@/mock/series";
import { formatLak, formatPct, formatUsd, usdToLak } from "@/shared/lib/format";
import { ButtonLink } from "@/shared/ui/button";
import {
  IconArrowUpRight,
  IconDeposit,
  IconWithdraw,
} from "@/shared/ui/icons";

const WIDTH = 900;
const HEIGHT = 120;

/**
 * The emerald card carried over from the mobile home screen, given the room a
 * desktop has: the same figure, but with the shape of the month behind it.
 */
export function PortfolioHero() {
  const summary = getPortfolioSummary();
  const series = getPortfolioSeries("1M");
  const up = summary.totalGain >= 0;
  const path = toLinePath(series, WIDTH, HEIGHT, 6);

  return (
    <section className="overflow-hidden rounded-card bg-brand-900 text-white shadow-card">
      <div className="bg-grid p-6 sm:p-7">
        <p className="lao text-[12px] leading-none text-brand-200">
          ມູນຄ່າພອດໂຟລິໂອທັງໝົດ
        </p>

        <div className="mt-2.5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p
            data-numeric
            className="font-display text-[40px] font-medium leading-none tracking-[-0.03em] sm:text-[46px]"
          >
            {formatUsd(summary.totalValue)}
          </p>
          <p
            data-numeric
            className={`text-[15px] font-medium ${up ? "text-brand-300" : "text-loss-light"}`}
          >
            <span aria-hidden className="mr-1 text-[0.75em]">
              {up ? "▲" : "▼"}
            </span>
            {formatUsd(summary.totalGain, { sign: true })} (
            {formatPct(summary.totalGainPct, { sign: true })})
            <span className="ml-1.5 font-normal text-white/45">all time</span>
          </p>
        </div>

        {/* The number a Lao customer actually feels. */}
        <p className="mt-3 font-mono text-[13px] text-white/55">
          <span data-numeric>{formatLak(usdToLak(summary.totalValue))}</span>
          <span className="lao ml-2 text-white/35">ຕາມອັດຕາແລກປ່ຽນປັດຈຸບັນ</span>
        </p>

        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-5 text-[13px]">
          <Figure
            label="ມູນຄ່າຫຼັກຊັບ"
            labelEn="Invested"
            value={formatUsd(summary.investedValue)}
          />
          <Figure
            label="ເງິນສົດ"
            labelEn="Settled cash"
            value={formatUsd(summary.cash)}
          />
          <Figure
            label="ມື້ນີ້"
            labelEn="Today"
            value={`${formatUsd(summary.dayGain, { sign: true })} (${formatPct(summary.dayGainPct, { sign: true })})`}
            tone={summary.dayGain >= 0 ? "up" : "down"}
          />
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          <ButtonLink
            href="/wallet/deposit"
            variant="invert"
          >
            <IconDeposit className="size-4" />
            Add funds
          </ButtonLink>
          <ButtonLink
            href="/market"
            variant="onDark"
          >
            <IconArrowUpRight className="size-4" />
            Explore market
          </ButtonLink>
          <ButtonLink
            href="/wallet/withdraw"
            variant="onDarkGhost"
          >
            <IconWithdraw className="size-4" />
            Withdraw
          </ButtonLink>
        </div>
      </div>

      {/* The month's shape, given its own band at the foot of the card so the
          line never runs behind a figure or a control. */}
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden
        className="block h-23 w-full"
      >
        <defs>
          <linearGradient id="hero-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-300)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--color-brand-300)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${path} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`}
          fill="url(#hero-fill)"
        />
        <path
          d={path}
          fill="none"
          stroke="var(--color-brand-300)"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <p className="sr-only">
        Portfolio value over the past month, ending at{" "}
        {formatUsd(summary.totalValue)}.
      </p>
    </section>
  );
}

function Figure({
  label,
  labelEn,
  value,
  tone,
}: {
  label: string;
  labelEn: string;
  value: string;
  tone?: "up" | "down";
}) {
  return (
    <div>
      <dt className="lao text-[11px] leading-none text-white/40">
        {label}
        <span className="ml-1.5 font-sans text-white/30">{labelEn}</span>
      </dt>
      <dd
        data-numeric
        className={`mt-1.5 font-display text-[15px] font-medium tracking-tight ${
          tone === "up"
            ? "text-brand-300"
            : tone === "down"
              ? "text-loss-light"
              : "text-white"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
