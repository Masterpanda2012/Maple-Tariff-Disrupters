-- AlterTable
ALTER TABLE "BusinessProfile" ADD COLUMN "exposureProfile" JSONB;

-- AlterTable
ALTER TABLE "BusinessNewsReport" ADD COLUMN "reportSections" JSONB;
ALTER TABLE "BusinessNewsReport" ADD COLUMN "severity" TEXT;

-- CreateTable
CREATE TABLE "FxRateSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "base" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "rate" DECIMAL NOT NULL,
    "source" TEXT NOT NULL,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "FxRateSnapshot_fetchedAt_idx" ON "FxRateSnapshot"("fetchedAt");

-- CreateIndex
CREATE INDEX "FxRateSnapshot_base_quote_idx" ON "FxRateSnapshot"("base", "quote");
