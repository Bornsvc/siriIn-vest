-- CreateEnum
CREATE TYPE "kyc_status" AS ENUM ('in_review', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "document_type" AS ENUM ('national_id', 'passport');

-- CreateEnum
CREATE TYPE "document_kind" AS ENUM ('id_front', 'id_back', 'passport_page', 'selfie');

-- CreateTable
CREATE TABLE "fund_sources" (
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "fund_sources_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "kyc_submissions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "kyc_status" NOT NULL DEFAULT 'in_review',
    "full_name" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "village" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "province_code" TEXT NOT NULL,
    "fund_source_code" TEXT NOT NULL,
    "document_type" "document_type" NOT NULL,
    "document_number" TEXT NOT NULL,
    "submitted_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ(3),
    "review_note" TEXT,
    "purge_after" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "kyc_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_documents" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "kind" "document_kind" NOT NULL,
    "storage_key" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "byte_size" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "uploaded_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kyc_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fund_sources_label_key" ON "fund_sources"("label");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_submissions_reference_key" ON "kyc_submissions"("reference");

-- CreateIndex
CREATE INDEX "kyc_submissions_user_id_submitted_at_idx" ON "kyc_submissions"("user_id", "submitted_at");

-- CreateIndex
CREATE INDEX "kyc_submissions_status_submitted_at_idx" ON "kyc_submissions"("status", "submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_documents_submission_id_kind_key" ON "kyc_documents"("submission_id", "kind");

-- AddForeignKey
ALTER TABLE "kyc_submissions" ADD CONSTRAINT "kyc_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_submissions" ADD CONSTRAINT "kyc_submissions_province_code_fkey" FOREIGN KEY ("province_code") REFERENCES "provinces"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_submissions" ADD CONSTRAINT "kyc_submissions_fund_source_code_fkey" FOREIGN KEY ("fund_source_code") REFERENCES "fund_sources"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "kyc_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Reference data, moved out of the frontend so a submission can point at a row
-- rather than repeat a string. Order is the order the form offers them.
INSERT INTO "fund_sources" ("code", "label", "position") VALUES
    ('salary',      'Salary or wages',              1),
    ('business',    'Business income',              2),
    ('savings',     'Savings',                      3),
    ('investments', 'Returns on other investments', 4),
    ('family',      'Family support or gift',       5),
    ('inheritance', 'Inheritance',                  6);
