'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { KeywordData } from '../types';
import { formatNumber } from '@/lib/utils';

interface KeywordAnalysisSectionProps {
  projectId: string;
  keywords: KeywordData[];
  onKeywordsUpdate: (keywords: KeywordData[]) => void;
}

export function KeywordAnalysisSection({
  projectId,
  keywords,
  onKeywordsUpdate,
}: KeywordAnalysisSectionProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeKeywords = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/keywords/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: keywords.map(k => k.keyword),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze keywords');
      }

      const analyzedKeywords: KeywordData[] = await response.json();
      onKeywordsUpdate(analyzedKeywords);

      toast({
        description: `Analyzed ${analyzedKeywords.length} keywords`,
      });
    } catch (error) {
      console.error('Failed to analyze keywords:', error);
      toast({
        variant: 'destructive',
        description: 'Failed to analyze keywords',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const volumeRanges = [
    { min: 0, max: 100, label: '0-100' },
    { min: 101, max: 1000, label: '101-1K' },
    { min: 1001, max: 10000, label: '1K-10K' },
    { min: 10001, max: Infinity, label: '10K+' },
  ];

  const getVolumeDistribution = () => {
    const distribution = volumeRanges.map(range => ({
      range: range.label,
      count: keywords.filter(k => 
        k.searchVolume >= range.min && 
        k.searchVolume <= range.max
      ).length,
    }));
    return distribution;
  };

  const getDifficultyDistribution = () => {
    const ranges = [
      { min: 0, max: 20, label: 'Very Easy' },
      { min: 21, max: 40, label: 'Easy' },
      { min: 41, max: 60, label: 'Medium' },
      { min: 61, max: 80, label: 'Hard' },
      { min: 81, max: 100, label: 'Very Hard' },
    ];

    return ranges.map(range => ({
      range: range.label,
      count: keywords.filter(k => 
        k.difficulty >= range.min && 
        k.difficulty <= range.max
      ).length,
    }));
  };

  const getTopKeywordsByVolume = () => {
    return [...keywords]
      .sort((a, b) => b.searchVolume - a.searchVolume)
      .slice(0, 10);
  };

  const getTopOpportunities = () => {
    return [...keywords]
      .sort((a, b) => {
        const scoreA = (a.searchVolume * (100 - a.difficulty)) / 100;
        const scoreB = (b.searchVolume * (100 - b.difficulty)) / 100;
        return scoreB - scoreA;
      })
      .slice(0, 10);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Volume & Competition Analysis</h2>
          <p className="text-sm text-gray-500">
            Analyze search volume, difficulty, and competition metrics for your keywords.
          </p>
        </div>
        <Button onClick={analyzeKeywords} disabled={isAnalyzing}>
          {isAnalyzing ? 'Analyzing...' : 'Update Analysis'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-md font-medium mb-4">Search Volume Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getVolumeDistribution()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-md font-medium mb-4">Keyword Difficulty Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getDifficultyDistribution()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-md font-medium mb-4">Top Keywords by Volume</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Difficulty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getTopKeywordsByVolume().map((keyword) => (
                  <TableRow key={keyword.id}>
                    <TableCell>{keyword.keyword}</TableCell>
                    <TableCell>{formatNumber(keyword.searchVolume)}</TableCell>
                    <TableCell>{formatNumber(keyword.difficulty)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-md font-medium mb-4">Top Opportunities</h3>
            <p className="text-xs text-gray-500 mb-4">
              Based on volume and ranking difficulty
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Difficulty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getTopOpportunities().map((keyword) => (
                  <TableRow key={keyword.id}>
                    <TableCell>{keyword.keyword}</TableCell>
                    <TableCell>{formatNumber(keyword.searchVolume)}</TableCell>
                    <TableCell>{formatNumber(keyword.difficulty)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}