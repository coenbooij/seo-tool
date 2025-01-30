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

    // For now, return placeholder keywords data
    // In a real application, this would fetch data from keyword tracking APIs
    const keywords = [
      {
        id: 1,
        term: 'seo software',
        position: 3,
        volume: 12500,
        difficulty: 67,
        lastUpdated: '2024-01-30T10:00:00Z'
      },
      {
        id: 2,
        term: 'keyword tracking tool',
        position: 5,
        volume: 8200,
        difficulty: 45,
        lastUpdated: '2024-01-30T10:00:00Z'
      },
      {
        id: 3,
        term: 'best seo tools',
        position: 8,
        volume: 22000,
        difficulty: 82,
        lastUpdated: '2024-01-30T10:00:00Z'
      },
      {
        id: 4,
        term: 'backlink analysis',
        position: 12,
        volume: 6800,
        difficulty: 58,
        lastUpdated: '2024-01-30T10:00:00Z'
      },
      {
        id: 5,
        term: 'seo rank tracker',
        position: 7,
        volume: 9400,
        difficulty: 51,
        lastUpdated: '2024-01-30T10:00:00Z'
      },
      {
        id: 6,
        term: 'website optimization tools',
        position: 15,
        volume: 14300,
        difficulty: 73,
        lastUpdated: '2024-01-30T10:00:00Z'
      },
      {
        id: 7,
        term: 'technical seo audit',
        position: 4,
        volume: 5600,
        difficulty: 42,
        lastUpdated: '2024-01-30T10:00:00Z'
      },
      {
        id: 8,
        term: 'content optimization',
        position: 9,
        volume: 18200,
        difficulty: 64,
        lastUpdated: '2024-01-30T10:00:00Z'
      }
    ]

    return NextResponse.json(keywords)
  } catch (error) {
    console.error('Error fetching keywords:', error)
    return NextResponse.json(
      { error: 'Failed to fetch keywords' },
      { status: 500 }
    )
  }
}
