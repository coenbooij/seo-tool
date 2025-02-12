import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BacklinkAnalyzer } from '@/services/seo/analyzers/backlink-analyzer'
import { BacklinkStatus } from '@prisma/client';
import { getToken } from "next-auth/jwt"
import axios from 'axios';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request});

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - Missing token' }, { status: 401 });
    }

    const params = await context.params
    const { id } = params
    if (!token.sub) {
      return NextResponse.json({ error: 'Unauthorized - Missing user ID' }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: token.sub as string
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Initialize analyzer
    const analyzer = new BacklinkAnalyzer(project.id, project.domain || '', token.accessToken as string);

    // Get all backlinks
    const allBacklinks = await prisma.backlink.findMany({
      where: {
        projectId: project.id
      },
      orderBy: {
        domainAuthority: 'desc'
      }
    })

    // Get backlink growth data
    const backlinkGrowth = await analyzer.getBacklinkGrowth(30) // Last 30 days

    // Get anchor text distribution
    const anchorTextDistribution = await analyzer.analyzeAnchorTextDistribution()

    return NextResponse.json({
      backlinks: allBacklinks,
      metrics: {
        anchorTextDistribution,
        backlinkGrowth
      },
      discovered: 0  // Automatic discovery disabled
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
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request});

    if (!token) {
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
        userId: token.sub as string
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    try {
      console.log('Starting backlink validation process...');
      
      // Initialize analyzer for both metrics and validation
      const analyzer = new BacklinkAnalyzer(project.id, project.domain || '', token.accessToken as string);

      // Calculate domain authority for the new backlink
      const domain = new URL(body.url).hostname;
      console.log('Calculating metrics for domain:', domain);
      
      const metrics = await analyzer.getDomainMetrics(domain);
      const domainAuthority = await analyzer.calculateDomainAuthority(metrics);
      console.log('Domain Authority:', domainAuthority);

      // Validate the backlink immediately
      console.log('Validating backlink...');
      console.log('Source URL:', body.url);
      console.log('Target URL:', body.targetUrl);

      let initialStatus: BacklinkStatus = 'ACTIVE';
      try {
        const response = await axios.get(body.url, {
          timeout: 10000,
          maxRedirects: 5,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SEOTool/1.0; +http://seo-tool.com)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
            'Accept-Language': 'en-US,en;q=0.9'
          },
          responseType: 'text'
        });
        
        console.log('Successfully fetched source URL');
        console.log('Response status:', response.status);
        console.log('Content length:', response.data.length);
        
        const status = analyzer.validateBacklink(response.data, body.targetUrl);
        initialStatus = status;
        console.log('Validation result:', status);
      } catch (error) {
        console.error('Error validating new backlink:', error);
        if (axios.isAxiosError(error) && error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        } else if (axios.isAxiosError(error) && error.request) {
          console.error('No response received');
        }
        initialStatus = 'BROKEN';
      }

      // Create new backlink with validated status
      console.log('Creating backlink with status:', initialStatus);
      const backlink = await prisma.backlink.create({
        data: {
          url: body.url,
          targetUrl: body.targetUrl,
          anchorText: body.anchorText,
          type: body.type || 'DOFOLLOW',
          status: initialStatus,
          projectId: id,
          domainAuthority,
          authority: domainAuthority,
          firstSeen: new Date(),
          lastChecked: new Date()
        }
      });

      // Create initial history record
      await prisma.backlinkHistory.create({
        data: {
          backlinkId: backlink.id,
          status: initialStatus,
          domainAuthority,
        }
      });

      console.log('Backlink created with status:', initialStatus);

      return NextResponse.json(backlink);
    } catch (error) {
      console.error('Error processing backlink:', error);
      return NextResponse.json(
        { error: 'Invalid URL or domain not accessible' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating backlink:', error)
    return NextResponse.json(
      { error: 'Failed to create backlink' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request});

    if (!token) {
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
        userId: token.sub as string
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
