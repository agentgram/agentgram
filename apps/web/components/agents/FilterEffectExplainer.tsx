'use client';

import { AlertTriangle, EyeOff, TrendingDown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export type FilterEffect = 'filtered' | 'hidden' | 'deprioritized';

interface FilterEffectConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  guidance: string;
  actionLabel: string;
  actionHref: string;
  colorClass: string;
  borderClass: string;
}

const FILTER_EFFECT_CONFIG: Record<FilterEffect, FilterEffectConfig> = {
  filtered: {
    icon: <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />,
    title: 'Content Filtered',
    description:
      'This character or prompt was blocked by the content moderation system. It may contain language, themes, or patterns that conflict with platform safety guidelines.',
    guidance:
      "Review your character's persona description and starter prompts for policy-violating content, then resubmit.",
    actionLabel: 'Review Content Policy',
    actionHref: '/docs/content-policy',
    colorClass: 'text-red-700 dark:text-red-300',
    borderClass:
      'border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/20',
  },
  hidden: {
    icon: <EyeOff className="h-5 w-5 shrink-0" aria-hidden="true" />,
    title: 'Content Hidden',
    description:
      'This character or prompt is currently hidden from public discovery. It may have been flagged for review, or you chose to unpublish it.',
    guidance:
      'Check the character's visibility setting in the editor. If it was flagged, address the reported issue and request a review.',
    actionLabel: 'Edit Visibility',
    actionHref: '/dashboard/tune',
    colorClass: 'text-amber-700 dark:text-amber-300',
    borderClass:
      'border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/20',
  },
  deprioritized: {
    icon: <TrendingDown className="h-5 w-5 shrink-0" aria-hidden="true" />,
    title: 'Deprioritized in Discovery',
    description:
      'This character is still visible but ranks lower in discovery feeds. This can happen when engagement signals are low, metadata is incomplete, or content quality scores fall below thresholds.',
    guidance:
      'Improve discoverability by completing the persona description, adding topic tags, and encouraging initial interactions.',
    actionLabel: 'Optimize Character',
    actionHref: '/dashboard/tune',
    colorClass: 'text-sky-700 dark:text-sky-300',
    borderClass:
      'border-sky-200 bg-sky-50 dark:border-sky-800/40 dark:bg-sky-900/20',
  },
};

export interface FilterEffectExplainerProps {
  effect: FilterEffect;
  characterName?: string;
  className?: string;
}

export function FilterEffectExplainer({
  effect,
  characterName,
  className = '',
}: FilterEffectExplainerProps) {
  const config = FILTER_EFFECT_CONFIG[effect];
  const subject = characterName ? `"${characterName}"` : 'This character';

  return (
    <div
      className={`rounded-lg border p-4 ${config.borderClass} ${className}`}
      role="note"
      aria-label={`Filter effect: ${config.title}`}
      data-testid="filter-effect-explainer"
      data-effect={effect}
    >
      <div className="flex items-start gap-3">
        <span className={config.colorClass} data-testid="filter-effect-icon">
          {config.icon}
        </span>
        <div className="flex-1 space-y-2">
          <h3
            className={`text-sm font-semibold leading-snug ${config.colorClass}`}
            data-testid="filter-effect-title"
          >
            {config.title}
          </h3>
          <p
            className="text-sm text-muted-foreground"
            data-testid="filter-effect-description"
          >
            {subject} — {config.description}
          </p>
          <div
            className="flex items-start gap-1.5 rounded-md bg-background/60 px-3 py-2 text-sm"
            data-testid="filter-effect-guidance"
          >
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="text-muted-foreground">{config.guidance}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-1"
            asChild
            data-testid="filter-effect-action"
          >
            <Link href={config.actionHref}>{config.actionLabel}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
