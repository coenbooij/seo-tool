'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatNumber, formatDate } from '@/lib/utils';
import { type KeywordDetailsComponentProps } from './types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function KeywordDetailsPanel({
  keyword,
  onUpdate,
  onClose,
  historicalData = [],
  serpPositions = [],
}: KeywordDetailsComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(keyword.notes || '');

  const calculateTrend = () => {
    if (historicalData.length < 2) return 'stable';
    const lastTwo = historicalData.slice(-2);
    const diff = lastTwo[1].position - lastTwo[0].position;
    if (diff < 0) return 'improving';
    if (diff > 0) return 'declining';
    return 'stable';
  };

  const getPositionChange = () => {
    if (historicalData.length < 2) return 0;
    const first = historicalData[0].position;
    const last = historicalData[historicalData.length - 1].position;
    return first - last;
  };

  const trend = calculateTrend();
  const positionChange = getPositionChange();

  const metricCards = [
    {
      title: 'Search Volume',
      value: formatNumber(keyword.searchVolume),
      progress: (keyword.searchVolume / 10000) * 100,
    },
    {
      title: 'Difficulty',
      value: `${formatNumber(keyword.difficulty)}%`,
      progress: keyword.difficulty,
    },
    {
      title: 'Competition',
      value: `${formatNumber(keyword.competition)}%`,
      progress: keyword.competition,
    },
    {
      title: 'CPC',
      value: `$${formatNumber(keyword.cpc, 2)}`,
      progress: (keyword.cpc / 10) * 100,
    },
  ];

  const handleSave = () => {
    onUpdate({ notes });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Keyword Details</h3>
        <div className="flex gap-2">
          {!isEditing && (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">{keyword.keyword}</h4>
        <div className="grid grid-cols-2 gap-4">
          {metricCards.map(({ title, value, progress }) => (
            <Card key={title} className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{title}</span>
                <span className="font-medium">{value}</span>
              </div>
              <Progress value={progress} label={`${title} Score`} />
            </Card>
          ))}
        </div>

        <Card className="p-4 space-y-4">
          <h4 className="font-medium">Performance</h4>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Current Rank</div>
              <div className="font-medium">{keyword.currentRank || '-'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Position Change</div>
              <div className={`font-medium ${positionChange > 0 ? 'text-green-500' : positionChange < 0 ? 'text-red-500' : ''}`}>
                {positionChange !== 0 ? (positionChange > 0 ? `+${positionChange}` : positionChange) : '-'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Trend</div>
              <div className="font-medium capitalize">{trend}</div>
            </div>
          </div>

          {serpPositions.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Top Results</h5>
              <div className="space-y-2">
                {serpPositions.map(({ position, url, title }: { position: number; url: string; title: string }) => (
                  <div key={position} className="text-sm flex items-center gap-2">
                    <span className="text-muted-foreground">#{position}</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:underline"
                    >
                      {title}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-sm">Notes</h4>
            {isEditing && (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="default" onClick={handleSave}>
                  Save
                </Button>
              </div>
            )}
          </div>
          {isEditing ? (
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this keyword..."
              className="min-h-[100px]"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {keyword.notes || 'No notes added yet.'}
            </p>
          )}
        </Card>

        <div className="text-sm text-muted-foreground">
          Last checked: {formatDate(keyword.lastChecked)}
        </div>
      </div>
    </div>
  );
}