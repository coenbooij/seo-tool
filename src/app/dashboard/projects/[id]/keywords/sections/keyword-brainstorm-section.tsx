'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { KeywordData, KeywordSource, ContentStatus } from '../types';
import { KeywordIntent } from '@prisma/client';

interface KeywordBrainstormSectionProps {
  projectId: string;
  keywords: KeywordData[];
  onKeywordsAdd: (keywords: KeywordData[]) => void;
}

export function KeywordBrainstormSection({
  projectId,
  keywords,
  onKeywordsAdd
}: KeywordBrainstormSectionProps) {
  const [brainstormText, setBrainstormText] = useState('');
  const { toast } = useToast();

  const handleAddKeywords = async () => {
    try {
      const keywordList = brainstormText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const newKeywords: KeywordData[] = keywordList.map(keyword => ({
        id: `temp-${Date.now()}-${Math.random()}`,
        keyword,
        intent: KeywordIntent.INFORMATIONAL,
        searchVolume: 0,
        difficulty: 0,
        competition: 0,
        cpc: 0,
        currentRank: null,
        density: null,
        priority: null,
        notes: null,
        lastChecked: null,
        projectId,
        source: KeywordSource.BRAINSTORM,
        serpFeatures: [],
        contentStatus: ContentStatus.NOT_STARTED,
        contentPriority: 0,
        groups: [],
      }));

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

      const savedKeywords: KeywordData[] = await response.json();
      onKeywordsAdd(savedKeywords);
      setBrainstormText('');
      
      toast({
        description: `Added ${savedKeywords.length} keywords`,
      });
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
      <div>
        <h2 className="text-lg font-semibold mb-2">Brainstorm & Seed Keywords</h2>
        <p className="text-sm text-gray-500 mb-4">
          Enter your initial list of keywords. Include variations and related terms that your target audience might use.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="p-4">
          <h3 className="font-medium mb-2">Tips for Brainstorming</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Think about how customers describe your products/services</li>
            <li>Include common questions and pain points</li>
            <li>Consider different stages of the buyer journey</li>
            <li>Add variations (singular/plural, synonyms)</li>
          </ul>
        </Card>

        <div className="space-y-4">
          <Textarea
            placeholder="Enter keywords (one per line)"
            value={brainstormText}
            onChange={(e) => setBrainstormText(e.target.value)}
            rows={10}
          />
          <Button 
            onClick={handleAddKeywords}
            disabled={!brainstormText.trim()}
          >
            Add Keywords
          </Button>
        </div>

        {keywords.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Added Brainstorm Keywords</h3>
            <ul className="text-sm space-y-1">
              {keywords.map((k) => (
                <li key={k.id} className="text-gray-600">
                  {k.keyword}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}