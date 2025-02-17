import { NextResponse, NextRequest } from 'next/server';
import { getServerSession, Session as NextAuthSession } from 'next-auth';

interface Session extends NextAuthSession {
  accessToken?: string;
}
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import GoogleAnalyticsService, { TimeSpan } from '@/services/seo/google-analytics-service';
import GoogleSearchConsoleService from '@/services/seo/google-search-console-service';
import { createGoogleAuthClient } from '@/lib/google-auth';
import { getToken } from "next-auth/jwt"

function getDates(timeSpan: string) {
  const now = new Date();
  const days = parseInt(timeSpan);
  const endDate = now.toISOString().split('T')[0];
  const startDate = new Date(now.setDate(now.getDate() - days)).toISOString().split('T')[0];
  return { startDate, endDate };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }>}
) {
    try {
      // Get and refresh token if necessary
      const token = await getToken({ req: request, raw: true });

      const session = await getServerSession(authOptions) as Session | null;

      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Update session with new token if it exists
      if (token && session) {
        session.accessToken = token;
      }

    const projectId = (await params).id;

    // Get project with validation
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id // Ensure user owns this project
      },
      select: {
        gaPropertyId: true,
        gscVerifiedSite: true,
        userId: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }

    if (!project.gaPropertyId || !project.gscVerifiedSite) {
      return NextResponse.json({ message: 'Please configure your analytics settings', data: { gaPropertyId: project.gaPropertyId, gscVerifiedSite: project.gscVerifiedSite } });
    }


    // Get the timespan from the URL search params
    const { searchParams } = new URL(request.url);
    const timeSpan = (searchParams.get('timespan') || searchParams.get('timeSpan') || '30d').toLowerCase();
    const { startDate, endDate } = getDates(timeSpan);

    // Use the potentially refreshed token
    const oauth2Client = createGoogleAuthClient(session);

    let analyticsData;
    let searchConsoleData;

    // Fetch Google Analytics data if configured
    if (project.gaPropertyId) {
      try {
        const analyticsService = new GoogleAnalyticsService(oauth2Client, project.gaPropertyId);
        analyticsData = await analyticsService.getAnalytics(timeSpan as TimeSpan);

      } catch (error) {
        console.error('Error fetching Google Analytics data:', error);
        if (error instanceof Error && error.message.includes('Invalid Credentials')) {
          return NextResponse.json({ error: 'Authentication failed', message: 'Please reconfigure your Google Analytics connection in settings.' }, { status: 401 });
        }
      }
    }

    // Fetch Search Console data if configured
    if (project.gscVerifiedSite) {
      try {
        const searchConsoleService = new GoogleSearchConsoleService(oauth2Client);
        searchConsoleData = await searchConsoleService.getAggregatedData(project.gscVerifiedSite, startDate, endDate);
      } catch (error) {
        console.error('Error fetching Search Console data:', error);

      }
    }

    // Return early if both services failed
    if (!analyticsData && !searchConsoleData) {
      return NextResponse.json({ error: 'Data fetch failed', message: 'Unable to fetch data from configured analytics services. Please try again later.', data: { gaPropertyId: project.gaPropertyId, gscVerifiedSite: project.gscVerifiedSite } }, { status: 500 });
    }

    // Combine the data and wrap in data field
    return NextResponse.json({
      data: {
        ...(analyticsData || {}),
        gscData: searchConsoleData,
        gaPropertyId: project.gaPropertyId,
        gscVerifiedSite: project.gscVerifiedSite
      }
    });

  } catch (error) {
    console.error('Error fetching project analytics:', error);
    // Handle token expiration/auth errors
    if (error instanceof Error && error.message.includes('Invalid Credentials')) {
      return NextResponse.json({ error: 'Authentication failed', message: 'Please reconfigure your Google Analytics connection in settings.' }, { status: 401 });
    }

    // Handle other errors
    return NextResponse.json({ error: 'Failed to fetch project analytics', message: 'An unexpected error occurred while fetching analytics data.' }, { status: 500 });
  }
}

