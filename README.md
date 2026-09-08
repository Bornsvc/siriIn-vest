# SiriInvest

ຊື້ຫຸ້ນຕ່າງປະເທດ. A platform for Lao investors buying U.S. stocks and ETFs. The
web build carries the mobile product's theme onto the desktop rather than
shrinking a desktop app onto a phone.

MVP status: every screen runs on mock data in `apps/web/src/mock`. The API is a
fresh NestJS scaffold — no auth, no money moves.

## Running it

An npm workspace. Install once, at the root:

```bash
npm install

npm run dev        # web on :3000, api on :3001
npm run build
npm run lint
npm run typecheck
npm run test       # api only, for now
```

One side at a time:

```bash
npm run dev:web    # or: npm run dev -w siriinvest-web
npm run dev:api    # or: npm run start:dev -w siriinvest-api
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
apps/
  web/                    Next.js — the screens
  api/                    NestJS, in Nest's own monorepo mode
    apps/api/             the HTTP service
    libs/shared/          shared library, imported as @app/shared
```

### apps/web

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

Swapping the mock layer for `apps/api` means replacing `src/mock` and leaving
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

### apps/api

```
apps/api/
  prisma/schema.prisma    the database, and the migrations that built it
  src/
    auth/                 sign-up, sign-in, the session token
      dto/                the request bodies, validated at the door
      guards/             JwtAuthGuard and the CurrentUser it provides
      validation/         account rules, kept in step with the web forms
    users/                the User record and its storage seam
    prisma/               the client, connected and disconnected with the app
    common/               the error envelope, the filter, the validation pipe
```

| Method | Route | |
| --- | --- | --- |
| `POST` | `/auth/sign-up` | `name`, `email`, `phone`, `password`, `acceptedTerms` → 201 with a session |
| `POST` | `/auth/sign-in` | `email`, `password` → 200 with a session |
| `GET` | `/auth/me` | the caller, behind `Authorization: Bearer …` |

`phone` is the national part only — +856 is furniture on the form, so the API
takes the same digits the customer types and stores E.164. A new account is
`unverified` until KYC clears, which is why the register form goes to `/verify`.

Every failure has one shape, so a client parses one thing:

```json
{ "error": { "code": "VALIDATION_FAILED", "message": "…", "details": [{ "field": "phone", "message": "…" }] } }
```

Field messages are the copy the web forms already show — the rules in
`auth/validation/account-rules.ts` are a port of
`apps/web/src/features/auth/lib/validation.ts`, and a spec holds them to it.

`UsersRepository` is abstract and `UsersModule` is the single line that names an
implementation — `PrismaUsersRepository` in the app, `InMemoryUsersRepository`
in the unit tests. Neither the service nor its specs know which one they have.

### The database

Postgres, through Prisma 7. Once:

```bash
createdb siriinvest_dev && createdb siriinvest_test
cp apps/api/.env.example apps/api/.env   # then put your Postgres user in it
npm run db:migrate                       # dev database
npm run db:test:setup                    # the one the e2e suite empties
```

Then `npm run db:migrate` after any change to `prisma/schema.prisma`, and
`npm run db:studio` to browse rows. `npm install` regenerates the client, so
`apps/api/generated/` is not committed.

Prisma 7 has no engine binary — queries go through a `pg` driver adapter owned
by `PrismaService`, which is why `DATABASE_URL` is read by the app rather than
by Prisma. The generated client is imported as `@db`.

`npm test` needs nothing; `npm run test:e2e` needs Postgres, and runs against
`TEST_DATABASE_URL`, refusing to start if that is the development database.

Without `JWT_SECRET` the API signs with a development secret and warns on every
boot; in production it refuses to start.

Add services with the Nest CLI from `apps/api`:

```bash
nest g app <name>          # another deployable service under apps/
nest g lib <name>          # another shared library under libs/
nest g resource <name> -p api
```

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4
with a CSS-first `@theme`. No component library, no chart library, no state
library — charts are hand-drawn SVG so the product owns its own visual language.

NestJS 11 on Express for the API, in the CLI's monorepo mode.
