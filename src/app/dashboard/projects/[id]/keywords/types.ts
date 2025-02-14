import { KeywordIntent as PrismaKeywordIntent } from '@prisma/client';

export type KeywordIntent = PrismaKeywordIntent;

export enum KeywordSource {
  BRAINSTORM = 'BRAINSTORM',
  GSC = 'GSC',
  ANALYTICS = 'ANALYTICS',
  COMPETITOR = 'COMPETITOR',
  TOOL = 'TOOL',
  MANUAL = 'MANUAL'
}

export enum ContentStatus {
  NOT_STARTED = 'NOT_STARTED',
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  PUBLISHED = 'PUBLISHED',
  NEEDS_UPDATE = 'NEEDS_UPDATE'
}

export interface SeasonalityData {
  monthly: number[];
  trend: 'up' | 'down' | 'stable';
  peakMonths: number[];
}

export interface TrendData {
  dates: string[];
  values: number[];
}

export type KeywordData = {
  id: string;
  keyword: string;
  intent: KeywordIntent;
  searchVolume: number;
  difficulty: number;
  competition: number;
  cpc: number;
  currentRank: number | null;
  density: number | null;
  priority: number | null;
  notes: string | null;
  lastChecked: Date | null;
  projectId: string;
  position?: number;
  groups: {
    id: string;
    name: string;
  }[];
  source: KeywordSource;
  seasonality?: SeasonalityData;
  serpFeatures: string[];
  contentStatus: ContentStatus;
  contentPriority: number;
  contentType?: string;
  contentBrief?: string;
  clusterName?: string;
  clusterScore?: number;
  parentKeyword?: string;
  trends?: TrendData;
};

export interface ClusterResponse {
  clusters: Array<{
    name: string;
    keywords: string[];
    mainIntent: KeywordIntent;
    score: number;
  }>;
}

export interface FilterCriteria {
  intent?: KeywordIntent[];
  searchVolume?: [number, number];
  difficulty?: [number, number];
  competition?: [number, number];
  position?: [number, number];
  priority?: [number, number];
  search?: string;
  source?: KeywordSource[];
  contentStatus?: ContentStatus[];
}

export const DEFAULT_FILTER_CRITERIA: FilterCriteria = {
  searchVolume: [0, 100000],
  difficulty: [0, 100],
  competition: [0, 100],
  position: [0, 100],
  priority: [0, 10],
  search: '',
};

export interface AnalyzeButtonProps {
  selectedCount: number;
  onAnalyze: () => Promise<void>;
}

export interface PriorityScoreCardProps {
  keywords: KeywordData[];
  title?: string;
  description?: string;
}

export interface KeywordAnalyticsData {
  historicalRankings: {
    date: string;
    position: number;
  }[];
  serpData: {
    position: number;
    url: string;
    title: string;
    features: string[];
  }[];
}

export interface CompetitorGapAnalysisProps {
  projectId: string;
  keywords: KeywordData[];
  onAddKeywords: (keywords: KeywordData[]) => Promise<void>;
}

export interface AddKeywordsDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (keywords: KeywordData[]) => Promise<void>;
}

export interface KeywordDetailsComponentProps {
  keyword: KeywordData;
  onClose: () => void;
  onUpdate: (updates: Partial<KeywordData>) => void;
  historicalData?: Array<{
    date: string;
    position: number;
  }>;
  serpPositions?: Array<{
    position: number;
    url: string;
    title: string;
  }>;
}

export interface KeywordGroupData {
  id: string;
  name: string;
  projectId: string;
  keywords: KeywordData[];
}

export interface KeywordGroupManagerProps {
  projectId: string;
  keywords: KeywordData[];
  onGroupChange: (group: KeywordGroupData) => void;
}

export interface KeywordMetricsGridProps {
  keywords: KeywordData[];
  onSort: (column: keyof KeywordData, direction: 'asc' | 'desc') => void;
  onFilter: (filters: Partial<FilterCriteria>) => void;
  onDelete: (keyword: string) => Promise<void>;
  onKeywordSelect: (keyword: KeywordData | null) => void;
}

export interface KeywordActionToolbarProps {
  selectedKeywords: KeywordData[];
  onBulkDelete: () => void;
  onBulkExport: (format: 'csv' | 'xlsx') => void;
  onAddToGroup: (groupId: string) => void;
  onAnalyze: () => void;
  onExport: (format: 'csv' | 'xlsx') => void;
}

export interface KeywordTableProps {
  keywords: KeywordData[];
  onKeywordDelete: (keyword: string) => void;
  onSortChange?: (columnKey: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface KeywordSectionProps {
  projectId: string;
  keywords: KeywordData[];
  onKeywordsUpdate: (keywords: KeywordData[]) => void;
}

export type KeywordMetric = 
  | 'searchVolume'
  | 'difficulty'
  | 'competition'
  | 'cpc'
  | 'position'
  | 'density'
  | 'priority';

export const metricLabels: Record<KeywordMetric, string> = {
  searchVolume: 'Search Volume',
  difficulty: 'Difficulty',
  competition: 'Competition',
  cpc: 'CPC',
  position: 'Position',
  density: 'Density',
  priority: 'Priority'
};