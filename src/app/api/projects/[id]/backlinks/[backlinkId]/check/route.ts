import { prisma } from '@/lib/prisma'
import { BacklinkAnalyzer } from '@/services/seo/analyzers/backlink-analyzer'
import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; backlinkId: string }>}
) {
  try {
    const token = await getToken({ req: request })
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, backlinkId } = await Promise.resolve(context.params)

    // Check project access
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: token.sub as string
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get backlink to check
    const backlink = await prisma.backlink.findFirst({
      where: {
        id: backlinkId,
        projectId: id
      }
    })

    if (!backlink) {
      return NextResponse.json({ error: 'Backlink not found' }, { status: 404 })
    }

    // Initialize analyzer and check status
    const analyzer = new BacklinkAnalyzer(project.id, project.domain || '', token.accessToken as string)
    await analyzer.checkBacklinkStatus({
      id: backlink.id,
      url: backlink.url,
      targetUrl: backlink.targetUrl
    })

    // Get updated backlink data
    const updatedBacklink = await prisma.backlink.findUnique({
      where: { id: backlinkId }
    })

    return NextResponse.json(updatedBacklink)
  } catch (error) {
    console.error('Error checking backlink status:', error)
    return NextResponse.json(
      { error: 'Failed to check backlink status' },
      { status: 500 }
    )
  }
}