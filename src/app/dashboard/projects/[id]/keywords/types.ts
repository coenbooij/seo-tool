import { KeywordIntent } from '@prisma/client';

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
};

export interface FilterCriteria {
  intent?: KeywordIntent[];
  searchVolume?: [number, number];
  difficulty?: [number, number];
  competition?: [number, number];
  position?: [number, number];
  priority?: [number, number];
  search?: string;
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
  }[];
}

export interface CompetitorGapAnalysisProps {
  keywords: KeywordData[];
  onAddKeywords: (keywords: string[]) => Promise<void>;
}

export interface AddKeywordsDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (keywords: string[]) => Promise<void>;
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
  selectedKeywords: Set<string>;
  onKeywordSelect: (keyword: KeywordData | null) => void;
  onKeywordDelete: (keyword: string) => Promise<void>;
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