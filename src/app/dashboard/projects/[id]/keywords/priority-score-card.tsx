'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatNumber } from '@/lib/utils';
import type { PriorityScoreCardProps, KeywordData } from './types';

const PROGRESS_COLORS = {
  low: 'bg-red-500',
  medium: 'bg-yellow-500',
  high: 'bg-green-500',
} as const;

export function PriorityScoreCard({
  keywords,
  title = 'Keyword Performance',
  description = 'Overall keyword performance based on volume, difficulty, and competition',
}: PriorityScoreCardProps) {
  const aggregatedData = aggregateKeywordData(keywords);
  const score = calculateScore(aggregatedData);
  const progressValue = normalizeScore(score, 0, 100);
  const progressColor = getProgressColor(progressValue);

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="text-sm font-medium">Overall Score</div>
          <div className="text-sm text-muted-foreground">
            {formatNumber(score, 1)}/100
          </div>
        </div>
        <Progress
          value={progressValue}
          className={progressColor}
          max={100}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricItem
          label="Avg Search Volume"
          value={formatNumber(aggregatedData.searchVolume)}
        />
        <MetricItem
          label="Avg Difficulty"
          value={`${formatNumber(aggregatedData.difficulty)}%`}
        />
        <MetricItem
          label="Avg Competition"
          value={`${formatNumber(aggregatedData.competition)}%`}
        />
        <MetricItem
          label="Avg CPC"
          value={`$${formatNumber(aggregatedData.cpc, 2)}`}
        />
      </div>
    </Card>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm font-medium">{label}</div>
      <div className="text-sm text-muted-foreground">{value}</div>
    </div>
  );
}

function aggregateKeywordData(keywords: KeywordData[]) {
  if (!keywords.length) {
    return {
      searchVolume: 0,
      difficulty: 0,
      competition: 0,
      cpc: 0,
    };
  }

  const sum = keywords.reduce(
    (acc, keyword) => ({
      searchVolume: acc.searchVolume + keyword.searchVolume,
      difficulty: acc.difficulty + keyword.difficulty,
      competition: acc.competition + keyword.competition,
      cpc: acc.cpc + keyword.cpc,
    }),
    { searchVolume: 0, difficulty: 0, competition: 0, cpc: 0 }
  );

  return {
    searchVolume: sum.searchVolume / keywords.length,
    difficulty: sum.difficulty / keywords.length,
    competition: sum.competition / keywords.length,
    cpc: sum.cpc / keywords.length,
  };
}

function calculateScore(data: ReturnType<typeof aggregateKeywordData>): number {
  const volumeScore = Math.min(data.searchVolume / 1000, 40);
  const difficultyScore = (100 - data.difficulty) * 0.3;
  const competitionScore = (100 - data.competition) * 0.2;
  const cpcScore = Math.min(data.cpc * 10, 10);
  
  return volumeScore + difficultyScore + competitionScore + cpcScore;
}

function normalizeScore(score: number, min: number, max: number): number {
  return Math.max(0, Math.min(100, ((score - min) / (max - min)) * 100));
}

function getProgressColor(score: number): string {
  if (score < 33) return PROGRESS_COLORS.low;
  if (score < 66) return PROGRESS_COLORS.medium;
  return PROGRESS_COLORS.high;
}