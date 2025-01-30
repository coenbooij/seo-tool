import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const id = await Promise.resolve(context.params.id)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(id),
        userId: parseInt(session.user.id)
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // For now, return placeholder content data
    // In a real application, this would fetch data from content analysis APIs
    const pages = [
      {
        id: 1,
        url: 'https://example.com/blog/seo-guide-2024',
        title: 'Complete SEO Guide for 2024',
        wordCount: 2500,
        score: 92,
        lastUpdated: '2024-01-30T10:00:00Z',
        issues: []
      },
      {
        id: 2,
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
        id: 3,
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
        id: 4,
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
      },
      {
        id: 5,
        url: 'https://example.com/blog/technical-seo',
        title: 'Technical SEO Guide',
        wordCount: 4200,
        score: 95,
        lastUpdated: '2024-01-29T10:00:00Z',
        issues: []
      },
      {
        id: 6,
        url: 'https://example.com/pricing',
        title: 'SEO Packages & Pricing',
        wordCount: 1500,
        score: 82,
        lastUpdated: '2024-01-27T10:00:00Z',
        issues: [
          {
            type: 'warning',
            message: 'Add comparison table for packages'
          }
        ]
      }
    ]

    return NextResponse.json(pages)
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}
