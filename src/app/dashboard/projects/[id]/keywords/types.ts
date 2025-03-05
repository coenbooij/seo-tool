import { KeywordIntent } from '@prisma/client';

export enum KeywordSource {
  MANUAL = 'MANUAL',
  IMPORTED = 'IMPORTED',
  SUGGESTED = 'SUGGESTED',
  BRAINSTORM = 'BRAINSTORM'
}

export interface KeywordData {
  // Required core properties
  id: string;
  keyword: string;
  intent: KeywordIntent;
  searchVolume: number;
  currentRank: number | null;
  bestRank?: number | null;
  projectId: string;
  
  // Optional analysis and metadata properties
  difficulty?: number;
  priority?: number;
  density?: number;
  competition?: number;
  cpc?: number;
  
  // Optional content-related properties
  contentStatus?: ContentStatus;
  contentPriority?: number;
  notes?: string | null;
  
  // Optional organizational properties
  groups?: string[];
  source?: KeywordSource;
  serpFeatures?: string[];
  lastChecked?: Date;
}

export enum ContentStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface AddKeywordsDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (keywords: KeywordData[]) => Promise<void>;
}

export interface KeywordTableProps {
  keywords: KeywordData[];
  onKeywordDelete: (keywordId: string) => void;
  onSortChange?: (columnKey: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}
