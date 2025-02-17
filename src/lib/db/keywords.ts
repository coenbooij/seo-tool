import { prisma } from '@/lib/prisma';
import { KeywordData, KeywordSource, ContentStatus } from '@/app/dashboard/projects/[id]/keywords/types';

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
      history: {
        orderBy: {
          date: 'desc',
        },
        take: 1,
      },
    },
  });

  // Transform the data to match KeywordData type
  return keywords.map(keyword => ({
    id: keyword.id,
    keyword: keyword.keyword,
    intent: keyword.intent,
    searchVolume: keyword.searchVolume,
    difficulty: keyword.difficulty,
    competition: keyword.competition,
    cpc: 0, // Default value since it's not in the database yet
    currentRank: keyword.currentRank,
    density: null, // Default value since it's not in the database yet
    priority: null, // Default value since it's not in the database yet
    notes: null, // Default value since it's not in the database yet
    lastChecked: keyword.history[0]?.date || null,
    projectId: keyword.projectId,
    position: keyword.currentRank,
    groups: keyword.keywordGroup ? [{ 
      id: keyword.keywordGroup.id, 
      name: keyword.keywordGroup.name 
    }] : [],
    source: KeywordSource.MANUAL, // Default value since it's not in the database yet
    serpFeatures: [], // Default value since it's not in the database yet
    contentStatus: ContentStatus.NOT_STARTED, // Default value since it's not in the database yet
    contentPriority: 0, // Default value since it's not in the database yet
  }));
}

export async function addKeywords(projectId: string, keywords: KeywordData[]): Promise<KeywordData[]> {
  const createdKeywords = await prisma.$transaction(
    keywords.map(keyword =>
      prisma.keyword.create({
        data: {
          keyword: keyword.keyword,
          intent: keyword.intent,
          searchVolume: keyword.searchVolume,
          difficulty: keyword.difficulty,
          competition: keyword.competition,
          currentRank: 0,
          bestRank: 0,
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
      })
    )
  );

  return createdKeywords.map(keyword => ({
    id: keyword.id,
    keyword: keyword.keyword,
    intent: keyword.intent,
    searchVolume: keyword.searchVolume,
    difficulty: keyword.difficulty,
    competition: keyword.competition,
    cpc: 0,
    currentRank: keyword.currentRank,
    density: null,
    priority: null,
    notes: null,
    lastChecked: null,
    projectId: keyword.projectId,
    position: keyword.currentRank,
    groups: keyword.keywordGroup ? [{ 
      id: keyword.keywordGroup.id, 
      name: keyword.keywordGroup.name 
    }] : [],
    source: KeywordSource.MANUAL,
    serpFeatures: [],
    contentStatus: ContentStatus.NOT_STARTED,
    contentPriority: 0,
  }));
}

export async function updateKeyword(
  projectId: string, 
  keywordId: string, 
  data: Partial<KeywordData>
): Promise<KeywordData> {
  const keyword = await prisma.keyword.update({
    where: {
      id: keywordId,
      projectId,
    },
    data: {
      intent: data.intent,
      searchVolume: data.searchVolume,
      difficulty: data.difficulty,
      competition: data.competition,
      currentRank: data.currentRank || 0,
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

  return {
    id: keyword.id,
    keyword: keyword.keyword,
    intent: keyword.intent,
    searchVolume: keyword.searchVolume,
    difficulty: keyword.difficulty,
    competition: keyword.competition,
    cpc: 0,
    currentRank: keyword.currentRank,
    density: null,
    priority: null,
    notes: null,
    lastChecked: null,
    projectId: keyword.projectId,
    position: keyword.currentRank,
    groups: keyword.keywordGroup ? [{ 
      id: keyword.keywordGroup.id, 
      name: keyword.keywordGroup.name 
    }] : [],
    source: KeywordSource.MANUAL,
    serpFeatures: [],
    contentStatus: ContentStatus.NOT_STARTED,
    contentPriority: 0,
  };
}

export type { KeywordData };
