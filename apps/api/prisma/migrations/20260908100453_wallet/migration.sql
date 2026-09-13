-- CreateEnum
CREATE TYPE "currency" AS ENUM ('lak', 'usd');

-- CreateEnum
CREATE TYPE "transfer_kind" AS ENUM ('deposit', 'withdrawal');

-- CreateEnum
CREATE TYPE "transfer_status" AS ENUM ('pending', 'settled', 'failed');

-- CreateEnum
CREATE TYPE "cash_entry_kind" AS ENUM ('deposit', 'withdrawal', 'withdrawal_reversal', 'adjustment');

-- CreateTable
CREATE TABLE "fx_rates" (
    "id" UUID NOT NULL,
    "usd_lak" DECIMAL(18,6) NOT NULL,
    "source" TEXT NOT NULL,
    "observed_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "fx_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "kind" "transfer_kind" NOT NULL,
    "status" "transfer_status" NOT NULL DEFAULT 'pending',
    "reference" TEXT NOT NULL,
    "amount_kip" DECIMAL(20,2) NOT NULL,
    "amount_usd" DECIMAL(18,2) NOT NULL,
    "entered_in" "currency" NOT NULL,
    "fx_rate_id" UUID NOT NULL,
    "requested_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settled_at" TIMESTAMPTZ(3),
    "failure_reason" TEXT,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_entries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount_usd" DECIMAL(18,2) NOT NULL,
    "kind" "cash_entry_kind" NOT NULL,
    "transfer_id" UUID,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fx_rates_observed_at_idx" ON "fx_rates"("observed_at");

-- CreateIndex
CREATE UNIQUE INDEX "transfers_reference_key" ON "transfers"("reference");

-- CreateIndex
CREATE INDEX "transfers_user_id_requested_at_idx" ON "transfers"("user_id", "requested_at");

-- CreateIndex
CREATE INDEX "transfers_status_requested_at_idx" ON "transfers"("status", "requested_at");

-- CreateIndex
CREATE INDEX "cash_entries_user_id_created_at_idx" ON "cash_entries"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_fx_rate_id_fkey" FOREIGN KEY ("fx_rate_id") REFERENCES "fx_rates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_entries" ADD CONSTRAINT "cash_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_entries" ADD CONSTRAINT "cash_entries_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "transfers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- One rate to start from: the indicative figure the mock screens used. A seed,
-- not a feed — replace it the moment there is a real source.
INSERT INTO "fx_rates" ("id", "usd_lak", "source", "observed_at") VALUES
    (gen_random_uuid(), 21650.000000, 'seed:indicative', CURRENT_TIMESTAMP);
