import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse params.id here since it's from the URL
    const projectId = parseInt(params.id)
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: parseInt(session.user.id)
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // For now, return placeholder metrics data
    const metrics = {
      keywords: {
        total: 156,
        topThree: 12,
        change: 5.2
      },
      backlinks: {
        total: 843,
        newLinks: 23,
        change: 2.8
      },
      content: {
        pages: 45,
        avgScore: 87,
        change: -1.2
      },
      technical: {
        score: 92,
        issues: 9,
        change: 3.5
      }
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching project metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project metrics' },
      { status: 500 }
    )
  }
}
