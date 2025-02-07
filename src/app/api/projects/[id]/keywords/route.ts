import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { KeywordIntent } from '@prisma/client';
import { KeywordData } from '@/lib/db/keywords';

const mapPrismaToKeywordData = (data: any): KeywordData => ({
  keyword: data.keyword,
  intent: data.intent.toLowerCase() as KeywordData['intent'],
  searchVolume: data.searchVolume || 0,
  difficulty: data.difficulty || 0,
  competition: data.competition || 0,
  cpc: data.cpc || 0,
  currentRank: data.currentRank,
  density: data.density,
  priority: data.priority,
  notes: data.notes,
  lastChecked: data.lastChecked,
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const projectId = params.id;
    const keywords = await prisma.keyword.findMany({
      where: {
        projectId,
      },
      select: {
        id: true,
        keyword: true,
        intent: true,
        searchVolume: true,
        difficulty: true,
        competition: true,
        cpc: true,
        currentRank: true,
        density: true,
        priority: true,
        notes: true,
        lastChecked: true,
        groups: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const formattedKeywords = keywords.map(mapPrismaToKeywordData);
    return NextResponse.json(formattedKeywords);
  } catch (error) {
    console.error('Error fetching keywords:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const projectId = params.id;
    const data = await request.json();
    
    const keywordsToCreate = Array.isArray(data.keywords) ? data.keywords : [data];
    
    const createdKeywords = await Promise.all(
      keywordsToCreate.map(async (keywordData: Partial<KeywordData>) => {
        const keyword = await prisma.keyword.create({
          data: {
            projectId,
            keyword: keywordData.keyword!,
            intent: keywordData.intent?.toUpperCase() as KeywordIntent || 'INFORMATIONAL',
            searchVolume: keywordData.searchVolume || 0,
            difficulty: keywordData.difficulty || 0,
            competition: keywordData.competition || 0,
            cpc: keywordData.cpc || 0,
            currentRank: null,
            density: null,
            priority: null,
            notes: null,
          },
          select: {
            id: true,
            keyword: true,
            intent: true,
            searchVolume: true,
            difficulty: true,
            competition: true,
            cpc: true,
            currentRank: true,
            density: true,
            priority: true,
            notes: true,
            lastChecked: true,
            groups: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
        
        return mapPrismaToKeywordData(keyword);
      })
    );

    return NextResponse.json(createdKeywords);
  } catch (error) {
    console.error('Error creating keywords:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const projectId = params.id;
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword) {
      return new NextResponse('Keyword is required', { status: 400 });
    }

    const result = await prisma.keyword.deleteMany({
      where: {
        projectId,
        keyword,
      },
    });

    if (result.count === 0) {
      return new NextResponse('Keyword not found', { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting keyword:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
