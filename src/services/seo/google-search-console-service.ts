import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

class GoogleSearchConsoleService {
  private oauth2Client: OAuth2Client;

  /**
   * Constructs the GoogleSearchConsoleService.
   * @param {string} clientId - Google Client ID.
   * @param {string} clientSecret - Google Client Secret.
   * @param {string} redirectUri - Redirect URI.
   */
  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }

  /**
   * Exchanges an authorization code for an access token.
   * @param {string} code - Authorization code.
   * @returns {Promise<string>} - Access token.
   */
  public async getAccessToken(code: string): Promise<string> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens.access_token || '';
  }

  /**
   * Fetches page analytics (clicks, impressions, CTR, position) from Google Search Console.
   * @param {string} siteUrl - The site URL.
   * @param {string} startDate - Start date in YYYY-MM-DD format.
   * @param {string} endDate - End date in YYYY-MM-DD format.
   * @returns {Promise<import('googleapis').webmasters_v3.Schema$SearchAnalyticsQueryResponse>} - Search analytics data.
   */
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
}

export default GoogleSearchConsoleService;