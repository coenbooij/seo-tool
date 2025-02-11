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
  private auth: OAuth2Client;

  constructor(auth: OAuth2Client, propertyId: string) {
    this.auth = auth;
    this.analytics = google.analyticsdata({ version: 'v1beta', auth });
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

  private formatTrafficSource(source: string | undefined | null, medium: string | undefined | null): string {
    if (!source || source === '(not set)') {
      if (!medium || medium === '(none)' || medium === '(not set)') {
        return 'Direct';
      }
      return this.formatMedium(medium);
    }

    source = source.toLowerCase();

    // Handle search engines
    if (source === 'google' && medium === 'organic') return 'Organic Search';
    if (source === 'bing' && medium === 'organic') return 'Organic Search';
    if (source === 'yahoo' && medium === 'organic') return 'Organic Search';
    if (source === 'duckduckgo' && medium === 'organic') return 'Organic Search';

    // Handle direct traffic
    if (source === '(direct)') return 'Direct';

    // Handle social media
    if (this.isSocialMedia(source)) {
      return this.formatSocialSource(source);
    }

    // Format source name
    const formattedSource = source
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('.');

    // Add medium context for non-standard sources if it adds value
    const formattedMedium = this.formatMedium(medium);
    if (formattedMedium && formattedMedium !== 'Referral') {
      return `${formattedSource} (${formattedMedium})`;
    }

    return formattedSource;
  }

  private formatMedium(medium: string | undefined | null): string {
    if (!medium || medium === '(not set)' || medium === '(none)') return '';
    
    switch (medium.toLowerCase()) {
      case 'organic': return 'Organic';
      case 'cpc': return 'Paid Search';
      case 'social': return 'Social';
      case 'email': return 'Email';
      case 'referral': return 'Referral';
      case 'affiliate': return 'Affiliate';
      default: return medium.charAt(0).toUpperCase() + medium.slice(1);
    }
  }

  private isSocialMedia(source: string): boolean {
    const socialDomains = [
      'facebook',
      'instagram',
      'twitter',
      't.co',
      'linkedin',
      'pinterest',
      'youtube'
    ];
    return socialDomains.some(domain => source.includes(domain));
  }

  private formatSocialSource(source: string): string {
    if (source.includes('facebook') || source.includes('fb')) return 'Facebook';
    if (source.includes('instagram')) return 'Instagram';
    if (source.includes('twitter') || source === 't.co') return 'Twitter';
    if (source.includes('linkedin')) return 'LinkedIn';
    if (source.includes('pinterest')) return 'Pinterest';
    if (source.includes('youtube')) return 'YouTube';
    return 'Social Media';
  }

  async getAnalytics(timeSpan: TimeSpan = '30d'): Promise<AnalyticsData | null> {
    try {
      // Verify auth state before making requests
      if (!this.auth) {
        throw new Error('No authentication client available');
      }

      // Force token refresh to ensure we have a valid token
      try {
        await this.auth.getAccessToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        throw new Error('Invalid Credentials - Token refresh failed');
      }

      const dateRanges = this.getDateRange(timeSpan);
      let mainMetrics, topPages, trafficSources;

      try {
        // Main metrics
        try {
          mainMetrics = await this.analytics.properties.runReport({
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
          });
        } catch (error) {
          console.error('Error fetching main metrics:', error);
          mainMetrics = { data: { rows: [] } }; // Provide default empty data
        }

        // Top pages
        try {
          topPages = await this.analytics.properties.runReport({
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
          });
        } catch (error) {
          console.error('Error fetching top pages:', error);
          topPages = { data: { rows: [] } }; // Provide default empty data
        }

        // Traffic sources with session medium
        try {
          trafficSources = await this.analytics.properties.runReport({
            property: this.propertyId,
            requestBody: {
              dateRanges: [dateRanges.current, dateRanges.previous],
              dimensions: [
                { name: 'sessionSource' },
                { name: 'sessionMedium' }
              ],
              metrics: [{ name: 'activeUsers' }],
              orderBys: [
                {
                  metric: { metricName: 'activeUsers' },
                  desc: true,
                },
              ],
              limit: '25',
            },
          });
        } catch (error) {
          console.error('Error fetching traffic sources:', error);
          trafficSources = { data: { rows: [] } }; // Provide default empty data
        }

        const currentMetrics = mainMetrics.data.rows?.[0]?.metricValues?.map(v => parseFloat(v.value || '0')) || [0, 0, 0, 0];
        const previousMetrics = mainMetrics.data.rows?.[1]?.metricValues?.map(v => parseFloat(v.value || '0')) || [0, 0, 0, 0];

        const pagesMap = new Map<string, { current: number; previous: number }>();
        topPages.data.rows?.forEach((row, index) => {
          const path = row?.dimensionValues?.[0]?.value || '';
          const views = parseFloat(row?.metricValues?.[0]?.value || '0');
          const existing = pagesMap.get(path) || { current: 0, previous: 0 };

          if (index % 2 === 0) {
            existing.current = views;
          } else {
            existing.previous = views;
          }
          pagesMap.set(path, existing);
        });

        const sourcesMap = new Map<string, { current: number; previous: number }>();
        trafficSources.data.rows?.forEach((row, index) => {
          const source = row?.dimensionValues?.[0]?.value;
          const medium = row?.dimensionValues?.[1]?.value;
          const users = parseFloat(row?.metricValues?.[0]?.value || '0');

          const sourceName = this.formatTrafficSource(source, medium);
          const existing = sourcesMap.get(sourceName) || { current: 0, previous: 0 };

          if (index % 2 === 0) {
            existing.current += users;
          } else {
            existing.previous += users;
          }
          sourcesMap.set(sourceName, existing);
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
        // This outer catch should not be necessary now, but keeping it for safety
        console.error('Unexpected error in getAnalytics:', error);
        if (error instanceof Error) {
          throw new Error(`Analytics Error: ${error.message}`);
        }
        throw new Error('Unknown analytics error occurred');
      }
    } catch (error) {
      console.error('Error in getAnalytics:', error);
      if (error instanceof Error) {
        throw new Error(`Analytics Error: ${error.message}`);
      }
      throw new Error('Unknown analytics error occurred');
    }
  }
}