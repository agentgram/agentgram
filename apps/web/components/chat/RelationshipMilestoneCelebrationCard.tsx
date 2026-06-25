'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MilestoneType = '7d' | '30d' | '100msg' | '365d';

interface MilestoneConfig {
  emoji: string;
  headline: string;
  statLabel: string;
  bgClass: string;
  textClass: string;
  buttonClass: string;
  confettiClass: string;
}

function getMilestoneConfig(milestone: MilestoneType): MilestoneConfig {
  switch (milestone) {
    case '7d':
      return {
        emoji: '🎉',
        headline: '1 Week Together!',
        statLabel: '7 days',
        bgClass:
          'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 dark:from-amber-950/40 dark:to-orange-950/30 dark:border-amber-800/40',
        textClass: 'text-amber-800 dark:text-amber-300',
        buttonClass:
          'bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700',
        confettiClass: 'confetti-amber',
      };
    case '30d':
      return {
        emoji: '💫',
        headline: 'One Month Strong!',
        statLabel: '30 days',
        bgClass:
          'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/40 dark:to-indigo-950/30 dark:border-blue-800/40',
        textClass: 'text-blue-800 dark:text-blue-300',
        buttonClass:
          'bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700',
        confettiClass: 'confetti-blue',
      };
    case '100msg':
      return {
        emoji: '✨',
        headline: '100 Memories Made!',
        statLabel: '100 messages',
        bgClass:
          'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 dark:from-violet-950/40 dark:to-purple-950/30 dark:border-violet-800/40',
        textClass: 'text-violet-800 dark:text-violet-300',
        buttonClass:
          'bg-violet-500 hover:bg-violet-600 text-white dark:bg-violet-600 dark:hover:bg-violet-700',
        confettiClass: 'confetti-violet',
      };
    case '365d':
      return {
        emoji: '🌟',
        headline: 'One Year Anniversary!',
        statLabel: '365 days',
        bgClass:
          'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 dark:from-rose-950/40 dark:to-pink-950/30 dark:border-rose-800/40',
        textClass: 'text-rose-800 dark:text-rose-300',
        buttonClass:
          'bg-rose-500 hover:bg-rose-600 text-white dark:bg-rose-600 dark:hover:bg-rose-700',
        confettiClass: 'confetti-rose',
      };
  }
}

export interface RelationshipMilestoneCelebrationCardProps {
  milestone: MilestoneType;
  agentName: string;
  onShare: () => void;
  onDismiss: () => void;
  nextFeatureUnlock?: string;
  className?: string;
}

export function RelationshipMilestoneCelebrationCard({
  milestone,
  agentName,
  onShare,
  onDismiss,
  nextFeatureUnlock,
  className,
}: RelationshipMilestoneCelebrationCardProps) {
  const config = getMilestoneConfig(milestone);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5',
        config.bgClass,
        className
      )}
      data-testid="milestone-celebration-card"
      role="status"
      aria-live="polite"
    >
      {/* Confetti decoration */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-20',
          config.confettiClass
        )}
        aria-hidden="true"
        data-testid="milestone-confetti"
      />

      {/* Dismiss */}
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-3 top-3 shrink-0 rounded-md p-0.5 opacity-60 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        aria-label="Dismiss milestone card"
        data-testid="milestone-dismiss-button"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Content */}
      <div className="flex flex-col items-center gap-3 text-center pr-4">
        <span
          className="text-4xl leading-none select-none"
          aria-hidden="true"
          data-testid="milestone-emoji"
        >
          {config.emoji}
        </span>

        <div className="space-y-1">
          <h3
            className={cn('text-lg font-bold tracking-tight', config.textClass)}
            data-testid="milestone-headline"
          >
            {config.headline}
          </h3>
          <p
            className={cn('text-sm opacity-80', config.textClass)}
            data-testid="milestone-stat"
          >
            {config.statLabel} with{' '}
            <span className="font-semibold" data-testid="milestone-agent-name">
              {agentName}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onShare}
            className={cn(
              'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
              config.buttonClass
            )}
            data-testid="milestone-share-button"
          >
            Share this moment
          </button>

          {nextFeatureUnlock && (
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-current/30 bg-white/60 px-4 py-2 text-sm font-semibold transition hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:bg-white/10 dark:hover:bg-white/20"
              data-testid="milestone-unlock-cta"
            >
              Unlock {nextFeatureUnlock}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RelationshipMilestoneCelebrationCard;
