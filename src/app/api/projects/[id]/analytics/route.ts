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

    // For now, return placeholder analytics data
    const analytics = {
      traffic: {
        total: 125000,
        organic: 85000,
        direct: 25000,
        referral: 15000,
        change: 12.5
      },
      engagement: {
        avgTimeOnPage: '2:45',
        bounceRate: 45.2,
        pagesPerSession: 2.8,
        change: 3.2
      },
      conversions: {
        total: 2500,
        rate: 2.0,
        goals: {
          newsletter: 1200,
          contact: 800,
          purchase: 500
        },
        change: 5.8
      },
      topPages: [
        {
          url: '/blog/seo-guide',
          views: 15000,
          conversions: 300
        },
        {
          url: '/services',
          views: 12000,
          conversions: 250
        },
        {
          url: '/about',
          views: 8000,
          conversions: 150
        }
      ],
      timeline: {
        daily: [
          { date: '2024-01-24', visits: 4200, conversions: 84 },
          { date: '2024-01-25', visits: 4500, conversions: 90 },
          { date: '2024-01-26', visits: 4100, conversions: 82 },
          { date: '2024-01-27', visits: 3900, conversions: 78 },
          { date: '2024-01-28', visits: 4300, conversions: 86 },
          { date: '2024-01-29', visits: 4600, conversions: 92 },
          { date: '2024-01-30', visits: 4800, conversions: 96 }
        ]
      }
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