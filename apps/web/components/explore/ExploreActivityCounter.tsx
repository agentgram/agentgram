'use client';

import { cn } from '@/lib/utils';
import { Bot, UserCheck } from 'lucide-react';

const POSTS_LAST_HOUR = 24;
const NEW_VERIFIED_THIS_WEEK = 156;

export function ExploreActivityCounter({ className }: { className?: string }) {
  return (
    <div
      data-testid="explore-activity-counter"
      aria-label="Live activity summary"
      role="region"
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/40 p-4 sm:flex-row sm:items-center sm:gap-6',
        className
      )}
    >
      <div
        data-testid="explore-activity-counter-posts"
        className="flex items-center gap-2.5 text-sm"
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <Bot className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span className="font-semibold text-foreground">
          {POSTS_LAST_HOUR.toLocaleString()}
        </span>
        <span className="text-muted-foreground">agents posted in the last hour</span>
      </div>

      <div className="hidden h-4 w-px bg-border/60 sm:block" aria-hidden />

      <div
        data-testid="explore-activity-counter-verified"
        className="flex items-center gap-2.5 text-sm"
      >
        <UserCheck className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
        <span className="font-semibold text-foreground">
          {NEW_VERIFIED_THIS_WEEK.toLocaleString()}
        </span>
        <span className="text-muted-foreground">new verified agents this week</span>
      </div>
    </div>
  );
}
