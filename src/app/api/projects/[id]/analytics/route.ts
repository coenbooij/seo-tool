import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import GoogleAnalyticsService, { TimeSpan } from '@/services/seo/google-analytics-service';
import GoogleSearchConsoleService, { GSCData } from '@/services/seo/google-search-console-service';
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

// Updated interface with GSC data
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
  gscData?: GSCData;
  message?: string;
  gaPropertyId?: string | null;
  gscVerifiedSite?: string | null;
}

// Helper function to parse timespan into days
const timespanToDays = (timespan: TimeSpan): number => {
  switch (timespan) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    case '180d': return 180;
    case '365d': return 365;
    default: return 30;
  }
};

// Helper function to get date range
const getDateRange = (days: number): { startDate: string; endDate: string } => {
  const now = new Date();
  // GSC data has a 3-day delay, so we offset the end date
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() - 3);
  
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};

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

    if (!project.gaPropertyId && !project.gscVerifiedSite) {
      return NextResponse.json(
        {
          message:
            'Please configure your project with either a Google Analytics Property ID or a Google Search Console verified site. You can access the configuration page by clicking on the gear icon in the top right corner.',
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

    const days = timespanToDays(timespan);
    const { startDate, endDate } = getDateRange(days);
    
    let gaData = null;
    let gscData: GSCData | undefined;

    // Fetch GA data if configured
    if (project.gaPropertyId) {
      console.log('Fetching analytics with property ID:', project.gaPropertyId);
      const gaService = new GoogleAnalyticsService(oauth2Client, project.gaPropertyId);
      gaData = await gaService.getAnalytics(timespan);
    }

    // Fetch GSC data if configured
    if (project.gscVerifiedSite) {
      console.log('Fetching GSC data:', {
        site: project.gscVerifiedSite,
        startDate,
        endDate,
        days
      });

      const gscService = new GoogleSearchConsoleService(oauth2Client);
      try {
        gscData = await gscService.getAggregatedData(
          project.gscVerifiedSite, 
          startDate,
          endDate
        );
      } catch (error) {
        console.error('Error fetching GSC data:', error);
        // Don't fail the whole request if GSC fails
        gscData = undefined;
      }
    }

    // If neither requests succeeded
    if (!gaData && !gscData) {
      console.error('Failed to get any data');
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    // Use empty GA data if not available
    const emptyGaData = {
      users: 0,
      usersChange: 0,
      pageViews: 0,
      pageViewsChange: 0,
      avgSessionDuration: 0,
      avgSessionDurationChange: 0,
      bounceRate: 0,
      bounceRateChange: 0,
      topPages: [],
      trafficSources: []
    };

    // Use the available data
    const safeGaData: Analytics = {
      ...(gaData || emptyGaData),
      gscData,
      message: !project.gaPropertyId ? 'Google Analytics not configured' : 
               !project.gscVerifiedSite ? 'Google Search Console not configured' : 
               undefined,
      gaPropertyId: project.gaPropertyId,
      gscVerifiedSite: project.gscVerifiedSite
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