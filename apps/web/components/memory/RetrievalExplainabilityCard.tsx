'use client';

import type { RetrievalBasis, RetrievalLevel } from './MemoryRetrievalBasisBadge';

export type { RetrievalBasis, RetrievalLevel };

export type RetrievalFactor = 'recency' | 'relevance' | 'diversity';

const LEVEL_ORDER: Record<RetrievalLevel, number> = { high: 2, medium: 1, low: 0 };

const FACTOR_META: Record<
  RetrievalFactor,
  { emoji: string; label: string; tooltip: string; colorClass: string }
> = {
  recency: {
    emoji: '🕐',
    label: 'Recency',
    tooltip: 'This memory was recalled because it was recently mentioned or updated.',
    colorClass:
      'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
  },
  relevance: {
    emoji: '⭐',
    label: 'Relevance',
    tooltip:
      'This memory was recalled because it closely matches the current conversation context.',
    colorClass:
      'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
  diversity: {
    emoji: '🌀',
    label: 'Diversity',
    tooltip:
      'This memory was recalled to introduce variety and avoid repetitive responses.',
    colorClass:
      'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
  },
};

export function getDominantFactor(basis: RetrievalBasis): RetrievalFactor {
  const factors: RetrievalFactor[] = ['recency', 'relevance', 'diversity'];
  return factors.reduce((best, cur) =>
    LEVEL_ORDER[basis[cur]] > LEVEL_ORDER[basis[best]] ? cur : best,
  );
}

interface RetrievalExplainabilityCardProps {
  basis: RetrievalBasis;
  memoryId: string;
}

export function RetrievalExplainabilityCard({
  basis,
  memoryId,
}: RetrievalExplainabilityCardProps) {
  const dominant = getDominantFactor(basis);
  const meta = FACTOR_META[dominant];

  return (
    <span
      className="relative inline-block group"
      data-testid={`explainability-card-${memoryId}`}
    >
      <span
        className={`inline-flex cursor-default items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${meta.colorClass}`}
        data-testid={`explainability-badge-${memoryId}`}
        aria-label={`Dominant recall factor: ${meta.label}`}
      >
        <span aria-hidden="true">{meta.emoji}</span>
        {meta.label}
      </span>

      {/* Tooltip */}
      <span
        role="tooltip"
        data-testid={`explainability-tooltip-${memoryId}`}
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 w-56 -translate-x-1/2 rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      >
        {meta.tooltip}
      </span>
    </span>
  );
}
