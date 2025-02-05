import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getPageSpeedData } from '@/lib/pagespeed'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Properly handle params
    if (!params?.id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    const projectId = parseInt(params.id)
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Ensure domain has proper protocol
    const url = project.domain.startsWith('http') 
      ? project.domain 
      : `https://${project.domain}`

    try {
      // Get real performance data from PageSpeed Insights
      const technical = await getPageSpeedData(url)
      return NextResponse.json(technical)
    } catch (error) {
      console.error('Error fetching PageSpeed data:', error)
      return NextResponse.json(
        { error: 'Failed to fetch PageSpeed data. Please verify the domain is accessible.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in technical route:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
