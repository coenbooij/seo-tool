'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { KeywordData, KeywordSource } from '../types';
import { KeywordTable } from '../keyword-table';

interface KeywordDataSectionProps {
  projectId: string;
  keywords: KeywordData[];
  onKeywordsUpdate: (keywords: KeywordData[]) => void;
}

export function KeywordDataSection({
  projectId,
  keywords,
  onKeywordsUpdate
}: KeywordDataSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>('keyword');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();

  const importFromGSC = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/keywords/research/gsc`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to import GSC data');
      }

      const importedKeywords: KeywordData[] = await response.json();
      const existingKeywords = new Set(keywords.map(k => k.keyword.toLowerCase()));
      const newKeywords = importedKeywords.filter(k => !existingKeywords.has(k.keyword.toLowerCase()));
      
      onKeywordsUpdate([...keywords, ...newKeywords]);
      
      toast({
        description: `Imported ${newKeywords.length} new keywords from Google Search Console`,
      });
    } catch (error) {
      console.error('Failed to import GSC data:', error);
      toast({
        variant: 'destructive',
        description: 'Failed to import data from Google Search Console',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const importFromGA = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/keywords/research/ga`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to import GA data');
      }

      const importedKeywords: KeywordData[] = await response.json();
      const existingKeywords = new Set(keywords.map(k => k.keyword.toLowerCase()));
      const newKeywords = importedKeywords.filter(k => !existingKeywords.has(k.keyword.toLowerCase()));
      
      onKeywordsUpdate([...keywords, ...newKeywords]);
      
      toast({
        description: `Imported ${newKeywords.length} new keywords from Google Analytics`,
      });
    } catch (error) {
      console.error('Failed to import GA data:', error);
      toast({
        variant: 'destructive',
        description: 'Failed to import data from Google Analytics',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeywordDelete = async (keywordToDelete: string) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/keywords?keyword=${encodeURIComponent(keywordToDelete)}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete keyword');
      }

      onKeywordsUpdate(keywords.filter(k => k.keyword !== keywordToDelete));

      toast({
        description: 'Keyword deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete keyword:', error);
      toast({
        variant: 'destructive',
        description: 'Failed to delete keyword',
      });
    }
  };

  const handleSortChange = (column: string) => {
    if (column === sortColumn) {
      setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filterKeywordsBySource = (source: KeywordSource) => {
    return keywords.filter(k => k.source === source);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Data Collection</h2>
        <p className="text-sm text-gray-500 mb-4">
          Import keyword data from Google Search Console, Analytics, and other sources.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="font-medium mb-2">Google Search Console</h3>
          <p className="text-sm text-gray-600 mb-4">
            Import query data including impressions, clicks, and average position.
          </p>
          <Button onClick={importFromGSC} disabled={isLoading}>
            {isLoading ? 'Importing...' : 'Import from GSC'}
          </Button>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium mb-2">Google Analytics</h3>
          <p className="text-sm text-gray-600 mb-4">
            Import organic search terms and landing page data.
          </p>
          <Button onClick={importFromGA} disabled={isLoading}>
            {isLoading ? 'Importing...' : 'Import from GA'}
          </Button>
        </Card>
      </div>

      <Tabs defaultValue="gsc" className="w-full">
        <TabsList>
          <TabsTrigger value="gsc">Search Console Data</TabsTrigger>
          <TabsTrigger value="ga">Analytics Data</TabsTrigger>
          <TabsTrigger value="all">All Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="gsc" className="mt-4">
          <KeywordTable
            keywords={filterKeywordsBySource(KeywordSource.GSC)}
            onKeywordDelete={handleKeywordDelete}
            onSortChange={handleSortChange}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
          />
        </TabsContent>

        <TabsContent value="ga" className="mt-4">
          <KeywordTable
            keywords={filterKeywordsBySource(KeywordSource.ANALYTICS)}
            onKeywordDelete={handleKeywordDelete}
            onSortChange={handleSortChange}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
          />
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <KeywordTable
            keywords={keywords}
            onKeywordDelete={handleKeywordDelete}
            onSortChange={handleSortChange}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}