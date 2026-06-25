'use client';

import { Heart, Sparkles, Star } from 'lucide-react';

export interface MemoryRelationshipTimelineProps {
  firstFactDate?: string;
  relationshipStartDate?: string;
  milestoneCount?: number;
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function MemoryRelationshipTimeline({
  firstFactDate,
  relationshipStartDate,
  milestoneCount = 0,
}: MemoryRelationshipTimelineProps) {
  return (
    <section
      data-testid="memory-relationship-timeline"
      className="rounded-xl border border-border/50 bg-card/50 px-6 py-5 space-y-4"
      aria-label="Your shared history"
    >
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Your shared history</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Every memory your agent holds is part of the relationship you&apos;ve built together.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="list" aria-label="Relationship milestones">
        <div
          data-testid="memory-relationship-start"
          className="flex items-start gap-3 rounded-lg border border-border/40 bg-background/60 px-4 py-3"
          role="listitem"
        >
          <Heart
            className="mt-0.5 h-4 w-4 shrink-0 text-rose-500"
            aria-hidden="true"
          />
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Relationship started
            </p>
            <p
              className="text-sm font-semibold text-foreground"
              data-testid="memory-relationship-start-date"
            >
              {formatDate(relationshipStartDate)}
            </p>
          </div>
        </div>

        <div
          data-testid="memory-first-fact"
          className="flex items-start gap-3 rounded-lg border border-border/40 bg-background/60 px-4 py-3"
          role="listitem"
        >
          <Sparkles
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
            aria-hidden="true"
          />
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              First memory
            </p>
            <p
              className="text-sm font-semibold text-foreground"
              data-testid="memory-first-fact-date"
            >
              {formatDate(firstFactDate)}
            </p>
          </div>
        </div>

        <div
          data-testid="memory-milestones"
          className="flex items-start gap-3 rounded-lg border border-border/40 bg-background/60 px-4 py-3"
          role="listitem"
        >
          <Star
            className="mt-0.5 h-4 w-4 shrink-0 text-violet-500"
            aria-hidden="true"
          />
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Milestones
            </p>
            <p
              className="text-sm font-semibold text-foreground"
              data-testid="memory-milestone-count"
            >
              {milestoneCount} key {milestoneCount === 1 ? 'moment' : 'moments'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
