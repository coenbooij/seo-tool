import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import GoogleAnalyticsService, { TimeSpan } from '@/services/seo/google-analytics-service';
import { google } from 'googleapis';

// Simplified interfaces to match AnalyticsData
interface PageAnalytics {
  path: string;
  pageViews: number;
  change: number;
}

interface TrafficSource {
  source: string;
  users: number;
  change: number;
}

interface Analytics {
  users: number;
  usersChange: number;
  pageViews: number;
  pageViewsChange: number;
  avgSessionDuration: number;
  avgSessionDurationChange: number;
  bounceRate: number;
  bounceRateChange: number;
  topPages: PageAnalytics[];
  trafficSources: TrafficSource[];
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;

    // Get timespan from query parameters
    const url = new URL(request.url);
    const timespan = (url.searchParams.get('timespan') || '30d') as TimeSpan;

    // Validate timespan
    const validTimespans: TimeSpan[] = ['7d', '30d', '90d', '180d', '365d'];
    if (!validTimespans.includes(timespan)) {
      return NextResponse.json(
        { error: 'Invalid timespan parameter' },
        { status: 400 }
      );
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: String(session.user.id),
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!project.gaPropertyId || !project.gscVerifiedSite) {
      return NextResponse.json(
        {
          message:
            'Please configure your project with a Google Analytics Property ID and a Google Search Console verified site. You can access the configuration page by clicking on the gear icon in the top right corner.',
          gaPropertyId: project.gaPropertyId,
          gscVerifiedSite: project.gscVerifiedSite,
        },
        { status: 200 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    console.log('Fetching analytics with property ID:', project.gaPropertyId);
    const gaService = new GoogleAnalyticsService(oauth2Client, project.gaPropertyId);
    const gaData = await gaService.getAnalytics(timespan);

    if (!gaData) {
      console.error('Failed to get analytics data');
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    // Check if gaData is defined, and provide defaults if not
    const safeGaData: Analytics = {
      users: gaData.users ?? 0,
      usersChange: gaData.usersChange ?? 0,
      pageViews: gaData.pageViews ?? 0,
      pageViewsChange: gaData.pageViewsChange ?? 0,
      avgSessionDuration: gaData.avgSessionDuration ?? 0,
      avgSessionDurationChange: gaData.avgSessionDurationChange ?? 0,
      bounceRate: gaData.bounceRate ?? 0,
      bounceRateChange: gaData.bounceRateChange ?? 0,
      topPages: gaData.topPages ?? [],
      trafficSources: gaData.trafficSources ?? [],
    };

    return NextResponse.json(safeGaData);
  } catch (error) {
    console.error('Error in analytics route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}