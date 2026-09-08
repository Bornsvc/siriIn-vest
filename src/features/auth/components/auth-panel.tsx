import { USD_LAK } from "@/shared/lib/format";
import { Logo } from "@/shared/ui";

/**
 * The two facts the Bridge Bar carries, restated for someone who has not
 * signed in yet: the rate their kip converts at, and when the market they
 * are about to buy into actually opens in their own timezone.
 *
 * Both are static strings, so this renders on the server with no clock and
 * no hydration mismatch.
 */
const PROOF = [
  { label: "Rate", value: `1 USD = ₭${USD_LAK.toLocaleString("en-US")}` },
  { label: "Session", value: "NYSE opens 20:30 in Vientiane" },
];

/**
 * Left half of the signed-out screen. Flat brand-950, hairline rules, no
 * decoration — the panel's job is to say what the product is and then get
 * out of the way of the form.
 */
export function AuthPanel() {
  return (
    <aside className="hidden w-[44%] max-w-[520px] shrink-0 flex-col justify-between border-r border-brand-900 bg-brand-950 px-10 py-10 lg:flex xl:px-12">
      <Logo tone="light" />

      <div className="max-w-[23rem]">
        <p className="lao text-[13px] leading-none text-brand-300">
          ລົງທຶນທົ່ວໂລກ ເຕີບໂຕໄປນຳກັນ
        </p>
        <h2 className="mt-3 font-display text-[26px] font-medium leading-[1.28] tracking-[-0.02em] text-white">
          Own a piece of the U.S. market, from Vientiane.
        </h2>
        <p className="mt-3.5 text-[13px] leading-relaxed text-brand-200/85">
          Fund in kip, trade in dollars, settle back to your Lao bank. The gap
          between those three is the only thing we ask you to look at.
        </p>
      </div>

      <dl className="border-t border-white/10">
        {PROOF.map((item) => (
          <div
            key={item.label}
            className="flex items-baseline justify-between gap-4 border-b border-white/10 py-3"
          >
            <dt className="text-[10px] uppercase tracking-[0.1em] text-white/35">
              {item.label}
            </dt>
            <dd data-numeric className="font-mono text-[12px] text-brand-100">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

/**
 * The same two facts compressed onto one line, for the screens where the
 * panel is hidden.
 */
export function AuthProofLine() {
  return (
    <p
      data-numeric
      className="mt-4 font-mono text-[11px] leading-relaxed text-ink-300 lg:hidden"
    >
      1 USD = ₭{USD_LAK.toLocaleString("en-US")}
      <span aria-hidden className="mx-1.5 text-line-strong">
        ·
      </span>
      NYSE opens 20:30 VTE
    </p>
  );
}
