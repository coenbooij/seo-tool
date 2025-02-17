import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { google } from 'googleapis';
import GoogleSearchConsoleService from '@/services/seo/google-search-console-service';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    });

    // Set up token refresh callback
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.refresh_token || tokens.access_token) {
        // Handle token refresh silently
      }
    });

    const gscService = new GoogleSearchConsoleService(oauth2Client);

    const sitesList = await gscService.listSites();
    const sites = sitesList.siteEntry
      ? sitesList.siteEntry.map((site) => ({
          url: site.siteUrl,
          permissionLevel: site.permissionLevel,
        }))
      : [];

    return NextResponse.json(sites);
  } catch (error) {
    let errorMessage = 'Failed to fetch Search Console sites';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('insufficient permissions')) {
        errorMessage = 'Insufficient permissions to access Search Console data';
        statusCode = 403;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}