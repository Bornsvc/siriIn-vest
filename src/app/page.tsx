import {
  HowItWorks,
  LiveBridge,
  MarketStrip,
  SiteFooter,
  SiteHeader,
} from "@/features/marketing";
import { ButtonLink } from "@/shared/ui";

export default function LandingPage() {
  return (
    <>
      {/* The hero states the product's whole premise as a fact, not a promise. */}
      <div className="bg-brand-950 text-white">
        <SiteHeader />

        <section className="bg-grid mx-auto max-w-6xl px-5 pb-24 pt-12 sm:px-8 sm:pt-20">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
            <div>
              <p
                className="lao rise text-[14px] leading-none text-brand-300"
                style={{ "--rise-delay": "0ms" } as React.CSSProperties}
              >
                ລົງທຶນຫຸ້ນຕ່າງປະເທດຈາກລາວ
              </p>

              <h1
                className="rise mt-5 max-w-xl font-display text-[40px] font-medium leading-[1.08] tracking-[-0.03em] sm:text-[54px]"
                style={{ "--rise-delay": "90ms" } as React.CSSProperties}
              >
                The U.S. market opens at{" "}
                <span className="text-brand-300">20:30</span> in Vientiane.
              </h1>

              <p
                className="rise mt-6 max-w-lg text-[15px] leading-relaxed text-white/60"
                style={{ "--rise-delay": "180ms" } as React.CSSProperties}
              >
                SiriInvest gets you there. Fund your account in kip, buy Apple,
                Nvidia or the S&amp;P 500 in dollars, and withdraw back to your
                Lao bank when you sell.
              </p>

              <div
                className="rise mt-9 flex flex-wrap gap-3"
                style={{ "--rise-delay": "270ms" } as React.CSSProperties}
              >
                <ButtonLink
                  href="/register"
                  size="lg"
                  className="border-0 bg-white text-brand-900 hover:bg-brand-50"
                >
                  Open an account
                </ButtonLink>
                <ButtonLink
                  href="/home"
                  size="lg"
                  className="border border-white/20 bg-white/5 text-white hover:bg-white/15"
                >
                  See the demo account
                </ButtonLink>
              </div>

              <p
                className="rise mt-6 text-[12px] text-white/35"
                style={{ "--rise-delay": "340ms" } as React.CSSProperties}
              >
                Five minutes and a national ID to open. No minimum balance.
              </p>
            </div>

            <div
              className="rise"
              style={{ "--rise-delay": "220ms" } as React.CSSProperties}
            >
              <LiveBridge />
            </div>
          </div>
        </section>
      </div>

      <HowItWorks />
      <MarketStrip />
      <SiteFooter />
    </>
  );
}
