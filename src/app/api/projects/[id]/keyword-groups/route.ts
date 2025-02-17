import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const projectId = (await params).id;

    const groups = await prisma.keywordGroup.findMany({
      where: {
        keywords: {
          some: {
            projectId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        keywords: {
          where: {
            projectId,
          },
          select: {
            keyword: true,
            intent: true,
            searchVolume: true,
            difficulty: true,
            currentRank: true,
            notes: true,
          },
        },
      },
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching keyword groups:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { name } = await request.json();
    const projectId = (await params).id;

    if (!name) {
      return new NextResponse('Group name is required', { status: 400 });
    }

    const group = await prisma.keywordGroup.create({
      data: {
        name,
        project: {
          connect: {
            id: projectId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        keywords: {
          select: {
            keyword: true,
            intent: true,
            searchVolume: true,
            difficulty: true,
            currentRank: true,
            notes: true,
          },
        },
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error creating keyword group:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}