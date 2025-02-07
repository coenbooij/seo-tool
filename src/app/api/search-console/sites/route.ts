import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { google } from 'googleapis';
import GoogleSearchConsoleService from '@/services/seo/google-search-console-service';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

  const gscService = new GoogleSearchConsoleService(oauth2Client);

  try {
    const sitesList = await gscService.listSites();
        const sites = sitesList.siteEntry
            ? sitesList.siteEntry.map((site) => ({
                url: site.siteUrl,
                permissionLevel: site.permissionLevel,
            }))
            : [];

    return NextResponse.json(sites);
  } catch (error) {
    console.error('Error fetching Search Console sites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Search Console sites' },
      { status: 500 }
    );
  }
}