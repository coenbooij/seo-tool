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

    // For now, return placeholder content data
    const content = [
      {
        url: 'https://example.com/blog/seo-guide-2024',
        title: 'Complete SEO Guide for 2024',
        wordCount: 2500,
        score: 92,
        lastUpdated: '2024-01-30T10:00:00Z',
        issues: []
      },
      {
        url: 'https://example.com/services',
        title: 'Our SEO Services',
        wordCount: 1200,
        score: 75,
        lastUpdated: '2024-01-28T10:00:00Z',
        issues: [
          {
            type: 'warning',
            message: 'Consider adding more detailed service descriptions'
          }
        ]
      },
      {
        url: 'https://example.com/case-studies',
        title: 'SEO Success Stories',
        wordCount: 3200,
        score: 88,
        lastUpdated: '2024-01-25T10:00:00Z',
        issues: [
          {
            type: 'warning',
            message: 'Add more recent case studies'
          }
        ]
      },
      {
        url: 'https://example.com/about',
        title: 'About Us',
        wordCount: 800,
        score: 65,
        lastUpdated: '2024-01-20T10:00:00Z',
        issues: [
          {
            type: 'error',
            message: 'Page needs more content'
          },
          {
            type: 'warning',
            message: 'Add team member information'
          }
        ]
      }
    ]

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}
