import { BetaAnalyticsDataClient, IRow } from '@google-analytics/data';

interface AnalyticsData {
  users: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  topPages: { path: string; pageViews: number; }[];
  trafficSources: { source: string; users: number; }[];
}

class GoogleAnalyticsService {
  private analyticsDataClient: BetaAnalyticsDataClient;
  private propertyId: string;

  /**
   * Constructs the GoogleAnalyticsService.
   * @param {object} authClient - The Google Auth client.
   * @param {string} propertyId - Google Analytics Property ID (e.g., '123456789').
   */
  constructor(authClient: object, propertyId: string) {
    this.analyticsDataClient = new BetaAnalyticsDataClient({ authClient });
    this.propertyId = propertyId;
  }

    /**
   * Fetches analytics data for a given date range.
   * @param {string} startDate - Start date in YYYY-MM-DD format.
   * @param {string} endDate - End date in YYYY-MM-DD format.
   * @returns {Promise<AnalyticsData>} - Analytics data.
   */
    async getAnalytics(startDate: string, endDate: string): Promise<AnalyticsData> {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [
          {
            startDate,
            endDate,
          },
        ],
        dimensions: [
          { name: 'pagePath' },
          { name: 'sessionSource' }
        ],
        metrics: [
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
        ],
      });

      if (!response.rows) {
        return {
          users: 0,
          pageViews: 0,
          avgSessionDuration: 0,
          bounceRate: 0,
          topPages: [],
          trafficSources: [],
        }
      }

      let users = 0;
      let pageViews = 0;
      let avgSessionDuration = 0;
      let bounceRate = 0;
      const topPages: { path: string; pageViews: number; }[] = [];
      const trafficSources: { source: string; users: number; }[] = [];

      response.rows.forEach((row: IRow) => {
        if (!row.dimensionValues || !row.metricValues) return;

        const pagePath = row.dimensionValues[0].value;
        const sessionSource = row.dimensionValues[1].value;
        const userCount = Number(row.metricValues[0].value);
        const pageViewCount = Number(row.metricValues[1].value);
        const sessionDuration = Number(row.metricValues[2].value);
        const bounceRateValue = Number(row.metricValues[3].value);

        users += userCount;
        pageViews += pageViewCount;
        avgSessionDuration += sessionDuration; // We'll calculate the average later
        bounceRate += bounceRateValue;

        // Aggregate top pages
        const existingPage = topPages.find(p => p.path === pagePath);
        if (existingPage) {
          existingPage.pageViews += pageViewCount;
        } else if (pagePath) {
          topPages.push({ path: pagePath, pageViews: pageViewCount });
        }

        // Aggregate traffic sources
        const existingSource = trafficSources.find(s => s.source === sessionSource);
        if (existingSource) {
          existingSource.users += userCount;
        } else if (sessionSource) {
          trafficSources.push({ source: sessionSource, users: userCount });
        }
      });

      const rowCount = response.rows.length;
      if (rowCount > 0) {
          avgSessionDuration /= rowCount;
          bounceRate /= rowCount;
      }

      // Sort top pages and traffic sources by views/users and limit to top 5
      topPages.sort((a, b) => b.pageViews - a.pageViews);
      trafficSources.sort((a, b) => b.users - a.users);
      const top5Pages = topPages.slice(0, 5);
      const top5TrafficSources = trafficSources.slice(0, 5);

      return {
        users,
        pageViews,
        avgSessionDuration,
        bounceRate,
        topPages: top5Pages,
        trafficSources: top5TrafficSources,
      };
    }
}

export default GoogleAnalyticsService;