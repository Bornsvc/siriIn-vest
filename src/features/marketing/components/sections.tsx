import Link from "next/link";
import { getStockSeries } from "@/mock/selectors";
import { STOCKS } from "@/mock/stocks";
import { directionOf, formatPct, formatUsd } from "@/shared/lib/format";
import { Logo } from "@/shared/ui/logo";
import { ButtonLink } from "@/shared/ui/button";
import { Monogram } from "@/shared/ui/monogram";
import { Sparkline } from "@/shared/ui/sparkline";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-5 py-5 sm:px-8">
      <Link href="/" aria-label="SiriInvest home">
        <Logo tone="light" />
      </Link>
      <nav className="flex items-center gap-2">
        <ButtonLink
          href="/login"
          variant="onDarkGhost"
        >
          Log in
        </ButtonLink>
        <ButtonLink
          href="/register"
          variant="invert"
        >
          Get started
        </ButtonLink>
      </nav>
    </header>
  );
}

/**
 * Numbered because this genuinely is a sequence — money moves through these
 * three states in this order, and step two is the one people ask about.
 */
const STEPS = [
  {
    lo: "ຝາກເປັນເງິນກີບ",
    en: "Fund in kip",
    body: "Transfer from any Lao bank account or pay by QR through BCEL One. No foreign account, no wire fees.",
  },
  {
    lo: "ແປງເປັນໂດລາ",
    en: "Convert to dollars",
    body: "We convert at the rate shown before you confirm, and show you the kip figure on every order you place.",
  },
  {
    lo: "ຊື້ຫຸ້ນສະຫະລັດ",
    en: "Buy U.S. stocks",
    body: "Whole or fractional shares in Apple, Nvidia, the S&P 500 and more. Sell and withdraw back to your bank in kip.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <p className="lao text-[13px] text-brand-600">ວິທີການເຮັດວຽກ</p>
      <h2 className="mt-2 max-w-lg font-display text-[28px] font-medium leading-tight tracking-[-0.02em] text-ink-950">
        Three steps between your kip and the New York market.
      </h2>

      <ol className="mt-12 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.en} className="bg-surface p-6">
            <span
              data-numeric
              className="font-mono text-[12px] text-brand-500"
              aria-hidden
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="lao mt-4 text-[15px] font-medium leading-snug text-ink-950">
              {step.lo}
            </h3>
            <p className="mt-1 font-display text-[13px] font-medium text-brand-700">
              {step.en}
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-400">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function MarketStrip() {
  const featured = ["AAPL", "NVDA", "MSFT", "VOO", "TSLA", "AMZN"]
    .map((symbol) => STOCKS.find((stock) => stock.symbol === symbol))
    .filter((stock) => stock !== undefined);

  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="lao text-[13px] text-brand-600">ສິ່ງທີ່ທ່ານຊື້ໄດ້</p>
            <h2 className="mt-2 font-display text-[28px] font-medium leading-tight tracking-[-0.02em] text-ink-950">
              What you can buy
            </h2>
          </div>
          <ButtonLink href="/market" variant="secondary">
            See the full market
          </ButtonLink>
        </div>

        <ul className="mt-8 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((stock) => (
            <li key={stock.symbol}>
              <Link
                href={`/market/${stock.symbol}`}
                className="flex items-center gap-3 bg-surface p-4 transition-colors hover:bg-brand-50/60"
              >
                <Monogram symbol={stock.symbol} color={stock.brandColor} />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[14px] font-medium tracking-tight text-ink-950">
                    {stock.symbol}
                  </p>
                  <p className="truncate text-[12px] text-ink-400">
                    {stock.name}
                  </p>
                </div>
                <Sparkline
                  values={getStockSeries(stock, "3M")}
                  direction={directionOf(stock.changePct)}
                  width={56}
                  height={24}
                  className="hidden shrink-0 sm:block"
                />
                <div className="shrink-0 text-right">
                  <p
                    data-numeric
                    className="font-display text-[14px] font-medium tracking-tight text-ink-950"
                  >
                    {formatUsd(stock.price)}
                  </p>
                  <p
                    data-numeric
                    className={`text-[12px] font-medium ${stock.changePct >= 0 ? "text-gain" : "text-loss"}`}
                  >
                    {formatPct(stock.changePct, { sign: true })}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-[12px] text-ink-300">
          Prices shown are indicative and delayed. Investing carries risk,
          including the loss of your capital.
        </p>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-brand-950 text-white">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-white/10 pb-10">
          <div>
            <h2 className="lao max-w-md font-display text-[24px] font-medium leading-snug tracking-tight">
              ເລີ່ມລົງທຶນຫຸ້ນຕ່າງປະເທດມື້ນີ້
            </h2>
            <p className="mt-2 max-w-md text-[13px] leading-relaxed text-white/50">
              Opening an account takes about five minutes and a national ID.
            </p>
          </div>
          <ButtonLink
            href="/register"
            size="lg"
            variant="invert"
          >
            Create your account
          </ButtonLink>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
          <Logo tone="light" />
          <p className="max-w-lg text-[11px] leading-relaxed text-white/35">
            SiriInvest is a demonstration product. Nothing here is investment
            advice, no orders are real, and no money moves.
          </p>
        </div>
      </div>
    </footer>
  );
}
