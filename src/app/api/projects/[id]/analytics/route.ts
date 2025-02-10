import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import GoogleAnalyticsService from '@/services/seo/google-analytics-service';
import GoogleSearchConsoleService from '@/services/seo/google-search-console-service';
import { createGoogleAuthClient } from '@/lib/google-auth';

function getDates(timeSpan: string) {
  const now = new Date();
  const days = parseInt(timeSpan);
  const endDate = now.toISOString().split('T')[0];
  const startDate = new Date(now.setDate(now.getDate() - days)).toISOString().split('T')[0];
  return { startDate, endDate };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get project
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: {
        gaPropertyId: true,
        gscVerifiedSite: true,
        userId: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!project.gaPropertyId && !project.gscVerifiedSite) {
      return NextResponse.json({
        message: 'Please configure your analytics settings',
        gaPropertyId: project.gaPropertyId,
        gscVerifiedSite: project.gscVerifiedSite
      });
    }

    // Get the timespan from the URL search params
    const { searchParams } = new URL(request.url);
    const timeSpan = (searchParams.get('timespan') || searchParams.get('timeSpan') || '30d').toLowerCase();
    const { startDate, endDate } = getDates(timeSpan);

    const oauth2Client = createGoogleAuthClient(session);
    
    let analyticsData;
    let searchConsoleData;

    // Fetch Google Analytics data if configured
    if (project.gaPropertyId) {
      try {
        const analyticsService = new GoogleAnalyticsService(oauth2Client, project.gaPropertyId);
        analyticsData = await analyticsService.getAnalytics(timeSpan as any);
      } catch (error) {
        console.error('Error fetching Google Analytics data:', error);
      }
    }

    // Fetch Search Console data if configured
    if (project.gscVerifiedSite) {
      try {
        const searchConsoleService = new GoogleSearchConsoleService(oauth2Client);
        searchConsoleData = await searchConsoleService.getAggregatedData(
          project.gscVerifiedSite,
          startDate,
          endDate
        );
      } catch (error) {
        console.error('Error fetching Search Console data:', error);
      }
    }

    // Return early if both services failed
    if (!analyticsData && !searchConsoleData) {
      return NextResponse.json(
        { error: 'Failed to fetch analytics data from configured services' },
        { status: 500 }
      );
    }

    // Combine the data
    const response = {
      ...(analyticsData || {}),
      gscData: searchConsoleData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching project analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project analytics' },
      { status: 500 }
    );
  }
}