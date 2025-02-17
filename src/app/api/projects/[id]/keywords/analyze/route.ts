import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { KeywordSource } from '@/app/dashboard/projects/[id]/keywords/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const projectId = (await (params)).id;

  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: session.user.id,
    },
  });

  if (!project) {
    return new NextResponse('Project not found', { status: 404 });
  }

  try {
    const { keywords } = await request.json();

    if (!Array.isArray(keywords)) {
      return new NextResponse('Invalid keywords format', { status: 400 });
    }

    // Mock analysis - in a real implementation, this would call an external API
    // or perform actual analysis
    const analyzedKeywords = await Promise.all(
      keywords.map(async (keyword) => {
        const keywordRecord = await prisma.keyword.findFirst({
          where: {
            projectId,
            keyword,
          },
        });

        if (!keywordRecord) {
          return null;
        }

        // Simulate analyzing the keyword
        const mockAnalysis = {
          searchVolume: Math.floor(Math.random() * 10000),
          difficulty: Math.floor(Math.random() * 100),
          competition: Math.floor(Math.random() * 100),
        };

        // Update the keyword with analysis results
        const updatedKeyword = await prisma.keyword.update({
          where: {
            id: keywordRecord.id,
          },
          data: {
            searchVolume: mockAnalysis.searchVolume,
            difficulty: mockAnalysis.difficulty,
            competition: mockAnalysis.competition,
          },
          include: {
            keywordGroup: true,
            history: {
              orderBy: {
                date: 'desc',
              },
              take: 1,
            },
          },
        });

        return {
          ...updatedKeyword,
          source: KeywordSource.MANUAL,
          serpFeatures: [],
          contentStatus: 'NOT_STARTED',
          contentPriority: 0,
          groups: updatedKeyword.keywordGroup ? [{
            id: updatedKeyword.keywordGroup.id,
            name: updatedKeyword.keywordGroup.name,
          }] : [],
        };
      })
    );

    const validResults = analyzedKeywords.filter(k => k !== null);
    return NextResponse.json(validResults);
  } catch (error) {
    console.error('Failed to analyze keywords:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}