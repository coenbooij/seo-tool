import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

class GoogleSearchConsoleService {
  private oauth2Client: OAuth2Client;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.oauth2Client = new google.auth.OAuth2(clientId || '', clientSecret || '', redirectUri || '');
  }

  public async getAccessToken(code: string): Promise<string> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens.access_token || '';
  }

  public async getCurrentRankings(siteUrl: string): Promise<import('googleapis').webmasters_v3.Schema$SearchAnalyticsQueryResponse> {
    const webmasters = google.webmasters({ version: 'v3', auth: this.oauth2Client });
    const response = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: '2022-01-01',
        endDate: '2022-12-31',
        dimensions: ['query'],
        rowLimit: 10,
      },
    });
    return response.data;
  }

  public async getClickImpressionData(siteUrl: string): Promise<import('googleapis').webmasters_v3.Schema$SearchAnalyticsQueryResponse> {
    const webmasters = google.webmasters({ version: 'v3', auth: this.oauth2Client });
    const response = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: '2022-01-01',
        endDate: '2022-12-31',
        dimensions: ['page'],
        rowLimit: 10,
      },
    });
    return response.data;
  }

  public async identifyRankingOpportunities(siteUrl: string): Promise<import('googleapis').webmasters_v3.Schema$SearchAnalyticsQueryResponse> {
    const webmasters = google.webmasters({ version: 'v3', auth: this.oauth2Client });
    const response = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: '2022-01-01',
        endDate: '2022-12-31',
        dimensions: ['query'],
        rowLimit: 10,
        dimensionFilterGroups: [
          {
            dimensionFilterGroups: [
              {
                filters: [
                  {
                    dimension: 'position',
                    operator: 'lessThan',
                    expression: '10',
                  },
                ],
              },
            ],
            operator: 'lessThan',
            expression: '10',
          },
        ],
      },
    });
    return response.data;
  }
}

export default GoogleSearchConsoleService;