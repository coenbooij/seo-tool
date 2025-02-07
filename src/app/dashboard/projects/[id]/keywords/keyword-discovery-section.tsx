'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { KeywordData } from './types';
import { useToast } from '@/components/ui/use-toast';

export default function KeywordDiscoverySection({ projectId }: { projectId: string }) {
  const [seedKeyword, setSeedKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<KeywordData[]>([]);
  const { toast } = useToast();

  const handleResearch = async () => {
    if (!seedKeyword.trim()) {
      toast({
        title: 'Input required',
        description: 'Please enter a seed keyword to start research',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/keywords/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          seedKeyword,
        }),
      });

      if (!response.ok) throw new Error('Research request failed');

      const data = await response.json();
      setSuggestions(data.suggestions);
      
      toast({
        title: 'Research complete',
        description: `Found ${data.suggestions.length} keyword suggestions`,
      });
    } catch {
      toast({
        title: 'Research failed',
        description: 'Failed to fetch keyword suggestions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrack = async (keyword: KeywordData) => {
    try {
      await fetch(`/api/projects/${projectId}/keywords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(keyword),
      });

      toast({
        title: 'Keyword added',
        description: `Now tracking &ldquo;${keyword.keyword}&rdquo;`,
      });
    } catch {
      toast({
        title: 'Failed to add keyword',
        description: 'Could not add keyword to tracking',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Discover Keywords</h3>
          <p className="text-sm text-muted-foreground">
            Enter a seed keyword to discover related keywords and opportunities
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter a seed keyword..."
              value={seedKeyword}
              onChange={(e) => setSeedKeyword(e.target.value)}
              className="max-w-sm"
            />
            <Button
              onClick={handleResearch}
              disabled={isLoading}
            >
              {isLoading ? 'Researching...' : 'Research'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Suggestions</h3>
            <p className="text-sm text-muted-foreground">
              Click &ldquo;Track&rdquo; to start monitoring a keyword
            </p>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {suggestions.map((keyword) => (
                <div
                  key={keyword.keyword}
                  className="flex items-center justify-between py-4"
                >
                  <div>
                    <p className="font-medium">{keyword.keyword}</p>
                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{keyword.searchVolume.toLocaleString()} searches/mo</span>
                      <span>Competition: {(keyword.competition * 100).toFixed(0)}%</span>
                      <span>CPC: ${keyword.cpc.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleTrack(keyword)}
                  >
                    Track
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}