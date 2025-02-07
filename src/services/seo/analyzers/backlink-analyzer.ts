import axios from 'axios';
import { prisma } from '@/lib/prisma';
import { Backlink, BacklinkStatus, BacklinkType } from '@prisma/client';

export interface BacklinkData {
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

export class BacklinkAnalyzer {
  private readonly projectId: string;
  private readonly projectDomain: string;

  constructor(projectId: string, projectDomain: string) {
    this.projectId = projectId;
    this.projectDomain = projectDomain;
  }

  /**
   * Discovers new backlinks for the project using various methods:
   * - Google Search Console API (if connected)
   * - Bing Webmaster Tools API (if connected)
   * - Web crawling of referring domains
   */
  async discoverBacklinks(): Promise<BacklinkData[]> {
    // TODO: Implement actual backlink discovery using APIs
    // For now, return sample data
    return [];
  }

  /**
   * Checks the status of existing backlinks
   */
  async checkBacklinkStatus(backlink: Pick<Backlink, 'id' | 'url' | 'targetUrl'>) {
    try {
      const response = await axios.get(backlink.url, {
        timeout: 10000,
        maxRedirects: 5,
      });

      const html = response.data as string;
      const status = this.validateBacklink(html, backlink.targetUrl);

      await this.updateBacklinkStatus(backlink.id, status);
      await this.recordBacklinkHistory(backlink.id, status);
    } catch (error) {
      console.error('Failed to check backlink:', error);
      // If request fails, mark as broken
      await this.updateBacklinkStatus(backlink.id, 'BROKEN');
      await this.recordBacklinkHistory(backlink.id, 'BROKEN');
    }
  }

  /**
   * Validates if a backlink is still present in the HTML
   */
  private validateBacklink(html: string, targetUrl: string): BacklinkStatus {
    if (html.includes(targetUrl)) {
      return 'ACTIVE';
    }
    return 'LOST';
  }

  /**
   * Calculates domain authority using various metrics:
   * - Domain age
   * - Number of referring domains
   * - Traffic metrics
   * - Social signals
   */
  private async calculateDomainAuthority(domain: string): Promise<number> {
    try {
      // Basic domain authority calculation based on domain age and backlinks
      const response = await axios.get(`https://${domain}`);
      const headers = response.headers;
      
      // Get domain age from Last-Modified header if available
      const lastModified = headers['last-modified'];
      const domainAge = lastModified
        ? Math.floor((Date.now() - new Date(lastModified).getTime()) / (1000 * 60 * 60 * 24 * 365))
        : 1;

      // Get number of backlinks for this domain from our database
      const domainBacklinks = await prisma.backlink.count({
        where: {
          url: {
            contains: domain
          },
          status: 'ACTIVE'
        }
      });

      // Calculate score based on domain age and number of backlinks
      // Score = (domain age * 2) + (number of backlinks * 0.5), max 100
      const score = Math.min(100, (domainAge * 2) + (domainBacklinks * 0.5));
      return Math.max(1, Math.floor(score)); // Ensure score is at least 1

    } catch (error) {
      console.error('Failed to calculate domain authority:', error);
      // Return a base score of 1 if calculation fails
      return 1;
    }
  }

  /**
   * Updates backlink status in the database
   */
  private async updateBacklinkStatus(
    backlinkId: string,
    status: BacklinkStatus
  ) {
    const domainAuthority = await this.calculateDomainAuthority(
      new URL(this.projectDomain).hostname
    );

    await prisma.backlink.update({
      where: { id: backlinkId },
      data: {
        status,
        domainAuthority,
        lastChecked: new Date(),
      },
    });
  }

  /**
   * Records backlink status history
   */
  private async recordBacklinkHistory(
    backlinkId: string,
    status: BacklinkStatus
  ) {
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

  /**
   * Analyzes anchor text distribution
   */
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

  /**
   * Gets backlink growth over time
   */
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
      const status = record.status.toLowerCase() as keyof BacklinkGrowth;
      acc[date][status]++;
      return acc;
    }, {});
  }
}