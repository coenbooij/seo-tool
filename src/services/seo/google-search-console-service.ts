import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import type { webmasters_v3 } from 'googleapis';

interface SiteEntry {
  siteUrl: string;
  permissionLevel: string;
}

interface SitesList {
  siteEntry?: SiteEntry[];
}

export interface GSCData {
  clicks: number;
  clicksChange: number;
  impressions: number;
  impressionsChange: number;
  ctr: number;
  ctrChange: number;
  position: number;
  positionChange: number;
}

interface SearchAnalyticsRow {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
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
  ): Promise<webmasters_v3.Schema$SearchAnalyticsQueryResponse> {
    const webmasters = google.webmasters({ version: 'v3', auth: this.oauth2Client });
    const response = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 10,
      },
    });
    return response.data;
  }

  public async listSites(): Promise<SitesList> {
    const webmasters = google.webmasters({ version: 'v3', auth: this.oauth2Client });
    const response = await webmasters.sites.list();
    return response.data as SitesList;
  }

  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  private sumRows(rows: SearchAnalyticsRow[] | undefined): { clicks: number; impressions: number; position: number } {
    if (!rows || rows.length === 0) {
      return { clicks: 0, impressions: 0, position: 0 };
    }

    return rows.reduce((acc, row) => {
      // For position, we need weighted average based on impressions
      const weightedPosition = (row.position || 0) * (row.impressions || 0);
      return {
        clicks: acc.clicks + (row.clicks || 0),
        impressions: acc.impressions + (row.impressions || 0),
        position: acc.position + weightedPosition,
      };
    }, { clicks: 0, impressions: 0, position: 0 });
  }

  public async getAggregatedData(
    siteUrl: string,
    startDate: string,
    endDate: string
  ): Promise<GSCData> {
    const webmasters = google.webmasters({ version: 'v3', auth: this.oauth2Client });

    // Calculate previous period ensuring no gap
    const currentStartDate = new Date(startDate);
    const currentEndDate = new Date(endDate);
    const periodLength = currentEndDate.getTime() - currentStartDate.getTime();
    
    const previousEndDate = new Date(currentStartDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);
    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setTime(previousEndDate.getTime() - periodLength);

    const previousStartDateStr = previousStartDate.toISOString().split('T')[0];
    const previousEndDateStr = previousEndDate.toISOString().split('T')[0];

    let currentResponse, previousResponse;

    try {
      currentResponse = await webmasters.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dataState: 'final', // Only get final data
          dimensions: [], // No dimensions for aggregated data
        },
      });
    } catch (error) {
      console.error('Error fetching current GSC data:', error);
      currentResponse = { data: { rows: [] } }; // Provide default empty data
    }

    try {
      previousResponse = await webmasters.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate: previousStartDateStr,
          endDate: previousEndDateStr,
          dataState: 'final', // Only get final data
          dimensions: [], // No dimensions for aggregated data
        },
      });
    } catch (error) {
      console.error('Error fetching previous GSC data:', error);
      previousResponse = { data: { rows: [] } }; // Provide default empty data
    }

    // Sum up all rows for total metrics
    const current = this.sumRows(currentResponse.data.rows as SearchAnalyticsRow[]);
    const previous = this.sumRows(previousResponse.data.rows as SearchAnalyticsRow[]);

    // Calculate CTR from totals
    const currentCtr = current.impressions > 0 ? (current.clicks / current.impressions) : 0;
    const previousCtr = previous.impressions > 0 ? (previous.clicks / previous.impressions) : 0;

    // Calculate average position from weighted positions
    const currentPosition = current.impressions > 0 ? (current.position / current.impressions) : 0;
    const previousPosition = previous.impressions > 0 ? (previous.position / previous.impressions) : 0;

    return {
      clicks: current.clicks,
      clicksChange: this.calculateChange(current.clicks, previous.clicks),
      impressions: current.impressions,
      impressionsChange: this.calculateChange(current.impressions, previous.impressions),
      ctr: currentCtr,
      ctrChange: this.calculateChange(currentCtr, previousCtr),
      position: currentPosition,
      positionChange: this.calculateChange(currentPosition, previousPosition),
    };
  }
}

export default GoogleSearchConsoleService;
