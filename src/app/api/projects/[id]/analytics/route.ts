import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(
  request: Request,
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

    // Mock analytics data that matches the Analytics interface
    const analytics = {
      users: 125000,
      usersChange: 12.5,
      pageViews: 350000,
      pageViewsChange: 8.3,
      avgSessionDuration: 165, // in seconds
      avgSessionDurationChange: 5.2,
      bounceRate: 45.2,
      bounceRateChange: -2.1,
      topPages: [
        {
          path: '/blog/seo-guide',
          pageViews: 15000,
          change: 12.3
        },
        {
          path: '/services',
          pageViews: 12000,
          change: 8.7
        },
        {
          path: '/about',
          pageViews: 8000,
          change: 5.4
        }
      ],
      trafficSources: [
        {
          source: 'Organic Search',
          users: 85000,
          change: 15.2
        },
        {
          source: 'Direct',
          users: 25000,
          change: 5.8
        },
        {
          source: 'Referral',
          users: 15000,
          change: 8.9
        }
      ]
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}