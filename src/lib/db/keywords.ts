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
      keywordGroup: {
        select: {
          id: true,
          name: true,
        },
      },
      history: {
        orderBy: {
          date: 'desc',
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Transform the response to match the expected interface
  return keywords.map(keyword => ({
    ...keyword,
    groups: keyword.keywordGroup ? [keyword.keywordGroup] : [],
  }));
}

export async function getKeywordHistory(keywordId: string) {
  const history = await prisma.keywordHistory.findMany({
    where: {
      keywordId,
    },
    orderBy: {
      date: 'asc',
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
    data: metrics,
  });

  // Create history entry for rank changes
  if (typeof metrics.currentRank === 'number') {
    await prisma.keywordHistory.create({
      data: {
        keywordId,
        rank: metrics.currentRank,
        date: new Date(),
      },
    });
  }

  return keyword;
}

export async function addKeywordToGroup(keywordId: string, groupId: string) {
  return prisma.keyword.update({
    where: {
      id: keywordId,
    },
    data: {
      keywordGroup: {
        connect: {
          id: groupId,
        },
      },
    },
  });
}

export async function removeKeywordFromGroup(keywordId: string, groupId: string) {
  return prisma.keyword.update({
    where: {
      id: keywordId,
    },
    data: {
      keywordGroup: {
        disconnect: true,
      },
    },
  });
}