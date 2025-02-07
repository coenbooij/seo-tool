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

export interface ContentMetrics {
  avgScore: number;
  change: number;
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  wordCount: number;
  h1Count: number;
  h2Count: number;
  imageCount: number;
  imagesWithoutAlt: number;
  hasCanonical: boolean;
  hasRobots: boolean;
  hasViewport: boolean;
  hasSchema: boolean;
}