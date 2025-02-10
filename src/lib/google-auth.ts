import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
import { Session } from 'next-auth';

const prisma = new PrismaClient();

export function createGoogleAuthClient(session: Session) {
  if (!session?.user?.id || !session.accessToken) {
    throw new Error('Unauthorized: No session or access token');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    scope: session.scope,
  });

  // Set up token refresh callback
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token || tokens.refresh_token) {
      // Update tokens in database
      await prisma.account.update({
        where: {
          provider_providerAccountId: {
            provider: 'google',
            providerAccountId: session.user.id,
          },
        },
        data: {
          access_token: tokens.access_token || undefined,
          refresh_token: tokens.refresh_token || undefined,
          expires_at: tokens.expiry_date
            ? Math.floor(tokens.expiry_date / 1000)
            : undefined,
        },
      });
    }
  });

  return oauth2Client;
}