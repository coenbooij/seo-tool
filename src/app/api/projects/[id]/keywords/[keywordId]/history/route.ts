import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; keywordId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id: projectId, keywordId } = await params;

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
    // Get keyword history
    const history = await prisma.keywordHistory.findMany({
      where: {
        keywordId,
        keyword: {
          projectId,
        },
      },
      orderBy: {
        date: 'desc',
      },
      select: {
        date: true,
        rank: true,
      },
    });

    // Mock SERP data - in a real implementation, this would come from a SERP API
    const serpData = [
      {
        position: history[0]?.rank || 0,
        url: 'https://example.com/page1',
        title: 'Example Result 1',
        features: ['Featured Snippet', 'Image Pack'],
      },
      {
        position: 2,
        url: 'https://example.com/page2',
        title: 'Example Result 2',
        features: ['Site Links'],
      },
      {
        position: 3,
        url: 'https://example.com/page3',
        title: 'Example Result 3',
        features: ['Video'],
      },
    ];

    return NextResponse.json({
      history: history.map(entry => ({
        date: entry.date,
        position: entry.rank,
      })),
      serpData,
    });
  } catch (error) {
    console.error('Failed to fetch keyword history:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; keywordId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id: projectId, keywordId } = await params;

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
    const { rank } = await request.json();

    if (typeof rank !== 'number') {
      return new NextResponse('Invalid rank format', { status: 400 });
    }

    // Create new history entry
    const newHistory = await prisma.keywordHistory.create({
      data: {
        keywordId,
        rank,
      },
    });

    // Update current rank on keyword
    await prisma.keyword.update({
      where: {
        id: keywordId,
      },
      data: {
        currentRank: rank,
        bestRank: {
          set: Math.min(rank, await prisma.keyword.findUnique({
            where: { id: keywordId },
            select: { bestRank: true },
          }).then(k => k?.bestRank || Infinity)),
        },
      },
    });

    return NextResponse.json(newHistory);
  } catch (error) {
    console.error('Failed to update keyword history:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
