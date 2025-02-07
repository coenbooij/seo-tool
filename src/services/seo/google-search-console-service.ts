import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface SiteEntry {
  siteUrl: string;
  permissionLevel: string;
}

interface SitesList {
  siteEntry?: SiteEntry[];
}

class GoogleSearchConsoleService {
  private oauth2Client: OAuth2Client;

  constructor(oauth2Client: OAuth2Client) {
    this.oauth2Client = oauth2Client;
  }

  public async getPageAnalytics(
    siteUrl: string,
    startDate: string,
    endDate: string
  ): Promise<import('googleapis').webmasters_v3.Schema$SearchAnalyticsQueryResponse> {
    const webmasters = google.webmasters({ version: 'v3', auth: this.oauth2Client });
    const response = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 10, // Consider increasing this limit or paginating
      },
    });
    return response.data;
  }

    public async listSites(): Promise<SitesList> {
        const webmasters = google.webmasters({ version: 'v3', auth: this.oauth2Client });
        const response = await webmasters.sites.list();
        return response.data as SitesList; // Cast to the defined interface.
    }
}

export default GoogleSearchConsoleService;