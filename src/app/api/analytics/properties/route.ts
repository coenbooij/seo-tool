import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createGoogleAuthClient } from '@/lib/google-auth';

interface GA4Property {
  name: string;
  displayName: string;
  createTime: string;
  updateTime: string;
  parent: string;
  currencyCode: string;
  timeZone: string;
}

interface ListPropertiesResponse {
  properties?: GA4Property[];
  nextPageToken?: string;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const oauth2Client = createGoogleAuthClient(session);

    const analyticsAdmin = google.analyticsadmin({
      version: 'v1alpha',
      auth: oauth2Client,
    });

    // First, fetch the list of accounts
    const accountsResponse = await analyticsAdmin.accountSummaries.list();

    // Extract the account ID from the first account (assuming at least one exists)
    const accountId = accountsResponse.data.accountSummaries?.[0]?.account;

    if (!accountId) {
      return NextResponse.json({ error: 'No Google Analytics accounts found' }, { status: 404 });
    }

    // Now, fetch the properties using the account ID in the filter
    const propertiesResponse = await analyticsAdmin.properties.list({
      filter: `parent:${accountId}`,
      showDeleted: false,
    });

    const properties = (propertiesResponse.data as ListPropertiesResponse).properties
      ?.filter((property) => !property.name.startsWith('deleted:'))
      .map((property) => ({
        id: property.name,
        name: property.displayName,
        websiteUrl: property.parent,
        accountId: accountId,
        accountName: accountsResponse.data.accountSummaries?.[0]?.displayName,
      })) || [];

    return NextResponse.json(properties);
  } catch (error) {
    let errorMessage = 'Failed to fetch GA properties';
    let statusCode = 500;

    // Define a more specific type for the error object
    interface GoogleApiError extends Error {
      code?: number;
      response?: {
        status?: number;
        data?: {
          error?: {
            message?: string;
          };
        };
      };
    }

    if (
      (error as GoogleApiError).code === 403 ||
      (error instanceof Error && error.message?.includes('Insufficient Permission'))
    ) {
      errorMessage = 'Insufficient permissions to access Google Analytics data';
      statusCode = 403;
    } else if ((error as GoogleApiError).response && (error as GoogleApiError).response?.status) {
      statusCode = (error as GoogleApiError).response!.status!;
      errorMessage = (error as GoogleApiError).response?.data?.error?.message || errorMessage;
    }

    console.error('Google Analytics API error:', error);
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
