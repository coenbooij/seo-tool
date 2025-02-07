'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeywordData, FilterCriteria } from './types';
import { cn } from '@/lib/utils';

interface Props {
  keywords: KeywordData[];
  onSort: (column: keyof KeywordData, direction: 'asc' | 'desc') => void;
  onFilter: (filters: Partial<FilterCriteria>) => void;
  onDelete: (keyword: string) => Promise<void>;
  onKeywordSelect: (keyword: KeywordData | null) => void;
}

type ColumnConfig = {
  key: keyof KeywordData;
  label: string;
  align?: 'left' | 'right';
  format?: (value: KeywordData[keyof KeywordData]) => string;
};

export function KeywordMetricsGrid({
  keywords,
  onSort,
  onFilter,
  onDelete,
  onKeywordSelect,
}: Props) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortColumn, setSortColumn] = React.useState<keyof KeywordData | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    onFilter({ search: term });
  };

  const handleSort = (column: keyof KeywordData) => {
    setSortColumn(column);
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);
    onSort(column, newDirection);
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getIntentColor = (intent: string) => {
    switch (intent.toLowerCase()) {
      case 'transactional':
        return 'text-green-600';
      case 'informational':
        return 'text-blue-600';
      case 'navigational':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const metricsColumns: ColumnConfig[] = [
    { key: 'keyword', label: 'Keyword' },
    { key: 'intent', label: 'Intent' },
    { 
      key: 'searchVolume',
      label: 'Search Volume',
      align: 'right',
      format: (value) => {
        if (typeof value === 'number') {
          return value.toLocaleString();
        }
        return '0';
      }
    },
    { 
      key: 'competition',
      label: 'Competition',
      align: 'right',
      format: (value) => {
        if (typeof value === 'number') {
          return `${(value * 100).toFixed(0)}%`;
        }
        return '0%';
      }
    },
    { 
      key: 'cpc',
      label: 'CPC',
      align: 'right',
      format: (value) => {
        if (typeof value === 'number') {
          return `$${value.toFixed(2)}`;
        }
        return '$0.00';
      }
    },
    { 
      key: 'position',
      label: 'Position',
      align: 'right',
      format: (value) => {
        if (typeof value === 'number') {
          return value.toString();
        }
        return '—';
      }
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search keywords..."
          value={searchTerm}
          onChange={handleSearch}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {metricsColumns.map(({ key, label, align }) => (
                <TableHead 
                  key={key}
                  className={cn(align === 'right' && 'text-right')}
                >
                  <Button
                    variant="ghost"
                    onClick={() => handleSort(key)}
                    className="font-semibold"
                  >
                    {label} {getSortIcon(key)}
                  </Button>
                </TableHead>
              ))}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywords.map((keyword) => (
              <TableRow
                key={keyword.keyword}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onKeywordSelect(keyword)}
              >
                {metricsColumns.map(({ key, align, format }) => {
                  const value = keyword[key];
                  return (
                    <TableCell 
                      key={key}
                      className={cn(
                        key === 'keyword' && 'font-medium',
                        key === 'intent' && getIntentColor(String(keyword.intent)),
                        align === 'right' && 'text-right'
                      )}
                    >
                      {format ? format(value) : String(value)}
                    </TableCell>
                  );
                })}
                <TableCell>
                  <Button
                    variant="ghost"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await onDelete(keyword.keyword);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {keywords.length === 0 && (
              <TableRow>
                <TableCell 
                  colSpan={metricsColumns.length + 1} 
                  className="text-center py-8 text-muted-foreground"
                >
                  No keywords found. Try adjusting your search or add new keywords.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}