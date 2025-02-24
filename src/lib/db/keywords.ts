import { prisma } from "@/lib/prisma";
import { KeywordData } from "@/app/dashboard/projects/[id]/keywords/types";

export async function getProjectKeywords(projectId: string): Promise<KeywordData[]> {
  const keywords = await prisma.keyword.findMany({
    where: {
      projectId,
    },
    include: {
      keywordGroup: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return keywords.map((keyword) => ({
    id: keyword.id,
    keyword: keyword.keyword,
    intent: keyword.intent,
    searchVolume: keyword.searchVolume,
    currentRank: keyword.currentRank,
    projectId: keyword.projectId,
  }));
}
