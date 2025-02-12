import axios from 'axios';
import { prisma } from '@/lib/prisma';
import { Backlink, BacklinkStatus, BacklinkType } from '@prisma/client';
import { parse } from 'node-html-parser';

interface BacklinkData {
  url: string;
  targetUrl: string;
  anchorText: string;
  type: BacklinkType;
  domainAuthority?: number;
  status?: BacklinkStatus;
  firstSeen?: Date;
}

interface BacklinkGrowth {
  active: number;
  lost: number;
  broken: number;
}

export interface DomainMetrics {
  age: number;
  totalBacklinks: number;
  hasHttps: boolean;
  totalOutboundLinks: number;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
}

export class BacklinkAnalyzer {
  private readonly projectId: string;
  private readonly projectDomain: string;
  private readonly accessToken: string;

  constructor(projectId: string, projectDomain: string, accessToken: string) {
    this.projectId = projectId;
    this.projectDomain = projectDomain;
    this.accessToken = accessToken;
  }

  async discoverBacklinks(): Promise<BacklinkData[]> {
    console.log('Automatic backlink discovery is currently disabled');
    return [];
  }

  async getDomainMetrics(domain: string): Promise<DomainMetrics> {
    try {
      // Make parallel requests for efficiency
      const [
        websiteResponse,
        robotsResponse,
        sitemapResponse
      ] = await Promise.allSettled([
        axios.get(`https://${domain}`),
        axios.get(`https://${domain}/robots.txt`),
        axios.get(`https://${domain}/sitemap.xml`)
      ]);

      // Get domain age from WHOIS or headers
      const lastModified = websiteResponse.status === 'fulfilled' 
        ? websiteResponse.value.headers['last-modified']
        : null;
      
      const domainAge = lastModified
        ? Math.floor((Date.now() - new Date(lastModified).getTime()) / (1000 * 60 * 60 * 24 * 365))
        : 1;

      // Parse HTML to count outbound links
      let totalOutboundLinks = 0;
      if (websiteResponse.status === 'fulfilled') {
        const root = parse(websiteResponse.value.data);
        const links = root.querySelectorAll('a[href^="http"]');
        totalOutboundLinks = links.length;
      }

      // Get number of backlinks for this domain from our database
      const totalBacklinks = await prisma.backlink.count({
        where: {
          url: { contains: domain },
          status: 'ACTIVE'
        }
      });

      return {
        age: domainAge,
        totalBacklinks,
        hasHttps: websiteResponse.status === 'fulfilled',
        totalOutboundLinks,
        hasRobotsTxt: robotsResponse.status === 'fulfilled',
        hasSitemap: sitemapResponse.status === 'fulfilled'
      };
    } catch (error) {
      console.error('Failed to get domain metrics:', error);
      return {
        age: 1,
        totalBacklinks: 0,
        hasHttps: false,
        totalOutboundLinks: 0,
        hasRobotsTxt: false,
        hasSitemap: false
      };
    }
  }

  async calculateDomainAuthority(metrics: DomainMetrics): Promise<number> {
    try {
      // Calculate weighted score based on multiple factors
      let score = 0;
      
      // Domain age (max 20 points)
      score += Math.min(20, metrics.age * 2);
      
      // Total backlinks (max 30 points)
      score += Math.min(30, metrics.totalBacklinks * 0.3);
      
      // HTTPS (10 points)
      score += metrics.hasHttps ? 10 : 0;
      
      // Outbound links quality (max 20 points)
      // More outbound links might indicate a more authoritative site, but with diminishing returns
      score += Math.min(20, Math.log(metrics.totalOutboundLinks + 1) * 5);
      
      // Technical factors (10 points each)
      score += metrics.hasRobotsTxt ? 10 : 0;
      score += metrics.hasSitemap ? 10 : 0;
      
      // Ensure score is between 1 and 100
      return Math.max(1, Math.min(100, Math.round(score)));
    } catch (error) {
      console.error('Failed to calculate domain authority:', error);
      return 1;
    }
  }

  async checkBacklinkStatus(backlink: Pick<Backlink, 'id' | 'url' | 'targetUrl'>): Promise<void> {
    try {
      const response = await axios.get(backlink.url, {
        timeout: 10000,
        maxRedirects: 5,
      });

      const html = response.data;
      const status = this.validateBacklink(html, backlink.targetUrl);

      await this.updateBacklinkStatus(backlink.id, status);
      await this.recordBacklinkHistory(backlink.id, status);
    } catch (error) {
      console.error('Failed to check backlink:', error);
      await this.updateBacklinkStatus(backlink.id, 'BROKEN');
      await this.recordBacklinkHistory(backlink.id, 'BROKEN');
    }
  }

  private validateBacklink(html: string, targetUrl: string): BacklinkStatus {
    return html.includes(targetUrl) ? 'ACTIVE' : 'LOST';
  }

  private async updateBacklinkStatus(
    backlinkId: string,
    status: BacklinkStatus
  ): Promise<void> {
    await prisma.backlink.update({
      where: { id: backlinkId },
      data: {
        status,
        lastChecked: new Date(),
      },
    });
  }

  private async recordBacklinkHistory(
    backlinkId: string,
    status: BacklinkStatus
  ): Promise<void> {
    const backlink = await prisma.backlink.findUnique({
      where: { id: backlinkId },
      select: {
        domainAuthority: true
      }
    });

    if (!backlink) return;

    await prisma.backlinkHistory.create({
      data: {
        backlinkId,
        status,
        domainAuthority: backlink.domainAuthority,
      },
    });
  }

  async analyzeAnchorTextDistribution(): Promise<Record<string, number>> {
    const backlinks = await prisma.backlink.findMany({
      where: {
        projectId: this.projectId,
        status: 'ACTIVE'
      },
      select: {
        anchorText: true
      }
    });

    return backlinks.reduce((acc: Record<string, number>, { anchorText }) => {
      acc[anchorText] = (acc[anchorText] || 0) + 1;
      return acc;
    }, {});
  }

  async getBacklinkGrowth(days: number = 30): Promise<Record<string, BacklinkGrowth>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await prisma.backlinkHistory.findMany({
      where: {
        backlink: {
          projectId: this.projectId,
        },
        checkedAt: {
          gte: startDate,
        },
      },
      orderBy: {
        checkedAt: 'asc',
      },
    });

    return history.reduce((acc: Record<string, BacklinkGrowth>, record) => {
      const date = record.checkedAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          active: 0,
          lost: 0,
          broken: 0,
        };
      }
      acc[date][record.status.toLowerCase() as keyof BacklinkGrowth]++;
      return acc;
    }, {});
  }
}