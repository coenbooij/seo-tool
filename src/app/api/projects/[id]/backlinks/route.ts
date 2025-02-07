import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { BacklinkAnalyzer } from '@/services/seo/analyzers/backlink-analyzer'

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
        userId: session.user.id
      },
      include: {
        backlinks: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Initialize backlink analyzer
    const analyzer = new BacklinkAnalyzer(project.id, project.domain || '')

    // Get backlink growth data
    const backlinkGrowth = await analyzer.getBacklinkGrowth(30) // Last 30 days

    // Get anchor text distribution
    const anchorTextDistribution = await analyzer.analyzeAnchorTextDistribution()

    // Sort backlinks by domainAuthority
    const sortedBacklinks = project.backlinks.sort((a, b) => b.domainAuthority - a.domainAuthority)

    return NextResponse.json({
      backlinks: sortedBacklinks,
      metrics: {
        anchorTextDistribution,
        backlinkGrowth
      }
    })
  } catch (error) {
    console.error('Error fetching backlinks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch backlinks' },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const body = await request.json()

    // Validate required fields
    if (!body.url || !body.targetUrl || !body.anchorText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if project exists and belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create new backlink
    const backlink = await prisma.backlink.create({
      data: {
        url: body.url,
        targetUrl: body.targetUrl,
        anchorText: body.anchorText,
        type: body.type || 'DOFOLLOW',
        status: 'ACTIVE',
        projectId: id,
        authority: 0, // Will be calculated by analyzer
        domainAuthority: 0, // Will be calculated by analyzer
      }
    })

    // Initialize analyzer and calculate domain authority
    const analyzer = new BacklinkAnalyzer(project.id, project.domain || '')
    await analyzer.checkBacklinkStatus(backlink)

    return NextResponse.json(backlink)
  } catch (error) {
    console.error('Error creating backlink:', error)
    return NextResponse.json(
      { error: 'Failed to create backlink' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    const { searchParams } = new URL(request.url)
    const backlinkId = searchParams.get('backlinkId')

    if (!backlinkId) {
      return NextResponse.json(
        { error: 'Missing backlinkId parameter' },
        { status: 400 }
      )
    }

    // Check if project exists and belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Delete backlink
    await prisma.backlink.delete({
      where: {
        id: backlinkId,
        projectId: id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting backlink:', error)
    return NextResponse.json(
      { error: 'Failed to delete backlink' },
      { status: 500 }
    )
  }
}
