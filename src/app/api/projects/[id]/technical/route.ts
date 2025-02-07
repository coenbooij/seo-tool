import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getPageSpeedData } from '@/lib/pagespeed'

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

    // Ensure domain has proper protocol
    const url = project.domain.startsWith('http') 
      ? project.domain 
      : `https://${project.domain}`

    try {
      // Get performance data from PageSpeed Insights
      // The data structure is already correct from getPageSpeedData
      const technical = await getPageSpeedData(url)
      return NextResponse.json(technical)
    } catch (error) {
      console.error('Error analyzing site:', error)
      return NextResponse.json(
        { error: 'Failed to analyze the site. Please verify the domain is accessible.' },
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
