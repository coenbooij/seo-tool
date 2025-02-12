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
    console.log(`Checking backlink: ${backlink.url} -> ${backlink.targetUrl}`);
    
    try {
      const response = await axios.get(backlink.url, {
        timeout: 10000,
        maxRedirects: 10, 
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://google.com', // Simulates coming from a search result
          'Connection': 'keep-alive', // Keeps session open like a real browser
        },
        responseType: 'text',
        validateStatus: (status) => status < 500, // Allows capturing even "403 Forbidden" for debugging
      });

      console.log('Response received:', {
        status: response.status,
        contentType: response.headers['content-type'],
        contentLength: response.data.length
      });

      const html = response.data;
      const status = this.validateBacklink(html, backlink.targetUrl);

      console.log('Validation result:', status);
      await this.updateBacklinkStatus(backlink.id, status);
      await this.recordBacklinkHistory(backlink.id, status);
    } catch (error) {
      console.error('Failed to check backlink:', error);
      if (axios.isAxiosError(error)) {
        console.error('HTTP Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers,
          config: error.config
        });
      }
      await this.updateBacklinkStatus(backlink.id, 'BROKEN');
      await this.recordBacklinkHistory(backlink.id, 'BROKEN');
    }
  }

  public validateBacklink(html: string, targetUrl: string): BacklinkStatus {
    try {
      console.log('Starting backlink validation');
      console.log('Target URL:', targetUrl);
      
      // Parse HTML
      // Log HTML processing steps
      console.log('Starting HTML processing...');
      console.log('Raw HTML sample:', html.substring(0, 200));

      // Parse HTML and get all anchors
      const root = parse(html);
      const anchors = root.getElementsByTagName('a');
      console.log(`Found ${anchors.length} anchor elements`);

      // Process target URL
      const targetUrlObj = new URL(targetUrl);
      const targetDomain = targetUrlObj.hostname.toLowerCase().replace(/^www\./, '');
      console.log('Target URL details:', {
        original: targetUrl,
        normalizedDomain: targetDomain,
        pathname: targetUrlObj.pathname
      });

      // Log each anchor for debugging
      anchors.forEach((anchor, index) => {
        const href = anchor.getAttribute('href');
        const text = anchor.text;
        console.log(`Anchor ${index + 1}:`, { href, text });
      });

      for (const anchor of anchors) {
        const href = anchor.getAttribute('href');
        if (!href) continue;

        console.log('Checking href:', href);

        try {
          // Try to parse the href as a URL
          let hrefUrl: URL;
          try {
            hrefUrl = new URL(href);
          } catch {
            // If parsing fails, try adding the target domain
            hrefUrl = new URL(href, `https://${targetDomain}`);
          }

          const hrefDomain = hrefUrl.hostname.toLowerCase()
            .replace(/^www\./, ''); // Remove www. prefix
          const hrefPath = hrefUrl.pathname.replace(/\/$/, '').toLowerCase();

          console.log('Comparing domains:', { hrefDomain, targetDomain });
          console.log('Comparing paths:', { hrefPath, targetPath: targetUrlObj.pathname });

          // Log URL comparison details for debugging
          console.log('URL Comparison:', {
            sourceURL: hrefUrl.toString(),
            targetURL: targetUrl,
            sourceDomain: hrefDomain,
            targetDomain: targetDomain,
            sourcePath: hrefPath,
            targetPath: targetUrlObj.pathname
          });

          // First check domain match
          const domainsMatch = hrefDomain === targetDomain;
          console.log('Domain match:', domainsMatch);

          if (domainsMatch) {
            // If target is root domain or no specific path
            if (!targetUrlObj.pathname || targetUrlObj.pathname === '/') {
              console.log('✅ Match found - root domain');
              return 'ACTIVE';
            }

            // For specific paths, normalize and compare
            const normalizedTargetPath = targetUrlObj.pathname.replace(/\/$/, '').toLowerCase();
            const normalizedHrefPath = hrefPath.replace(/\/$/, '').toLowerCase();

            console.log('Path comparison:', {
              normalizedSourcePath: normalizedHrefPath,
              normalizedTargetPath: normalizedTargetPath
            });

            if (normalizedHrefPath === normalizedTargetPath) {
              console.log('✅ Match found - exact path match');
              return 'ACTIVE';
            }
          }
        } catch (error) {
          console.log('Error parsing URL:', href, error);
          continue;
        }
      }
      
      return 'LOST';
    } catch (error) {
      console.error('Error validating backlink:', error);
      return 'BROKEN';
    }
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
        status: true,
        domainAuthority: true
      }
    });

    if (!backlink) return;

    // Only record history if status has changed
    if (backlink.status !== status) {
      await prisma.backlinkHistory.create({
        data: {
          backlinkId,
          status,
          domainAuthority: backlink.domainAuthority,
        },
      });
    }
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
      include: {
        backlink: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        checkedAt: 'asc',
      },
    });

    // Track last status for each backlink by date
    const backlinkStatusByDate: Record<string, Record<string, string>> = {};
    const growth: Record<string, BacklinkGrowth> = {};

    for (const record of history) {
      const date = record.checkedAt.toISOString().split('T')[0];
      
      // Initialize the date's tracking objects if needed
      if (!backlinkStatusByDate[date]) {
        backlinkStatusByDate[date] = {};
      }
      if (!growth[date]) {
        growth[date] = {
          active: 0,
          lost: 0,
          broken: 0
        };
      }

      const previousStatus = backlinkStatusByDate[date][record.backlink.id];
      const currentStatus = record.status;

      // Only count the change if the status is different from the previous one
      if (previousStatus !== currentStatus) {
        if (currentStatus === 'ACTIVE') growth[date].active++;
        if (currentStatus === 'LOST') growth[date].lost++;
        if (currentStatus === 'BROKEN') growth[date].broken++;
      }

      // Update the last known status for this backlink on this date
      backlinkStatusByDate[date][record.backlink.id] = currentStatus;
    }

    return growth;
  }
}