'use client';

import { Card } from '@/components/ui/card';
import { KeywordData } from './types';

interface PriorityScoreCardProps {
  keywords: KeywordData[];
  description?: string;
}

export function PriorityScoreCard({
  keywords,
  description,
}: PriorityScoreCardProps) {
  const stats = {
    total: keywords.length,
    ranking: keywords.filter(k => k.currentRank !== null && k.currentRank > 0).length,
    topTen: keywords.filter(k => k.currentRank !== null && k.currentRank <= 10).length,
    avgPosition: keywords
      .filter(k => k.currentRank !== null && k.currentRank > 0)
      .reduce((acc, k) => acc + (k.currentRank || 0), 0) / keywords.length || 0,
  };

  const metrics = [
    {
      name: 'Total Keywords',
      value: stats.total,
      description: 'Total number of tracked keywords',
      trend: 'neutral',
    },
    {
      name: 'Ranking Keywords',
      value: stats.ranking,
      description: 'Keywords with active rankings',
      trend: 'up',
    },
    {
      name: 'Top 10 Rankings',
      value: stats.topTen,
      description: 'Keywords ranking in top 10',
      trend: 'up',
    },
    {
      name: 'Average Position',
      value: stats.avgPosition.toFixed(1),
      description: 'Average ranking position',
      trend: stats.avgPosition <= 10 ? 'up' : 'down',
    },
  ];

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '–';
    }
  };

  return (
    <div className="space-y-4">
      {description && <p className="text-sm text-gray-500">{description}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.name} className="p-4 bg-white border shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{metric.name}</p>
                <h3 className="text-2xl font-bold mt-1">{metric.value}</h3>
              </div>
              <span className={`${getTrendColor(metric.trend)} text-lg font-medium`}>
                {getTrendIcon(metric.trend)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}