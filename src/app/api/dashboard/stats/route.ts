import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

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
      where: {
        userId: parseInt(session.user.id)
      },
      include: {
        backlinks: {
          where: {
            status: 'active'
          }
        },
        keywords: true
      }
    })

    const totalProjects = projects.length

    // Calculate total backlinks and month-over-month change
    const totalBacklinks = projects.reduce(
      (sum, project) => sum + project.backlinks.length,
      0
    )

    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const previousBacklinks = await prisma.backlink.count({
      where: {
        projectId: {
          in: projects.map(p => p.id)
        },
        status: 'active',
        firstSeen: {
          lt: lastMonth
        }
      }
    })

    const backlinksChange = previousBacklinks > 0
      ? ((totalBacklinks - previousBacklinks) / previousBacklinks) * 100
      : 0

    // Calculate average keyword position and change
    const keywords = projects.flatMap(p => p.keywords)
    const averagePosition = keywords.length > 0
      ? keywords.reduce((sum, kw) => sum + kw.position, 0) / keywords.length
      : 0

    const previousKeywords = await prisma.keyword.findMany({
      where: {
        projectId: {
          in: projects.map(p => p.id)
        },
        lastUpdated: {
          lt: lastMonth
        }
      }
    })

    const previousAveragePosition = previousKeywords.length > 0
      ? previousKeywords.reduce((sum, kw) => sum + kw.position, 0) / previousKeywords.length
      : 0

    const positionChange = previousAveragePosition > 0
      ? ((previousAveragePosition - averagePosition) / previousAveragePosition) * 100
      : 0

    return NextResponse.json({
      totalProjects,
      averagePosition: Math.round(averagePosition * 10) / 10,
      totalBacklinks,
      positionChange: Math.round(positionChange * 10) / 10,
      backlinksChange: Math.round(backlinksChange * 10) / 10
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}