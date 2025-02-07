/*
  Warnings:

  - Added the required column `anchorText` to the `Backlink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetUrl` to the `Backlink` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BacklinkType" AS ENUM ('DOFOLLOW', 'NOFOLLOW', 'UGC', 'SPONSORED');

-- CreateEnum
CREATE TYPE "BacklinkStatus" AS ENUM ('ACTIVE', 'LOST', 'BROKEN');

-- AlterTable
ALTER TABLE "Backlink" ADD COLUMN     "anchorText" TEXT NOT NULL,
ADD COLUMN     "domainAuthority" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastChecked" TIMESTAMP(3),
ADD COLUMN     "status" "BacklinkStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "targetUrl" TEXT NOT NULL,
ADD COLUMN     "type" "BacklinkType" NOT NULL DEFAULT 'DOFOLLOW',
ALTER COLUMN "authority" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "BacklinkHistory" (
    "id" TEXT NOT NULL,
    "backlinkId" TEXT NOT NULL,
    "status" "BacklinkStatus" NOT NULL DEFAULT 'ACTIVE',
    "domainAuthority" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BacklinkHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BacklinkHistory" ADD CONSTRAINT "BacklinkHistory_backlinkId_fkey" FOREIGN KEY ("backlinkId") REFERENCES "Backlink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
