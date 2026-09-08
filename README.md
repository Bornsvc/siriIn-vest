# SiriInvest — web

ຊື້ຫຸ້ນຕ່າງປະເທດ. The web build of SiriInvest, a platform for Lao investors
buying U.S. stocks and ETFs. It carries the mobile product's theme onto the
desktop rather than shrinking a desktop app onto a phone.

MVP status: every screen runs on mock data in `src/mock`. No backend, no auth,
no money moves.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
npx tsc --noEmit
```

## The idea

A Lao investor's money is in kip, the market they are buying is in dollars, and
it opens at 20:30 their time. That gap is the product, so the app is built on
top of it: a **Bridge Bar** pinned above every screen carries two clocks
(Vientiane / New York), the NYSE session state, and the LAK⇄USD rate. Every
figure that matters is shown in dollars *and* kip.

Everything else stays deliberately quiet. See [docs/DESIGN.md](docs/DESIGN.md)
for the tokens, the primitives and the writing rules.

## Layout

```
src/
  app/                    routes only — thin, composes features
    page.tsx              landing
    (auth)/               signed-out: login, register, verify
    (app)/                signed-in shell: BridgeBar + SideRail + TopBar
      home  market  market/[symbol]  portfolio
      wallet  wallet/deposit  wallet/withdraw
      notifications  account  settings
  features/               one folder per feature, public surface in index.ts
    shell dashboard marketing market trade portfolio
    wallet notifications auth account
  shared/
    ui/                   design-system primitives — the only place they live
    lib/                  cn, format (money + kip), market session
    config/               navigation
    types/                domain types
  mock/                   stands in for the API
    stocks account series selectors
```

Two rules keep it from tangling:

- A page imports from `@/features/*` and `@/shared/*`. Features talk to each
  other through `index.ts`, never by reaching into `components/`.
- Every derived money figure comes from `@/mock/selectors`. Nothing recomputes
  a portfolio total in a component, so no two screens can disagree.

Swapping the mock layer for a real API means replacing `src/mock` and leaving
the screens alone.

## Screens

| Route | Mobile design |
| --- | --- |
| `/` | 1–2 Splash / Onboarding |
| `/register`, `/verify` | 3 Register, 4 KYC |
| `/login` | — |
| `/home` | 5 Home |
| `/market` | 6 Market / Search |
| `/market/[symbol]` | 7–8 Stock detail, order ticket and confirmation |
| `/portfolio` | 9 Portfolio — holdings, performance, history |
| `/wallet/deposit` | 10 Deposit (LAK / USD) |
| `/wallet/withdraw` | 11 Withdrawal |
| `/notifications` | 12 Notifications |
| `/account` | 13 Profile |
| `/settings` | 14 Settings |

`/wallet` is new: a hub the phone had no room for.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4
with a CSS-first `@theme`. No component library, no chart library, no state
library — charts are hand-drawn SVG so the product owns its own visual language.
