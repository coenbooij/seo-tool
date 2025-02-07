'use client';

import { KeywordData } from '@/lib/db/keywords';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';

export interface KeywordTableProps {
  keywords: KeywordData[];
  onKeywordDelete: (keyword: string) => void;
  onSortChange?: (columnKey: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

export function KeywordTable({
  keywords,
  onKeywordDelete,
  onSortChange,
  sortColumn,
  sortDirection,
}: KeywordTableProps) {
  const handleSort = (columnKey: string) => {
    if (onSortChange) {
      onSortChange(columnKey);
    }
  };

  const getSortIndicator = (columnKey: string) => {
    if (columnKey !== sortColumn) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead onClick={() => handleSort('keyword')} className="cursor-pointer">
            Keyword {getSortIndicator('keyword')}
          </TableHead>
          <TableHead onClick={() => handleSort('intent')} className="cursor-pointer">
            Intent {getSortIndicator('intent')}
          </TableHead>
          <TableHead onClick={() => handleSort('searchVolume')} className="cursor-pointer">
            Volume {getSortIndicator('searchVolume')}
          </TableHead>
          <TableHead onClick={() => handleSort('difficulty')} className="cursor-pointer">
            Difficulty {getSortIndicator('difficulty')}
          </TableHead>
          <TableHead onClick={() => handleSort('competition')} className="cursor-pointer">
            Competition {getSortIndicator('competition')}
          </TableHead>
          <TableHead onClick={() => handleSort('cpc')} className="cursor-pointer">
            CPC {getSortIndicator('cpc')}
          </TableHead>
          <TableHead onClick={() => handleSort('currentRank')} className="cursor-pointer">
            Rank {getSortIndicator('currentRank')}
          </TableHead>
          <TableHead onClick={() => handleSort('density')} className="cursor-pointer">
            Density {getSortIndicator('density')}
          </TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keywords.map((keyword) => (
          <TableRow key={keyword.keyword}>
            <TableCell>{keyword.keyword}</TableCell>
            <TableCell className="capitalize">{keyword.intent}</TableCell>
            <TableCell>{formatNumber(keyword.searchVolume)}</TableCell>
            <TableCell>{formatNumber(keyword.difficulty)}</TableCell>
            <TableCell>{formatNumber(keyword.competition)}%</TableCell>
            <TableCell>${formatNumber(keyword.cpc)}</TableCell>
            <TableCell>{keyword.currentRank || '-'}</TableCell>
            <TableCell>{keyword.density ? `${formatNumber(keyword.density)}%` : '-'}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onKeywordDelete(keyword.keyword)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}