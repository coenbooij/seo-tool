'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps {
  value?: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
  label?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, label, indicatorClassName }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div className="space-y-1.5">
        {label && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{label}</span>
            <span>{percentage.toFixed(0)}%</span>
          </div>
        )}
        <div
          ref={ref}
          className={cn(
            'relative h-2 w-full overflow-hidden rounded-full bg-gray-200',
            className
          )}
        >
          <div
            className={cn(
              'h-full transition-all duration-300 ease-in-out',
              indicatorClassName || 'bg-primary'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };