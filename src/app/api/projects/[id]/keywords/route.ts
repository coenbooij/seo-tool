import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { addKeywords, getProjectKeywords } from '@/lib/db/keywords';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const projectId = params.id;

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

  const keywords = await getProjectKeywords(projectId);
  return NextResponse.json(keywords);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const projectId = params.id;

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
    const body = await request.json();
    const { keywords } = body;

    if (!Array.isArray(keywords)) {
      return new NextResponse('Invalid keywords format', { status: 400 });
    }

    const createdKeywords = await addKeywords(projectId, keywords);
    return NextResponse.json(createdKeywords);
  } catch (error) {
    console.error('Failed to add keywords:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const projectId = params.id;
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');

  if (!keyword) {
    return new NextResponse('Keyword parameter is required', { status: 400 });
  }

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
    await prisma.keyword.deleteMany({
      where: {
        projectId,
        keyword,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete keyword:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const projectId = params.id;
  const { searchParams } = new URL(request.url);
  const keywordId = searchParams.get('keywordId');

  if (!keywordId) {
    return new NextResponse('KeywordId parameter is required', { status: 400 });
  }

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
    const updates = await request.json();
    const keyword = await prisma.keyword.update({
      where: {
        id: keywordId,
        projectId,
      },
      data: updates,
    });

    return NextResponse.json(keyword);
  } catch (error) {
    console.error('Failed to update keyword:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
