import 'dotenv/config';

/**
 * Every end-to-end suite boots the real AppModule, so every one of them needs
 * a real database. They get their own: the suites empty the users table, and
 * doing that to the development database would be a nasty surprise.
 *
 * Loaded by `setupFiles` in jest-e2e.json, before any suite is imported.
 */
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error(
    'TEST_DATABASE_URL is not set. Copy apps/api/.env.example to apps/api/.env, then run `npm run db:test:setup`.',
  );
}

if (testDatabaseUrl === process.env.DATABASE_URL) {
  throw new Error(
    'TEST_DATABASE_URL is the same as DATABASE_URL. These suites empty the database they run against, so the two must differ.',
  );
}

process.env.DATABASE_URL = testDatabaseUrl;
process.env.JWT_SECRET ??= 'end-to-end-test-secret';

// StorageModule refuses to start without a bucket. The suites override
// ObjectStorage with a fake, so this name is never dialled — but the config it
// satisfies is the same one production reads, which is the point.
process.env.GCS_BUCKET ??= 'siriinvest-kyc-test';
