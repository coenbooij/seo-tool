import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import authOptions from '@/lib/authOptions'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const { id } = params

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: String(session.user.id)
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get keyword metrics
    const keywordMetrics = await prisma.keyword.aggregate({
      where: {
        projectId: id
      },
      _avg: {
        currentRank: true,
        searchVolume: true
      },
      _count: true
    })

    // Get backlink metrics
    const backlinkMetrics = await prisma.backlink.aggregate({
      where: {
        projectId: id
      },
      _avg: {
        domainAuthority: true
      },
      _count: true,
      _max: {
        createdAt: true
      }
    })

    // Calculate backlink change percentage
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    
    const previousBacklinksCount = await prisma.backlink.count({
      where: {
        projectId: id,
        createdAt: {
          lt: oneMonthAgo
        }
      }
    })

    const backlinkChange = previousBacklinksCount > 0
      ? ((backlinkMetrics._count - previousBacklinksCount) / previousBacklinksCount) * 100
      : 100

    return NextResponse.json({
      keywords: {
        total: keywordMetrics._count,
        averageRank: Math.round(keywordMetrics._avg.currentRank || 0),
        averageVolume: Math.round(keywordMetrics._avg.searchVolume || 0)
      },
      backlinks: {
        total: backlinkMetrics._count,
        averageDomainAuthority: Math.round(backlinkMetrics._avg.domainAuthority || 0),
        change: Math.round(backlinkChange)
      }
    })
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
