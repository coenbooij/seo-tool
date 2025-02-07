import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(
  request: Request,
  { params }: { params: { id: string; groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id: projectId, groupId } = params;
    const { keyword: keywordTerm } = await request.json();

    if (!keywordTerm) {
      return new NextResponse('Keyword term is required', { status: 400 });
    }

    // Find the keyword
    const keyword = await prisma.keyword.findFirst({
      where: {
        projectId,
        keyword: keywordTerm,
      },
    });

    if (!keyword) {
      return new NextResponse('Keyword not found', { status: 404 });
    }

    // Add keyword to group
    await prisma.keywordGroup.update({
      where: {
        id: groupId,
      },
      data: {
        keywords: {
          connect: {
            id: keyword.id,
          },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding keyword to group:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id: projectId, groupId } = params;
    const { searchParams } = new URL(request.url);
    const keywordTerm = searchParams.get('keyword');

    if (!keywordTerm) {
      return new NextResponse('Keyword term is required', { status: 400 });
    }

    // Find the keyword
    const keyword = await prisma.keyword.findFirst({
      where: {
        projectId,
        keyword: keywordTerm,
      },
    });

    if (!keyword) {
      return new NextResponse('Keyword not found', { status: 404 });
    }

    // Remove keyword from group
    await prisma.keywordGroup.update({
      where: {
        id: groupId,
      },
      data: {
        keywords: {
          disconnect: {
            id: keyword.id,
          },
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error removing keyword from group:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}