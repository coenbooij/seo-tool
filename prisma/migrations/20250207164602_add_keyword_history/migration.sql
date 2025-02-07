-- CreateTable
CREATE TABLE "KeywordHistory" (
    "id" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "position" DOUBLE PRECISION NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeywordHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KeywordHistory" ADD CONSTRAINT "KeywordHistory_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;
