import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        userId: true,
        gaPropertyId: true,
        gscVerifiedSite: true,
        createdAt: true,
        updatedAt: true
      },
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error in GET /api/projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body?.name?.trim() || !body?.url?.trim()) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    // Ensure user exists
    await prisma.user.upsert({
      where: { id: session.user.id },
      update: {
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null
      },
      create: {
        id: session.user.id,
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null
      }
    });

    const domain = new URL(body.url).hostname;
    
    const project = await prisma.project.create({
      data: {
        name: body.name.trim(),
        url: body.url.trim().toLowerCase(),
        domain,
        gaPropertyId: body.gaPropertyId?.trim() || null,
        gscVerifiedSite: body.gscVerifiedSite?.trim() || null,
        userId: session.user.id
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error in POST /api/projects:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
