'use client';

import { Clock, Leaf, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface MemoryFact {
  id: string;
  content: string;
  lastUsedAt: Date;
}

export interface MemoryFreshnessTimelineProps {
  facts?: MemoryFact[];
  isLoading?: boolean;
  onPruneStale?: () => void;
}

type StalenessLevel = 'recent' | 'weeks' | 'months';

function getDaysAgo(date: Date): number {
  const now = Date.now();
  return Math.floor((now - date.getTime()) / (1000 * 60 * 60 * 24));
}

function getStaleness(daysAgo: number): StalenessLevel {
  if (daysAgo < 14) return 'recent';
  if (daysAgo < 60) return 'weeks';
  return 'months';
}

function formatDaysAgo(daysAgo: number): string {
  if (daysAgo === 0) return 'today';
  if (daysAgo === 1) return '1 day ago';
  if (daysAgo < 14) return `${daysAgo} days ago`;
  const weeks = Math.floor(daysAgo / 7);
  if (daysAgo < 60) return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  const months = Math.floor(daysAgo / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

const stalenessConfig: Record<StalenessLevel, { label: string; dotClass: string; textClass: string }> = {
  recent: {
    label: 'Recent',
    dotClass: 'bg-emerald-500',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
  weeks: {
    label: 'Weeks old',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
  months: {
    label: 'Stale',
    dotClass: 'bg-red-500',
    textClass: 'text-red-600 dark:text-red-400',
  },
};

export function MemoryFreshnessTimeline({
  facts = [],
  isLoading = false,
  onPruneStale,
}: MemoryFreshnessTimelineProps) {
  if (isLoading) {
    return (
      <div
        data-testid="memory-freshness-timeline-loading"
        className="space-y-3"
        aria-busy="true"
        aria-label="Loading memory freshness timeline"
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded-xl border border-border/50 bg-muted/30 animate-pulse"
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  if (facts.length === 0) {
    return (
      <div
        data-testid="memory-freshness-timeline-empty"
        className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-muted/20 px-6 py-12 text-center space-y-3"
        role="status"
        aria-label="No memory facts found"
      >
        <Clock
          className="h-8 w-8 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-muted-foreground">
          No memory facts to display
        </p>
        <p className="text-xs text-muted-foreground">
          Facts will appear here once your agent starts recording memories.
        </p>
      </div>
    );
  }

  const sortedFacts = [...facts].sort(
    (a, b) => b.lastUsedAt.getTime() - a.lastUsedAt.getTime()
  );

  const staleCount = sortedFacts.filter(
    (f) => getStaleness(getDaysAgo(f.lastUsedAt)) === 'months'
  ).length;

  return (
    <div
      data-testid="memory-freshness-timeline"
      className="space-y-4"
      aria-label="Memory freshness timeline"
    >
      <div className="space-y-2" role="list" aria-label="Memory facts by freshness">
        {sortedFacts.map((fact) => {
          const daysAgo = getDaysAgo(fact.lastUsedAt);
          const staleness = getStaleness(daysAgo);
          const config = stalenessConfig[staleness];

          return (
            <div
              key={fact.id}
              data-testid={`memory-fact-${fact.id}`}
              className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-3"
              role="listitem"
              aria-label={`Memory fact: ${fact.content}`}
            >
              <span
                data-testid={`memory-fact-indicator-${fact.id}`}
                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${config.dotClass}`}
                aria-label={`Staleness: ${config.label}`}
              />
              <div className="flex-1 min-w-0 space-y-0.5">
                <p
                  className="text-sm text-foreground leading-snug"
                  data-testid={`memory-fact-content-${fact.id}`}
                >
                  {fact.content}
                </p>
                <p
                  className={`text-xs font-medium ${config.textClass}`}
                  data-testid={`memory-fact-timestamp-${fact.id}`}
                >
                  <Leaf className="inline h-3 w-3 mr-1 align-text-bottom" aria-hidden="true" />
                  Last used {formatDaysAgo(daysAgo)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {onPruneStale && (
        <div
          className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3"
          data-testid="memory-freshness-prune-section"
        >
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              {staleCount} stale {staleCount === 1 ? 'memory' : 'memories'} detected
            </p>
            <p className="text-xs text-muted-foreground">
              Remove facts unused for 2+ months to keep your agent&apos;s recall sharp.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5 shrink-0 ml-4"
            onClick={onPruneStale}
            data-testid="memory-freshness-prune-btn"
            aria-label={`Prune ${staleCount} stale ${staleCount === 1 ? 'memory' : 'memories'}`}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Prune stale memories
          </Button>
        </div>
      )}
    </div>
  );
}
