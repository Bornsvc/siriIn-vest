# SiriInvest web — design & architecture contract

The web app carries the mobile product's theme onto the desktop. Same emerald,
same card language, same vocabulary — laid out for a screen that can show a
portfolio and a market at the same time.

## The thesis

A Lao investor's money is in kip, the market they are buying is in dollars, and
it opens at 20:30 their time. That gap is the product, so it is standing
furniture: the **Bridge Bar** pinned above everything carries two clocks
(Vientiane / New York), the NYSE session state, and the LAK⇄USD rate.

Everything else stays quiet. The Bridge Bar is the one loud element — do not
add competing hero treatments, gradients or decorative motion elsewhere.

## Architecture

Feature-based. A feature owns its UI and its logic; `shared/` owns anything two
features both need; `app/` holds routes only and stays thin.

```
src/
  app/                     routes only — compose features, no business logic
    (app)/                 authenticated shell: BridgeBar + SideRail + TopBar
    (auth)/                signed-out: split brand panel + form
  features/
    <feature>/
      components/          feature UI
      index.ts             the feature's public surface
  shared/
    ui/                    design-system primitives (the only place they live)
    lib/                   cn, format, market session
    config/                nav
    types/                 domain types
  mock/                    stands in for the API — swap this, not the screens
```

Rules:

- A page imports from `@/features/*` and `@/shared/*`. It does not reach into
  another feature's `components/` folder — go through its `index.ts`.
- Derived money figures come from `@/mock/selectors`, never recomputed in a
  component, so no two screens can disagree about the portfolio.
- No new dependencies. Everything here is React, Next and Tailwind v4.

## Tokens

Defined in `src/app/globals.css` under `@theme`. Use the Tailwind classes they
generate — never a raw hex in a component.

| Role | Token |
| --- | --- |
| Primary action, active nav | `brand-700`, hover `brand-800` |
| Accent, logo, live dot | `brand-500` |
| Tints, chips, hover fills | `brand-50`, `brand-100` |
| Bridge Bar ground | `brand-950` |
| Gain / loss | `gain`, `loss` (+ `gain-soft`, `loss-soft`) |
| Body text | `ink-950`, secondary `ink-400`, tertiary `ink-300` |
| Page ground / card | `canvas` / `surface` |
| Hairlines | `line`, `line-strong` |
| Radii | `rounded-card` (16), `rounded-tile` (12), `rounded-pill` |
| Shadow | `shadow-card`, `shadow-pop` |

Type: `font-display` (Space Grotesk) for headings, prices and any large
number. Body and UI default to IBM Plex Sans. `font-mono` (IBM Plex Mono) for
tickers, order ids and the rate rail. Lao glyphs fall through automatically;
add `.lao` when a run of text is Lao so it gets the taller line-height.

Put `data-numeric` on every element holding a figure — it switches on tabular
numerals so columns of prices line up.

## Language

The product is Lao-first with English as the working language of the market.
The pattern throughout: **Lao label, English underneath or beside it**, and
financial data (tickers, prices, order types) stays in English. `PageHeader`
and `CardHeader` both take a Lao `eyebrow` plus an English `title` — use them
rather than hand-rolling headings.

## Primitives — use these, don't rebuild them

From `@/shared/ui`:

`Button` / `ButtonLink` (`primary` `secondary` `ghost` `danger` `sell`) ·
`Card` `CardHeader` `CardBody` · `Badge` `Chip` · `Delta` (change with a
direction triangle, never colour alone) `Money` · `Monogram` (brand tile — we
draw marks, we do not ship logo files) · `Sparkline` · `Tabs` `UnderlineTabs` ·
`Field` `Input` `Select` · `EmptyState` `Skeleton` `Note` · `Sheet` (right
panel on desktop, bottom sheet on mobile) · `StockRow` `RowList` · `Logo`

Icons live in `@/shared/ui/icons` — add to that file rather than inlining SVG.

From `@/features/shell`: `PageHeader` opens every page.

## Formatting

Everything money- or time-shaped goes through `@/shared/lib/format`:
`formatUsd` `formatLak` `formatPct` `formatCompact` `formatShares`
`formatRelative` `directionOf`, and `USD_LAK` / `usdToLak` / `lakToUsd`.
Negative numbers use a true minus (−), not a hyphen — the helpers handle it.

## Writing

Active voice, sentence case, no filler. A control says what it does and keeps
that name through the flow: the button that says **Buy AAPL** produces a
confirmation that says **Order placed**. Errors state what happened and how to
fix it. An empty screen carries the action that fills it.

## Quality floor

Responsive to 375px · visible keyboard focus (already global) · direction never
signalled by colour alone · `prefers-reduced-motion` respected (already global)
· no hydration mismatches — anything time-dependent renders after mount.

Two traps this codebase has already hit, both silent:

- **Grid children need `min-w-0`.** A grid item defaults to `min-width: auto`,
  so below the `lg` breakpoint — where a two-column layout collapses to one
  `auto` column — a single wide child pushes the whole page past the viewport.
  Every direct child of a responsive grid carries `min-w-0`.
- **Never override a variant's colour via `className`.** `text-white` and
  `text-brand-900` have equal specificity, so stylesheet order decides, not
  class order — the override loses silently and you ship a white button with
  white text. Add a variant to `Button` instead (`invert`, `onDark`,
  `onDarkGhost` exist for dark grounds).
