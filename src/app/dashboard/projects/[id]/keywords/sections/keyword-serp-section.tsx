'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { KeywordData } from '../types';

interface KeywordSerpSectionProps {
  projectId: string;
  keywords: KeywordData[];
  onKeywordsUpdate: (keywords: KeywordData[]) => void;
}

interface SerpResult {
  keyword: string;
  url: string;
  title: string;
  description: string;
  features: string[];
  position: number;
}

export function KeywordSerpSection({
  projectId,
  keywords,
  onKeywordsUpdate,
}: KeywordSerpSectionProps) {
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordData | null>(null);
  const [serpResults, setSerpResults] = useState<SerpResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const analyzeSerpFeatures = async (keyword: KeywordData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/keywords/serp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.keyword }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch SERP data');
      }

      const data = await response.json();
      setSerpResults(data.results);
      setSelectedKeyword(keyword);

      // Update keyword with SERP features
      const updatedKeyword = {
        ...keyword,
        serpFeatures: data.features,
      };

      onKeywordsUpdate(
        keywords.map(k => (k.id === keyword.id ? updatedKeyword : k))
      );

      toast({
        description: 'SERP analysis completed',
      });
    } catch (error) {
      console.error('Failed to analyze SERP:', error);
      toast({
        variant: 'destructive',
        description: 'Failed to analyze SERP results',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFeatureFrequency = () => {
    const features = new Map<string, number>();
    keywords.forEach(keyword => {
      keyword.serpFeatures?.forEach(feature => {
        features.set(feature, (features.get(feature) || 0) + 1);
      });
    });
    return Array.from(features.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([feature, count]) => ({ feature, count }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">SERP Analysis</h2>
        <p className="text-sm text-gray-500 mb-4">
          Analyze search engine results and SERP features for your keywords.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Keywords</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {keywords.map((keyword) => (
                  <div
                    key={keyword.id}
                    className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                      selectedKeyword?.id === keyword.id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => analyzeSerpFeatures(keyword)}
                  >
                    <div className="font-medium">{keyword.keyword}</div>
                    {keyword.serpFeatures && keyword.serpFeatures.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Features: {keyword.serpFeatures.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2">
          {selectedKeyword ? (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">SERP Results for &quot;{selectedKeyword.keyword}&quot;</h3>
                  {isLoading ? (
                    <div className="text-center py-4">Loading SERP data...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Position</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead>Features</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {serpResults.map((result) => (
                          <TableRow key={result.url}>
                            <TableCell>{result.position}</TableCell>
                            <TableCell>{result.title}</TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {result.url}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {result.features.map((feature) => (
                                  <span
                                    key={feature}
                                    className="px-2 py-1 text-xs bg-gray-100 rounded"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">SERP Feature Analysis</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Feature</TableHead>
                        <TableHead>Frequency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFeatureFrequency().map(({ feature, count }) => (
                        <TableRow key={feature}>
                          <TableCell>{feature}</TableCell>
                          <TableCell>{count} keywords</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-gray-500">
                Select a keyword to analyze SERP results
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}