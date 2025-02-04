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

    // For now, return placeholder technical data
    const technical = {
      performance: {
        score: 85,
        metrics: {
          fcp: 1.8,
          lcp: 2.3,
          cls: 0.08,
          tti: 3.2,
        },
        issues: [
          {
            type: 'warning',
            category: 'Performance',
            message: 'Serve images in next-gen formats',
            impact: 'medium'
          },
          {
            type: 'warning',
            category: 'Performance',
            message: 'Enable text compression',
            impact: 'medium'
          }
        ]
      },
      seo: {
        score: 92,
        issues: [
          {
            type: 'error',
            category: 'Meta Tags',
            message: 'Missing meta descriptions on 3 pages',
            impact: 'high'
          },
          {
            type: 'warning',
            category: 'Structured Data',
            message: 'Incomplete product schema markup',
            impact: 'medium'
          }
        ]
      },
      accessibility: {
        score: 88,
        issues: [
          {
            type: 'error',
            category: 'ARIA',
            message: 'Elements with ARIA roles lack required attributes',
            impact: 'high'
          },
          {
            type: 'warning',
            category: 'Color Contrast',
            message: 'Insufficient color contrast in navigation',
            impact: 'medium'
          }
        ]
      },
      bestPractices: {
        score: 95,
        issues: [
          {
            type: 'warning',
            category: 'Security',
            message: 'Include a valid Content Security Policy',
            impact: 'medium'
          },
          {
            type: 'warning',
            category: 'JavaScript',
            message: 'Consider reducing JavaScript bundle size',
            impact: 'low'
          }
        ]
      }
    }

    return NextResponse.json(technical)
  } catch (error) {
    console.error('Error fetching technical data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch technical data' },
      { status: 500 }
    )
  }
}
