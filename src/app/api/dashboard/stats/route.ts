import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import authOptions from '@/lib/authOptions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get basic project stats
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        domain: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
      where: {
        userId: String(session.user.id)
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get average position data
    const keywordStats = await prisma.keyword.aggregate({
      where: {
        project: {
          userId: String(session.user.id)
        }
      },
      _avg: {
        currentRank: true
      }
    })

    // Calculate position change (mock data for now)
    const positionChange = -2 // Negative means improvement in rank

    return NextResponse.json({
      totalProjects: projects.length,
      averagePosition: Math.round(keywordStats._avg.currentRank || 0),
      positionChange
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching dashboard stats:', error.message)
    }
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}