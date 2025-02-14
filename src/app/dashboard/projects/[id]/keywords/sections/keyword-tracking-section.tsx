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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { KeywordData } from '../types';

interface KeywordTrackingSectionProps {
  projectId: string;
  keywords: KeywordData[];
  onKeywordsUpdate: (keywords: KeywordData[]) => void;
}

interface RankingData {
  date: string;
  position: number;
}

interface KeywordRankings {
  [keywordId: string]: RankingData[];
}

export function KeywordTrackingSection({
  projectId,
  keywords,
  onKeywordsUpdate,
}: KeywordTrackingSectionProps) {
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rankingHistory, setRankingHistory] = useState<KeywordRankings>({});
  const { toast } = useToast();

  const fetchRankingHistory = async (keyword: KeywordData) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/keywords/${keyword.id}/history`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch ranking history');
      }

      const data = await response.json();
      setRankingHistory(prev => ({
        ...prev,
        [keyword.id]: data.history,
      }));
      setSelectedKeyword(keyword);
    } catch (error) {
      console.error('Failed to fetch ranking history:', error);
      toast({
        variant: 'destructive',
        description: 'Failed to fetch ranking history',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkRankings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/keywords/check`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to check rankings');
      }

      const updatedKeywords = await response.json();
      onKeywordsUpdate(updatedKeywords);

      toast({
        description: 'Rankings updated successfully',
      });
    } catch (error) {
      console.error('Failed to check rankings:', error);
      toast({
        variant: 'destructive',
        description: 'Failed to check rankings',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRankingChange = (keyword: KeywordData) => {
    const history = rankingHistory[keyword.id];
    if (!history || history.length < 2) return 0;
    return history[0].position - history[history.length - 1].position;
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) return '↑';
    if (change < 0) return '↓';
    return '–';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Rankings & Performance</h2>
          <p className="text-sm text-gray-500">
            Track keyword rankings and measure performance over time.
          </p>
        </div>
        <Button onClick={checkRankings} disabled={isLoading}>
          {isLoading ? 'Checking...' : 'Update Rankings'}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">All Keywords</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {keywords.map((keyword) => {
                  const change = getRankingChange(keyword);
                  return (
                    <div
                      key={keyword.id}
                      className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                        selectedKeyword?.id === keyword.id ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => fetchRankingHistory(keyword)}
                    >
                      <div className="font-medium">{keyword.keyword}</div>
                      <div className="text-xs text-gray-500">
                        Position: {keyword.currentRank || 'N/A'}{' '}
                        <span className={change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : ''}>
                          {getChangeIndicator(change)} {Math.abs(change) || ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2">
          {selectedKeyword && rankingHistory[selectedKeyword.id] ? (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">
                  Ranking History: {selectedKeyword.keyword}
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rankingHistory[selectedKeyword.id]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis reversed domain={[1, 100]} />
                      <Tooltip
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value: number) => [`Position ${value}`, 'Ranking']}
                      />
                      <Line
                        type="monotone"
                        dataKey="position"
                        stroke="#4f46e5"
                        dot={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <Table className="mt-6">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankingHistory[selectedKeyword.id].map((entry, index, arr) => {
                      const change = index < arr.length - 1 
                        ? arr[index + 1].position - entry.position
                        : 0;
                      return (
                        <TableRow key={entry.date}>
                          <TableCell>
                            {new Date(entry.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{entry.position}</TableCell>
                          <TableCell>
                            <span className={
                              change > 0 ? 'text-red-500' : 
                              change < 0 ? 'text-green-500' : ''
                            }>
                              {change ? getChangeIndicator(-change) : '–'} {Math.abs(change) || ''}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-gray-500">
                Select a keyword to view ranking history
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}