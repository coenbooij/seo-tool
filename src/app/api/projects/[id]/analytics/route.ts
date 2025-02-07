import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import GoogleSearchConsoleService from '@/services/seo/google-search-console-service';
import GoogleAnalyticsService from '@/services/seo/google-analytics-service';
import { google } from 'googleapis';

// Simplified interfaces to match AnalyticsData
interface PageAnalytics {
  path: string;
  pageViews: number;
}

interface TrafficSource {
  source: string;
  users: number;
}

interface Analytics {
  users: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  topPages: PageAnalytics[];
  trafficSources: TrafficSource[];
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await context.params;
  const { id } = params;

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
          'Please configure your project with a Google Analytics Property ID and a Google Search Console verified site. You can acces the configuration page by clicking on the gear icon in the top right corner.',
        gaPropertyId: project.gaPropertyId,
        gscVerifiedSite: project.gscVerifiedSite,
      },
      { status: 200 }
    ); // Use 200 OK to indicate request was successful, but there's missing config
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: session.accessToken,
  });

  // Use the same oauth2Client for both services
  const gscService = new GoogleSearchConsoleService(oauth2Client);
  const gaService = new GoogleAnalyticsService(oauth2Client, project.gaPropertyId);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
  const startDate = thirtyDaysAgo.toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];

  const [gscResponse, gaData] = await Promise.all([
    gscService.getPageAnalytics(project.gscVerifiedSite, startDate, endDate),
    gaService.getAnalytics(startDate, endDate),
  ]);

  // Check if gaData is defined, and provide defaults if not
  const safeGaData: Analytics = gaData ?? {
    users: 0,
    pageViews: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    topPages: [],
    trafficSources: [],
  };

  const gscData = gscResponse?.rows || [];

  // Merge GSC data into GA's topPages
  const topPages: PageAnalytics[] = safeGaData.topPages.map((page) => {
    const gscPageData = gscData.find(
      (gscRow) => gscRow?.keys?.[0] === page.path
    );
    return {
      path: page.path,
      pageViews: page.pageViews,
    };
  });

  const analytics: Analytics = {
    users: safeGaData.users,
    pageViews: safeGaData.pageViews,
    avgSessionDuration: safeGaData.avgSessionDuration,
    bounceRate: safeGaData.bounceRate,
    topPages,
    trafficSources: safeGaData.trafficSources.map((source) => ({
      source: source.source,
      users: source.users,
    })),
  };

  return NextResponse.json(analytics);
}