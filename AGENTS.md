# SiriInvest monorepo

npm workspaces at the root, one lockfile, two workspaces:

- `apps/web` — the Next.js app. Its own `AGENTS.md` carries the Next.js version
  rules and is rewritten by `next dev`; read it before touching the frontend.
- `apps/api` — the NestJS API, itself a Nest monorepo (`nest-cli.json`,
  `"monorepo": true`). `apps/api/apps/api` is the HTTP service,
  `apps/api/libs/shared` is the shared library, imported as `@app/shared`.

Run everything from the root: `npm run dev` (web on :3000, api on :3001),
`npm run build`, `npm run lint`, `npm run typecheck`, `npm run test`,
`npm run test:e2e`. Install from the root, with `-w <workspace>` to add a
dependency to one side: `npm install -w siriinvest-api @nestjs/schedule`.

The API is Nest 11 on CommonJS. The Nest 12 majors of its companion packages
(`@nestjs/jwt`, `@nestjs/config`) are ESM-only and break ts-jest, so those are
pinned to the matching major — check `"type"` in a package before upgrading.

`apps/api/webpack.config.js` exists because npm hoists dependencies to the repo
root and Nest's default build only treats `apps/api/node_modules` as external.
Without it every hoisted package is inlined into the bundle, which breaks any
native addon — bcrypt first. Leave it in place.

Prisma is version 7, which differs from earlier majors in ways worth knowing
before editing anything under `apps/api/prisma`: the generator is
`prisma-client` (not `prisma-client-js`) writing TypeScript to
`apps/api/generated/prisma`, aliased `@db`; `moduleFormat = "cjs"` because the
API is CommonJS; there is no engine binary, so queries run through the `pg`
driver adapter constructed in `PrismaService`; and configuration lives in
`prisma7.config.ts`, not in `package.json`. `prisma init` also installed
Prisma's own agent skills under `apps/api/.agents/skills` (`.claude` and
`.windsurf` link to them) — read those rather than assuming v5/v6 behaviour.

`npm test` is hermetic. `npm run test:e2e` needs a Postgres at
`TEST_DATABASE_URL` and empties its users table, so it refuses to run when that
is the same database as `DATABASE_URL`.

The two sides are separate TypeScript projects and stay that way: the web app
cannot import `@app/shared`, and the API must not reach into `apps/web`.
Anything both need gets its own workspace package.
