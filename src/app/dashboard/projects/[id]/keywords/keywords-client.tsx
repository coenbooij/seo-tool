'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { KeywordData } from './types';
import { KeywordTable } from './keyword-table';
import { KeywordGroupManager } from './keyword-group-manager';
import { AddKeywordsDialog } from './add-keywords-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { KeywordMetricsGrid } from './keyword-metrics-grid';
import KeywordDiscoverySection from './keyword-discovery-section';
import { KeywordDetailsPanel } from './keyword-details-panel';
import { CompetitorGapAnalysis } from './competitor-gap-analysis';
import { PriorityScoreCard } from './priority-score-card';
import { KeywordActionToolbar } from './keyword-action-toolbar';
import { AnalyzeButton } from './analyze-button';

interface KeywordsClientProps {
  projectId: string;
  initialKeywords?: KeywordData[];
}

export function KeywordsClient({ projectId, initialKeywords = [] }: KeywordsClientProps) {
  const [keywords, setKeywords] = useState<KeywordData[]>(initialKeywords);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordData | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddKeywords = async (newKeywords: string[]) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: newKeywords.map(keyword => ({
            keyword,
            intent: 'INFORMATIONAL',
            searchVolume: 0,
            difficulty: 0,
            competition: 0,
            cpc: 0,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add keywords');
      }

      const addedKeywords: KeywordData[] = await response.json();
      setKeywords([...keywords, ...addedKeywords]);
      toast({
        description: `Added ${newKeywords.length} keywords`,
      });
      setIsAddDialogOpen(false);
    } catch {
      toast({
        description: 'Failed to add keywords',
        variant: 'destructive',
      });
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

      setKeywords(keywords.filter(k => k.keyword !== keywordToDelete));
      if (selectedKeyword?.keyword === keywordToDelete) {
        setSelectedKeyword(null);
      }
      setSelectedKeywords(prev => {
        const next = new Set(prev);
        next.delete(keywordToDelete);
        return next;
      });

      toast({
        description: 'Keyword deleted successfully',
      });
    } catch {
      toast({
        description: 'Failed to delete keyword',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedKeywords).map(keyword =>
        fetch(`/api/projects/${projectId}/keywords?keyword=${encodeURIComponent(keyword)}`, {
          method: 'DELETE',
        })
      );
      await Promise.all(deletePromises);

      setKeywords(keywords.filter(k => !selectedKeywords.has(k.keyword)));
      setSelectedKeywords(new Set());
      
      toast({
        description: `Deleted ${selectedKeywords.size} keywords`,
      });
    } catch {
      toast({
        description: 'Failed to delete keywords',
        variant: 'destructive',
      });
    }
  };

  const handleAnalyze = async () => {
    try {
      const selectedData = keywords.filter(k => selectedKeywords.has(k.keyword));
      const response = await fetch(`/api/projects/${projectId}/keywords/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: selectedData.map(k => k.keyword) }),
      });

      if (!response.ok) throw new Error('Failed to analyze keywords');

      const updatedKeywords = await response.json();
      setKeywords(prev =>
        prev.map(k => {
          const updated = updatedKeywords.find((u: KeywordData) => u.keyword === k.keyword);
          return updated || k;
        })
      );

      toast({
        description: `Analyzed ${selectedData.length} keywords`,
      });
    } catch {
      toast({
        description: 'Failed to analyze keywords',
        variant: 'destructive',
      });
    }
  };

  const handleSortChange = (column: keyof KeywordData, direction: 'asc' | 'desc') => {
    const sorted = [...keywords].sort((a, b) => {
      if (a[column] === null) return 1;
      if (b[column] === null) return -1;
      if (a[column]! < b[column]!) return direction === 'asc' ? -1 : 1;
      if (a[column]! > b[column]!) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setKeywords(sorted);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Keyword Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            Add Keywords
          </Button>
          <AnalyzeButton 
            selectedCount={selectedKeywords.size}
            onAnalyze={handleAnalyze}
          />
        </div>
      </div>

      <PriorityScoreCard
        keywords={keywords}
        title="Keywords Overview"
        description="Overall keyword performance metrics"
      />

      <KeywordActionToolbar
        selectedKeywords={keywords.filter(k => selectedKeywords.has(k.keyword))}
        onBulkDelete={handleBulkDelete}
        onBulkExport={(format) => console.log('Exporting', format)}
        onAddToGroup={(groupId) => {
          console.log('Adding to group', groupId);
        }}
        onAnalyze={handleAnalyze}
        onExport={(format) => console.log('Exporting', format)}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <KeywordMetricsGrid 
            keywords={keywords}
            onSort={handleSortChange}
            onFilter={() => {}}
            onDelete={handleKeywordDelete}
            onKeywordSelect={setSelectedKeyword}
          />

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <KeywordTable
                keywords={keywords}
                selectedKeywords={selectedKeywords}
                onKeywordSelect={(k) => setSelectedKeyword(k)}
                onKeywordDelete={handleKeywordDelete}
              />
            </div>
            <div>
              {selectedKeyword && (
                <Card>
                  <CardContent className="p-4">
                    <KeywordDetailsPanel
                      keyword={selectedKeyword}
                      onUpdate={(data) => {
                        setKeywords(prev =>
                          prev.map(k =>
                            k.id === selectedKeyword.id
                              ? { ...k, ...data }
                              : k
                          )
                        );
                      }}
                      onClose={() => setSelectedKeyword(null)}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="research">
          <KeywordDiscoverySection
            projectId={projectId}
          />
        </TabsContent>

        <TabsContent value="competitors">
          <CompetitorGapAnalysis
            projectId={projectId}
            keywords={keywords}
            onAddKeywords={handleAddKeywords}
          />
        </TabsContent>

        <TabsContent value="groups">
          <KeywordGroupManager
            projectId={projectId}
            keywords={keywords}
            onGroupChange={(group) => {
              setKeywords(prevKeywords =>
                prevKeywords.map(k =>
                  group.keywords.some(gk => gk.keyword === k.keyword)
                    ? { ...k }
                    : k
                )
              );
            }}
          />
        </TabsContent>
      </Tabs>

      {isAddDialogOpen && (
        <AddKeywordsDialog
          open={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={handleAddKeywords}
        />
      )}
    </div>
  );
}