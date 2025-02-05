export interface Issue {
  type: 'error' | 'warning'
  message: string
  impact: 'high' | 'medium' | 'low'
}

export interface AnalyzerResult {
  score: number
  issues: Issue[]
}

export interface Analyzer {
  analyze(html: string, url: string): Promise<ContentMetrics | PerformanceMetrics | TechnicalMetrics | MobileMetrics | SecurityMetrics>
  getAnalysis(result: ContentMetrics | PerformanceMetrics | TechnicalMetrics | MobileMetrics | SecurityMetrics): AnalyzerResult
}

export interface MetaTag {
  name?: string
  property?: string
  content?: string
}

export interface ContentMetrics {
  title: string | null
  titleLength: number
  description: string | null
  descriptionLength: number
  h1Count: number
  h1Tags: string[]
  h2Count: number
  h2Tags: string[]
  imageCount: number
  imagesWithoutAlt: number
  wordCount: number
  hasCanonical: boolean
  hasRobots: boolean
  hasViewport: boolean
  hasSchema: boolean
  metaTags: MetaTag[]
}

export interface PerformanceMetrics {
  loadTime: number
  resourceSize: number
  requestCount: number
  fcp: number
  lcp: number
  cls: number
  tbt: number
  speedIndex: number
  tti: number
}

export interface TechnicalMetrics {
  hasSSL: boolean
  hasSitemap: boolean
  hasRobotsTxt: boolean
  serverResponse: number
  hasGzip: boolean
  hasBrotli: boolean
  hasCaching: boolean
  hasMinification: boolean
}

export interface MobileMetrics {
  isMobileFriendly: boolean
  hasMobileViewport: boolean
  hasResponsiveDesign: boolean
  touchTargetSize: boolean
  fontSize: boolean
  contentWidth: boolean
}

export interface SecurityMetrics {
  hasHttps: boolean
  hasMixedContent: boolean
  hasSecurityHeaders: boolean
  hasXssProtection: boolean
  hasContentSecurityPolicy: boolean
  hasStrictTransportSecurity: boolean
}

export interface PageSpeed {
  score: number
  metrics: PerformanceMetrics
  opportunities: Issue[]
}

export interface TechnicalSEO {
  score: number
  metrics: TechnicalMetrics
  issues: Issue[]
}

export interface MobileOptimization {
  score: number
  metrics: MobileMetrics
  issues: Issue[]
}

export interface SecurityChecks {
  score: number
  metrics: SecurityMetrics
  issues: Issue[]
}

export interface CrawlResult {
  url: string
  timestamp: string
  content: ContentMetrics
  performance: PerformanceMetrics
  technical: TechnicalMetrics
  mobile: MobileMetrics
  security: SecurityMetrics
  score: number
  issues: Issue[]
}