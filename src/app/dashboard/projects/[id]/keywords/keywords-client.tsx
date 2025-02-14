'use client';

import { useState } from 'react';
import { KeywordData } from './types';
import { KeywordWorkflowTabs } from './keyword-workflow-tabs';
import { AddKeywordsDialog } from './add-keywords-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PriorityScoreCard } from './priority-score-card';
import { Card } from '@/components/ui/card';

interface KeywordsClientProps {
  projectId: string;
  initialKeywords?: KeywordData[];
}

export function KeywordsClient({ projectId, initialKeywords = [] }: KeywordsClientProps) {
  const [keywords, setKeywords] = useState<KeywordData[]>(initialKeywords);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddKeywords = async (newKeywords: KeywordData[]) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: newKeywords,
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
    } catch (error) {
      console.error('Failed to add keywords:', error);
      toast({
        variant: 'destructive',
        description: 'Failed to add keywords',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Keyword Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Optimize your SEO strategy with our comprehensive keyword workflow
            </p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="hover:bg-indigo-400 bg-indigo-600 text-white"
          >
            Add Keywords
          </Button>
        </div>

        <PriorityScoreCard
          keywords={keywords}
          description="Analyze your keyword portfolio performance"
        />
      </Card>

      <div className="grid gap-6">
        <Card className="bg-white p-6">
          <KeywordWorkflowTabs
            projectId={projectId}
            keywords={keywords}
            onKeywordsChange={setKeywords}
          />
        </Card>
      </div>

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