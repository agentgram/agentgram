'use client';

import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getConsistencyLabel } from '@/lib/relationship-longevity';

interface RelationshipLongevityIndicatorProps {
  activeDays: number;
  consistencyScore: number;
  className?: string;
}

function getActiveDaysColor(days: number): string {
  if (days >= 90) return 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300';
  if (days >= 30) return 'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300';
  return 'border-border/70 bg-muted/40 text-muted-foreground';
}

function getConsistencyBarColor(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-blue-500';
  return 'bg-muted-foreground';
}

export function RelationshipLongevityIndicator({
  activeDays,
  consistencyScore,
  className,
}: RelationshipLongevityIndicatorProps) {
  const clampedScore = Math.max(0, Math.min(100, consistencyScore));
  const consistencyLabel = getConsistencyLabel(clampedScore);

  return (
    <div
      className={cn('flex flex-wrap items-center gap-3', className)}
      data-testid="relationship-longevity-indicator"
    >
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
          getActiveDaysColor(activeDays)
        )}
        data-testid="longevity-active-days-badge"
      >
        <Flame className="h-3 w-3" aria-hidden="true" />
        활성 {activeDays}일
      </span>

      <div
        className="flex items-center gap-2"
        data-testid="longevity-consistency-row"
      >
        <span className="text-xs text-muted-foreground">
          일관성{' '}
          <span className="font-semibold text-foreground" data-testid="longevity-consistency-score">
            {clampedScore}%
          </span>
        </span>
        <div
          className="h-1.5 w-16 overflow-hidden rounded-full bg-border/50"
          aria-label={`일관성 점수 ${clampedScore}%, ${consistencyLabel}`}
          data-testid="longevity-consistency-bar-track"
        >
          <div
            className={cn('h-full rounded-full transition-all', getConsistencyBarColor(clampedScore))}
            style={{ width: `${clampedScore}%` }}
            data-testid="longevity-consistency-bar-fill"
          />
        </div>
        <span
          className="text-xs text-muted-foreground"
          data-testid="longevity-consistency-label"
        >
          {consistencyLabel}
        </span>
      </div>
    </div>
  );
}

export default RelationshipLongevityIndicator;
