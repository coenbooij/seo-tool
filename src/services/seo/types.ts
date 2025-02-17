export interface Backlink {
  id: string;
  url: string;
  targetUrl: string;
  anchorText: string;
  domainAuthority: number;
  type: string;
  status: string;
  firstSeen: Date;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  authority: number;
}

export interface Issue {
  id?: string;
  description?: string;
  severity?: string;
  type?: string;
  message?: string;
  impact?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MetaTag {
  name?: string;
  property?: string;
  content?: string;
}

export interface ContentMetrics {
  avgScore: number;
  change: number;
  title: string | null;
  titleLength: number;
  description: string | null;
  descriptionLength: number;
  h1Count: number;
  h1Tags: string[];
  h2Count: number;
  h2Tags: string[];
  wordCount: number;
  imageCount: number;
  imagesWithoutAlt: number;
  hasCanonical: boolean;
  hasRobots: boolean;
  hasViewport: boolean;
  hasSchema: boolean;
  metaTags: MetaTag[];
}

export interface AnalyzerResult {
  score: number;
  issues: Issue[];
}

export interface Analyzer {
  analyze(html: string, url: string): Promise<ContentMetrics>;
  getAnalysis(result: ContentMetrics): AnalyzerResult;
}