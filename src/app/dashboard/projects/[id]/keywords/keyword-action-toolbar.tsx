'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { KeywordActionToolbarProps } from './types';

export function KeywordActionToolbar({
  selectedKeywords,
  onAnalyze,
  onAddToGroup,
  onExport,
  onBulkDelete,
}: KeywordActionToolbarProps) {
  const hasSelection = selectedKeywords.length > 0;

  return (
    <div className="flex items-center justify-between space-x-4 pb-4">
      <div className="flex items-center space-x-4">
        <Button 
          variant="secondary"
          onClick={onAnalyze}
          disabled={!hasSelection}
          className="flex items-center gap-2"
        >
          <span role="img" aria-label="analyze">📊</span>
          Analyze
          {hasSelection && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({selectedKeywords.length})
            </span>
          )}
        </Button>

        <Button 
          variant="secondary"
          onClick={onAddToGroup}
          disabled={!hasSelection}
          className="flex items-center gap-2"
        >
          <span role="img" aria-label="group">📁</span>
          Add to Group
        </Button>

        <Button 
          variant="secondary"
          onClick={onExport}
          disabled={!hasSelection}
          className="flex items-center gap-2"
        >
          <span role="img" aria-label="export">📤</span>
          Export
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        {hasSelection && (
          <Button
            variant="ghost"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onBulkDelete}
          >
            <span role="img" aria-label="delete">🗑️</span>
            Delete Selected
          </Button>
        )}
      </div>
    </div>
  );
}