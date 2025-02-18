-- CreateEnum
CREATE TYPE "KeywordIntent" AS ENUM ('INFORMATIONAL', 'NAVIGATIONAL', 'COMMERCIAL', 'TRANSACTIONAL');

-- CreateEnum
CREATE TYPE "KeywordSource" AS ENUM ('BRAINSTORM', 'GSC', 'ANALYTICS', 'COMPETITOR', 'TOOL', 'MANUAL');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('NOT_STARTED', 'PLANNED', 'IN_PROGRESS', 'PUBLISHED', 'NEEDS_UPDATE');

-- CreateEnum
CREATE TYPE "BacklinkType" AS ENUM ('DOFOLLOW', 'NOFOLLOW', 'UGC', 'SPONSORED');

-- CreateEnum
CREATE TYPE "BacklinkStatus" AS ENUM ('ACTIVE', 'LOST', 'BROKEN');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT,
    "sitemapUrl" TEXT,
    "gaPropertyId" TEXT,
    "gscVerifiedSite" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Backlink" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "anchorText" TEXT NOT NULL,
    "domainAuthority" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "type" "BacklinkType" NOT NULL DEFAULT 'DOFOLLOW',
    "status" "BacklinkStatus" NOT NULL DEFAULT 'ACTIVE',
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastChecked" TIMESTAMP(3),
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authority" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Backlink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BacklinkHistory" (
    "id" TEXT NOT NULL,
    "backlinkId" TEXT NOT NULL,
    "status" "BacklinkStatus" NOT NULL DEFAULT 'ACTIVE',
    "domainAuthority" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BacklinkHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "intent" "KeywordIntent" NOT NULL DEFAULT 'INFORMATIONAL',
    "searchVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "competition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentRank" INTEGER NOT NULL DEFAULT 0,
    "bestRank" INTEGER NOT NULL DEFAULT 0,
    "url" TEXT,
    "source" "KeywordSource" NOT NULL DEFAULT 'MANUAL',
    "seasonality" JSONB,
    "serpFeatures" TEXT[],
    "contentStatus" "ContentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "contentPriority" INTEGER DEFAULT 0,
    "contentType" TEXT,
    "contentBrief" TEXT,
    "clusterName" TEXT,
    "clusterScore" DOUBLE PRECISION DEFAULT 0,
    "parentKeyword" TEXT,
    "trends" JSONB,
    "notes" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "keywordGroupId" TEXT,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeywordHistory" (
    "id" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeywordHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeywordGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeywordGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE INDEX "Keyword_clusterName_idx" ON "Keyword"("clusterName");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Backlink" ADD CONSTRAINT "Backlink_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BacklinkHistory" ADD CONSTRAINT "BacklinkHistory_backlinkId_fkey" FOREIGN KEY ("backlinkId") REFERENCES "Backlink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_keywordGroupId_fkey" FOREIGN KEY ("keywordGroupId") REFERENCES "KeywordGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeywordHistory" ADD CONSTRAINT "KeywordHistory_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeywordGroup" ADD CONSTRAINT "KeywordGroup_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
