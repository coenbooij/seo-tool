-- CreateEnum
CREATE TYPE "KeywordSource" AS ENUM (
    'BRAINSTORM',
    'GSC',
    'ANALYTICS',
    'COMPETITOR',
    'TOOL',
    'MANUAL'
);

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM (
    'NOT_STARTED',
    'PLANNED',
    'IN_PROGRESS',
    'PUBLISHED',
    'NEEDS_UPDATE'
);

-- AlterTable
ALTER TABLE "Keyword" ADD COLUMN "source" "KeywordSource" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN "seasonality" JSONB,
ADD COLUMN "serpFeatures" TEXT[],
ADD COLUMN "contentStatus" "ContentStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN "contentPriority" INTEGER DEFAULT 0,
ADD COLUMN "contentType" TEXT,
ADD COLUMN "contentBrief" TEXT,
ADD COLUMN "clusterName" TEXT,
ADD COLUMN "clusterScore" FLOAT DEFAULT 0,
ADD COLUMN "parentKeyword" TEXT,
ADD COLUMN "trends" JSONB,
ADD COLUMN "notes" TEXT;

-- CreateIndex
CREATE INDEX "keyword_cluster_idx" ON "Keyword"("clusterName");