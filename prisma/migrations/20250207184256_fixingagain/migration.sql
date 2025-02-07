/*
  Warnings:

  - The values [UGC,SPONSORED] on the enum `BacklinkType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `oauth_token` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `oauth_token_secret` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `cpc` on the `Keyword` table. All the data in the column will be lost.
  - You are about to drop the column `density` on the `Keyword` table. All the data in the column will be lost.
  - You are about to drop the column `lastChecked` on the `Keyword` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Keyword` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `Keyword` table. All the data in the column will be lost.
  - You are about to alter the column `currentRank` on the `Keyword` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `checkedAt` on the `KeywordHistory` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `KeywordHistory` table. All the data in the column will be lost.
  - You are about to drop the `_KeywordToKeywordGroup` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Keyword` table without a default value. This is not possible if the table is not empty.
  - Made the column `currentRank` on table `Keyword` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `KeywordGroup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BacklinkType_new" AS ENUM ('DOFOLLOW', 'NOFOLLOW');
ALTER TABLE "Backlink" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Backlink" ALTER COLUMN "type" TYPE "BacklinkType_new" USING ("type"::text::"BacklinkType_new");
ALTER TYPE "BacklinkType" RENAME TO "BacklinkType_old";
ALTER TYPE "BacklinkType_new" RENAME TO "BacklinkType";
DROP TYPE "BacklinkType_old";
ALTER TABLE "Backlink" ALTER COLUMN "type" SET DEFAULT 'DOFOLLOW';
COMMIT;

-- AlterEnum
ALTER TYPE "KeywordIntent" ADD VALUE 'COMMERCIAL';

-- DropForeignKey
ALTER TABLE "_KeywordToKeywordGroup" DROP CONSTRAINT "_KeywordToKeywordGroup_A_fkey";

-- DropForeignKey
ALTER TABLE "_KeywordToKeywordGroup" DROP CONSTRAINT "_KeywordToKeywordGroup_B_fkey";

-- DropIndex
DROP INDEX "Keyword_projectId_keyword_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "oauth_token",
DROP COLUMN "oauth_token_secret";

-- AlterTable
ALTER TABLE "Keyword" DROP COLUMN "cpc",
DROP COLUMN "density",
DROP COLUMN "lastChecked",
DROP COLUMN "notes",
DROP COLUMN "priority",
ADD COLUMN     "bestRank" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "keywordGroupId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "url" TEXT,
ALTER COLUMN "currentRank" SET NOT NULL,
ALTER COLUMN "currentRank" SET DEFAULT 0,
ALTER COLUMN "currentRank" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "KeywordGroup" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "KeywordHistory" DROP COLUMN "checkedAt",
DROP COLUMN "position",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "rank" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "gaPropertyId" TEXT,
ADD COLUMN     "gscVerifiedSite" TEXT;

-- DropTable
DROP TABLE "_KeywordToKeywordGroup";

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_keywordGroupId_fkey" FOREIGN KEY ("keywordGroupId") REFERENCES "KeywordGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
