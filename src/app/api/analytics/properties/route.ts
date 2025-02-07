import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
  console.log('Session in /api/analytics/properties:', session);

  if (!session?.user?.id || !session.accessToken) {
    console.log('Unauthorized: No session, user ID, or access token.');
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
    });

    const analyticsAdmin = google.analyticsadmin({
      version: 'v1alpha',
      auth: oauth2Client,
    });

    console.log('Fetching GA4 properties with:', oauth2Client.credentials);

    // First, fetch the list of accounts
    const accountsResponse = await analyticsAdmin.accountSummaries.list();

    console.log('GA Account Summaries response:', accountsResponse);

    // Extract the account ID from the first account (assuming at least one exists)
    const accountId = accountsResponse.data.accountSummaries?.[0]?.account;

    if (!accountId) {
      console.error('No accounts found for this user.');
      return NextResponse.json({ error: 'No Google Analytics accounts found' }, { status: 404 });
    }

    // Now, fetch the properties using the account ID in the filter
    const propertiesResponse = await analyticsAdmin.properties.list({
      filter: `parent:${accountId}`,
      showDeleted: false,
    });

    console.log('GA Management API response:', propertiesResponse);

    // Log the full response structure for debugging
    console.log('Full GA response:', JSON.stringify(propertiesResponse.data, null, 2));

    const properties = (propertiesResponse.data as ListPropertiesResponse).properties
      ?.filter((property) => !property.name.startsWith('deleted:')) // Ensure property is not deleted
      .map((property) => ({
        id: property.name, // The resource name, e.g., "properties/12345"
        name: property.displayName,
        websiteUrl: property.parent, // Not directly available, needs to be constructed or fetched later
        accountId: accountId, // Use the retrieved account ID
        accountName: accountsResponse.data.accountSummaries?.[0]?.displayName, // Use account display name
      })) || [];

    console.log('Extracted properties:', properties);

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching GA properties:', error);
    let errorMessage = 'Failed to fetch GA properties';
    let statusCode = 500;

    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }

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
    console.error('Error details:', (error as GoogleApiError).response?.data || error); // Log full error details

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
