'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AnniversaryMilestone = 7 | 30 | 100;

export function getMilestone(dayCount: number): AnniversaryMilestone | null {
  if (dayCount >= 100) return 100;
  if (dayCount >= 30) return 30;
  if (dayCount >= 7) return 7;
  return null;
}

function getMilestoneConfig(milestone: AnniversaryMilestone) {
  switch (milestone) {
    case 7:
      return {
        emoji: '🎉',
        heading: '7 days together!',
        subtext: 'A whole week of conversations. You two are off to a great start!',
        bgClass: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/40',
        textClass: 'text-amber-800 dark:text-amber-300',
        badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
      };
    case 30:
      return {
        emoji: '💫',
        heading: '1 month milestone!',
        subtext: '30 days of shared moments. Your bond is growing stronger!',
        bgClass: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/40',
        textClass: 'text-blue-800 dark:text-blue-300',
        badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
      };
    case 100:
      return {
        emoji: '🌟',
        heading: '100 days!',
        subtext: "An incredible journey — you're a true connection.",
        bgClass: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800/40',
        textClass: 'text-purple-800 dark:text-purple-300',
        badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
      };
  }
}

export interface RelationshipAnniversaryCardProps {
  dayCount: number;
  agentName: string;
  onDismiss: () => void;
  className?: string;
}

export function RelationshipAnniversaryCard({
  dayCount,
  agentName,
  onDismiss,
  className,
}: RelationshipAnniversaryCardProps) {
  const milestone = getMilestone(dayCount);
  if (!milestone) return null;

  const config = getMilestoneConfig(milestone);

  return (
    <div
      className={cn(
        'relative flex items-start gap-4 rounded-xl border p-4',
        config.bgClass,
        className
      )}
      data-testid="relationship-anniversary-card"
      role="status"
      aria-live="polite"
    >
      <span
        className="text-3xl leading-none select-none"
        aria-hidden="true"
        data-testid="anniversary-emoji"
      >
        {config.emoji}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={cn('text-sm font-bold', config.textClass)}
            data-testid="anniversary-heading"
          >
            {config.heading}
          </h3>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
              config.badgeClass
            )}
            data-testid="anniversary-streak-badge"
          >
            {dayCount} days
          </span>
        </div>
        <p
          className={cn('mt-1 text-xs opacity-80', config.textClass)}
          data-testid="anniversary-subtext"
        >
          {agentName} – {config.subtext}
        </p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md p-0.5 opacity-60 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        aria-label="Dismiss anniversary card"
        data-testid="anniversary-dismiss-button"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

export default RelationshipAnniversaryCard;
