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
the screens alone. The identity form is the first screen to make the trip: its
province select is fed by `GET /provinces` through `shared/lib/api.ts`, so
`/verify` renders per request rather than being prerendered. Set `API_URL` if
the API is not on :3001 — see `apps/web/.env.example`.

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
| `GET` | `/profile` | the signed-in customer as the app shell draws them |
| `GET` | `/provinces` | the 18 divisions, public — the identity form needs them before anyone has an account |
| `GET` | `/fund-sources` | the six answers to "where is the money from", public for the same reason |
| `POST` | `/kyc/uploads` | a signed URL for one photo; the browser PUTs straight to the bucket |
| `POST` | `/kyc/submissions` | one identity check: the three steps of the form in one request |
| `GET` | `/kyc/submissions/me` | the caller's most recent check |

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

`GET /profile` returns the same field names as `User` in
`apps/web/src/shared/types`, so the screens that read `USER` from `src/mock`
can swap the import and change nothing else. `kycStatus` is derived: the
account's own status, unless a check is still with the reviewer.

### The database

Postgres 17 in Docker, through Prisma 7. Once:

```bash
cp apps/api/.env.example apps/api/.env
npm run db:up            # starts the container, waits until it is healthy
npm run db:migrate       # dev database
npm run db:test:setup    # the one the e2e suite empties
```

`compose.yaml` creates both databases and keeps their data in a named volume,
so `npm run db:down` stops the container without losing rows — only
`docker compose down -v` throws them away. It binds **127.0.0.1:5434**, not the
usual 5432: the container is reachable from this machine only, and 5432 is left
to whatever Postgres you already run. Set `POSTGRES_PORT` and edit
`apps/api/.env` to move it.

Then `npm run db:migrate` after any change to `prisma/schema.prisma`, and
`npm run db:studio` to browse rows.

### Identity documents

Photos go to Google Cloud Storage, never through the API:

```
browser ──POST /kyc/uploads──▶ api          (mints a key, signs a V4 PUT URL)
browser ──PUT (signed URL)──▶ bucket        (the bytes, direct)
browser ──POST /kyc/submissions──▶ api      (quotes the keys back)
                                   └──▶ bucket: what is actually there?
```

The API mints the key — `kyc/<user id>/<kind>/<uuid>.jpg` — so a client cannot
choose where its file lands or quote a key belonging to someone else. Nothing
about the file is taken on the client's word either: content type, size and
checksum are read back from the bucket when the submission arrives, because a
signed PUT cannot cap what is uploaded through it.

`ObjectStorage` is abstract and `StorageModule` names the implementation, so
the identity flow is tested against a fake and needs no service account to run.

`kyc_submissions` holds one identity check as it was submitted — the details
are a snapshot, not fields on the user, so a rejected customer who re-submits
with a corrected spelling leaves two attempts on the record. `kyc_documents`
points at photos in Google Cloud Storage: a `storage_key`, its content type,
size and SHA-256, and never the bytes. `@@unique([submissionId, kind])` is what
makes "a passport has one photo page, an ID card has two sides" a rule the
database keeps rather than only the form. Every row carries `purge_after`, from
`KYC_RETENTION_DAYS`.

`provinces` is reference data — Laos' 17 provinces and the capital prefecture,
seeded by its own migration so every database that migrates has the list. Rows
are keyed on a slug (`luang-prabang`), because the romanization of a Lao name is
a display choice and nothing should join on one. `npm install` regenerates the client, so
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
