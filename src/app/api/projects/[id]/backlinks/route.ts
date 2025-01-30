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

    // For now, return placeholder backlinks data
    // In a real application, this would fetch data from backlink analysis APIs
    const backlinks = [
      {
        id: 1,
        url: 'https://example.com/blog/seo-tips',
        anchorText: 'SEO best practices',
        domainAuth: 45,
        status: 'active',
        firstSeen: '2024-01-15T10:00:00Z',
        lastChecked: '2024-01-30T10:00:00Z'
      },
      {
        id: 2,
        url: 'https://blog.site.com/marketing',
        anchorText: 'digital marketing tools',
        domainAuth: 38,
        status: 'active',
        firstSeen: '2024-01-10T10:00:00Z',
        lastChecked: '2024-01-30T10:00:00Z'
      },
      {
        id: 3,
        url: 'https://news.website.com/tech',
        anchorText: 'SEO software',
        domainAuth: 52,
        status: 'active',
        firstSeen: '2024-01-05T10:00:00Z',
        lastChecked: '2024-01-30T10:00:00Z'
      },
      {
        id: 4,
        url: 'https://oldsite.com/resources',
        anchorText: 'marketing resources',
        domainAuth: 35,
        status: 'lost',
        firstSeen: '2023-12-01T10:00:00Z',
        lastChecked: '2024-01-30T10:00:00Z'
      },
      {
        id: 5,
        url: 'https://industry.news/seo-trends',
        anchorText: 'SEO trends 2024',
        domainAuth: 48,
        status: 'active',
        firstSeen: '2024-01-20T10:00:00Z',
        lastChecked: '2024-01-30T10:00:00Z'
      }
    ]

    return NextResponse.json(backlinks)
  } catch (error) {
    console.error('Error fetching backlinks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch backlinks' },
      { status: 500 }
    )
  }
}
