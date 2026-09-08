// Brings the end-to-end test database up to the current migrations.
//
// The e2e suite empties the users table, so it must never point at the
// development database. Both checks below exist to make that impossible by
// accident rather than by convention.

const { execFileSync } = require('node:child_process');

const url = process.env.TEST_DATABASE_URL;

if (!url) {
  console.error(
    'TEST_DATABASE_URL is not set. Copy it from apps/api/.env.example into apps/api/.env.',
  );
  process.exit(1);
}

if (url === process.env.DATABASE_URL) {
  console.error(
    'TEST_DATABASE_URL is the same as DATABASE_URL. The e2e suite empties the database it runs against, so these must differ.',
  );
  process.exit(1);
}

execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: url },
});
