import { google, analyticsdata_v1beta } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface AnalyticsData {
  users: number;
  usersChange: number;
  pageViews: number;
  pageViewsChange: number;
  avgSessionDuration: number;
  avgSessionDurationChange: number;
  bounceRate: number;
  bounceRateChange: number;
  topPages: Array<{
    path: string;
    pageViews: number;
    change: number;
  }>;
  trafficSources: Array<{
    source: string;
    users: number;
    change: number;
  }>;
}

export type TimeSpan = '7d' | '30d' | '90d' | '180d' | '365d';

type DateRange = analyticsdata_v1beta.Schema$DateRange;

export default class GoogleAnalyticsService {
  private analytics: analyticsdata_v1beta.Analyticsdata;
  private propertyId: string;

  constructor(auth: OAuth2Client, propertyId: string) {
    this.analytics = google.analyticsdata({ version: 'v1beta', auth });
    // propertyId is already in the format "properties/12345" from properties dropdown
    this.propertyId = propertyId;
  }

  private getDateRange(timeSpan: TimeSpan): { current: DateRange; previous: DateRange } {
    const now = new Date();
    const days = parseInt(timeSpan);
    
    const currentEndDate = new Date(now);
    const currentStartDate = new Date(now);
    currentStartDate.setDate(currentStartDate.getDate() - days);
    
    const previousEndDate = new Date(currentStartDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);
    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    return {
      current: {
        startDate: currentStartDate.toISOString().split('T')[0],
        endDate: currentEndDate.toISOString().split('T')[0],
      },
      previous: {
        startDate: previousStartDate.toISOString().split('T')[0],
        endDate: previousEndDate.toISOString().split('T')[0],
      },
    };
  }

  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  async getAnalytics(timeSpan: TimeSpan = '30d'): Promise<AnalyticsData | null> {
    try {
      const dateRanges = this.getDateRange(timeSpan);

      const [mainMetrics, topPages, trafficSources] = await Promise.all([
        // Main metrics
        this.analytics.properties.runReport({
          property: this.propertyId,
          requestBody: {
            dateRanges: [dateRanges.current, dateRanges.previous],
            metrics: [
              { name: 'activeUsers' },
              { name: 'screenPageViews' },
              { name: 'averageSessionDuration' },
              { name: 'bounceRate' },
            ],
          },
        }),
        // Top pages
        this.analytics.properties.runReport({
          property: this.propertyId,
          requestBody: {
            dateRanges: [dateRanges.current, dateRanges.previous],
            dimensions: [{ name: 'pagePath' }],
            metrics: [{ name: 'screenPageViews' }],
            dimensionFilter: {
              filter: {
                fieldName: 'pagePath',
                stringFilter: {
                  matchType: 'BEGINS_WITH',
                  value: '/',
                },
              },
            },
            orderBys: [
              {
                metric: { metricName: 'screenPageViews' },
                desc: true,
              },
            ],
            limit: '10',
          },
        }),
        // Traffic sources
        this.analytics.properties.runReport({
          property: this.propertyId,
          requestBody: {
            dateRanges: [dateRanges.current, dateRanges.previous],
            dimensions: [{ name: 'sessionSource' }],
            metrics: [{ name: 'activeUsers' }],
            orderBys: [
              {
                metric: { metricName: 'activeUsers' },
                desc: true,
              },
            ],
            limit: '10',
          },
        }),
      ]);

      // Process main metrics - rows come in chronological order
      const currentMetrics = mainMetrics.data.rows?.[0]?.metricValues?.map(v => parseFloat(v.value || '0')) || [0, 0, 0, 0];
      const previousMetrics = mainMetrics.data.rows?.[1]?.metricValues?.map(v => parseFloat(v.value || '0')) || [0, 0, 0, 0];

      // Process top pages - rows are paired (current, previous) for each path
      const pagesMap = new Map<string, { current: number; previous: number }>();
      topPages.data.rows?.forEach((row, index) => {
        const path = row.dimensionValues?.[0]?.value || '';
        const views = parseFloat(row.metricValues?.[0]?.value || '0');
        const existing = pagesMap.get(path) || { current: 0, previous: 0 };
        
        if (index % 2 === 0) {
          existing.current = views;
        } else {
          existing.previous = views;
        }
        pagesMap.set(path, existing);
      });

      // Process traffic sources - rows are paired (current, previous) for each source
      const sourcesMap = new Map<string, { current: number; previous: number }>();
      trafficSources.data.rows?.forEach((row, index) => {
        const source = row.dimensionValues?.[0]?.value || '';
        const users = parseFloat(row.metricValues?.[0]?.value || '0');
        const existing = sourcesMap.get(source) || { current: 0, previous: 0 };
        
        if (index % 2 === 0) {
          existing.current = users;
        } else {
          existing.previous = users;
        }
        sourcesMap.set(source, existing);
      });

      return {
        users: currentMetrics[0],
        usersChange: this.calculateChange(currentMetrics[0], previousMetrics[0]),
        pageViews: currentMetrics[1],
        pageViewsChange: this.calculateChange(currentMetrics[1], previousMetrics[1]),
        avgSessionDuration: currentMetrics[2],
        avgSessionDurationChange: this.calculateChange(currentMetrics[2], previousMetrics[2]),
        bounceRate: currentMetrics[3],
        bounceRateChange: this.calculateChange(currentMetrics[3], previousMetrics[3]),
        topPages: Array.from(pagesMap.entries())
          .map(([path, data]) => ({
            path,
            pageViews: data.current,
            change: this.calculateChange(data.current, data.previous),
          }))
          .sort((a, b) => b.pageViews - a.pageViews)
          .slice(0, 5),
        trafficSources: Array.from(sourcesMap.entries())
          .map(([source, data]) => ({
            source,
            users: data.current,
            change: this.calculateChange(data.current, data.previous),
          }))
          .sort((a, b) => b.users - a.users)
          .slice(0, 5),
      };
    } catch (error) {
      console.error('Error fetching Google Analytics data:', error);
      return null;
    }
  }
}