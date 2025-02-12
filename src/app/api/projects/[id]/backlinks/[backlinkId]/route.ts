import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BacklinkAnalyzer } from '@/services/seo/analyzers/backlink-analyzer'
import { getToken } from "next-auth/jwt"

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; backlinkId: string }> }
) {
  try {
    const token = await getToken({ req: request});

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const { id, backlinkId } = params
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
        userId: token.sub as string
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if backlink exists and belongs to project
    const existingBacklink = await prisma.backlink.findFirst({
      where: {
        id: backlinkId,
        projectId: id
      }
    })

    if (!existingBacklink) {
      return NextResponse.json({ error: 'Backlink not found' }, { status: 404 })
    }

    try {
      // Initialize analyzer
      const analyzer = new BacklinkAnalyzer(project.id, project.domain || '', token.accessToken as string);

      // Recalculate domain authority if URL changed
      let domainAuthority = existingBacklink.domainAuthority;
      if (body.url !== existingBacklink.url) {
        const domain = new URL(body.url).hostname;
        const metrics = await analyzer.getDomainMetrics(domain);
        domainAuthority = await analyzer.calculateDomainAuthority(metrics);
      }

      // Update backlink
      const backlink = await prisma.backlink.update({
        where: {
          id: backlinkId,
          projectId: id
        },
        data: {
          url: body.url,
          targetUrl: body.targetUrl,
          anchorText: body.anchorText,
          type: body.type || existingBacklink.type,
          domainAuthority,
          authority: domainAuthority,
          lastChecked: new Date()
        }
      });

      // Create history record for the update
      await prisma.backlinkHistory.create({
        data: {
          backlinkId,
          status: backlink.status,
          domainAuthority,
        }
      });

      return NextResponse.json(backlink);
    } catch (error) {
      console.error('Error processing backlink:', error);
      return NextResponse.json(
        { error: 'Invalid URL or domain not accessible' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating backlink:', error)
    return NextResponse.json(
      { error: 'Failed to update backlink' },
      { status: 500 }
    )
  }
}