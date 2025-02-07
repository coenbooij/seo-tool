import { KeywordIntent } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface KeywordData {
  id: string;
  keyword: string;
  intent: KeywordIntent;
  searchVolume: number;
  difficulty: number;
  competition: number;
  cpc: number;
  currentRank: number | null;
  density: number | null;
  priority: number | null;
  notes: string | null;
  lastChecked: Date | null;
  projectId: string;
  groups: {
    id: string;
    name: string;
  }[];
}

export interface SerpPosition {
  position: number;
  url: string;
  title: string;
}

export interface KeywordHistoryData {
  date: Date;
  position: number;
}

export const INITIAL_KEYWORD_DATA: Partial<KeywordData> = {
  searchVolume: 0,
  difficulty: 0,
  competition: 0,
  cpc: 0,
  currentRank: null,
  density: null,
  priority: null,
  notes: null,
  lastChecked: null,
};

export async function getProjectKeywords(projectId: string) {
  const keywords = await prisma.keyword.findMany({
    where: {
      projectId,
    },
    include: {
      groups: {
        select: {
          id: true,
          name: true,
        },
      },
      history: {
        orderBy: {
          checkedAt: 'desc',
        },
        take: 1,
      },
    },
    orderBy: {
      priority: 'desc',
    },
  });

  return keywords;
}

export async function getKeywordHistory(keywordId: string) {
  const history = await prisma.keywordHistory.findMany({
    where: {
      keywordId,
    },
    orderBy: {
      checkedAt: 'asc',
    },
  });

  return history;
}

export async function updateKeywordMetrics(keywordId: string, metrics: {
  currentRank?: number;
  searchVolume?: number;
  difficulty?: number;
  competition?: number;
  cpc?: number;
  density?: number;
}) {
  const keyword = await prisma.keyword.update({
    where: {
      id: keywordId,
    },
    data: {
      ...metrics,
      lastChecked: new Date(),
    },
  });

  // Create history entry for rank changes
  if (typeof metrics.currentRank === 'number') {
    await prisma.keywordHistory.create({
      data: {
        keywordId,
        position: metrics.currentRank,
        checkedAt: new Date(),
      },
    });
  }

  return keyword;
}

export async function addKeywordToGroup(keywordId: string, groupId: string) {
  return prisma.keywordGroup.update({
    where: {
      id: groupId,
    },
    data: {
      keywords: {
        connect: {
          id: keywordId,
        },
      },
    },
  });
}

export async function removeKeywordFromGroup(keywordId: string, groupId: string) {
  return prisma.keywordGroup.update({
    where: {
      id: groupId,
    },
    data: {
      keywords: {
        disconnect: {
          id: keywordId,
        },
      },
    },
  });
}