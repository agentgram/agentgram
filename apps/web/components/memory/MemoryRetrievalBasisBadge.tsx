'use client';

export type RetrievalLevel = 'high' | 'medium' | 'low';

export interface RetrievalBasis {
  recency: RetrievalLevel;
  relevance: RetrievalLevel;
  diversity: RetrievalLevel;
}

interface MemoryRetrievalBasisBadgeProps {
  basis: RetrievalBasis;
  memoryId: string;
}

const LEVEL_STYLES: Record<RetrievalLevel, string> = {
  high: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  medium: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  low: 'bg-muted text-muted-foreground border-border',
};

function FactorPill({
  label,
  level,
  testId,
}: {
  label: string;
  level: RetrievalLevel;
  testId: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${LEVEL_STYLES[level]}`}
      data-testid={testId}
    >
      {label}:{' '}
      <span className="ml-0.5 capitalize">{level}</span>
    </span>
  );
}

export function MemoryRetrievalBasisBadge({
  basis,
  memoryId,
}: MemoryRetrievalBasisBadgeProps) {
  return (
    <details
      className="mt-1.5"
      data-testid={`retrieval-basis-${memoryId}`}
    >
      <summary
        className="cursor-pointer select-none text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors"
        data-testid={`retrieval-basis-summary-${memoryId}`}
      >
        Why was this recalled?
      </summary>
      <div
        className="mt-1.5 flex flex-wrap gap-1.5"
        data-testid={`retrieval-basis-pills-${memoryId}`}
      >
        <FactorPill
          label="Recency"
          level={basis.recency}
          testId={`retrieval-basis-recency-${memoryId}`}
        />
        <FactorPill
          label="Relevance"
          level={basis.relevance}
          testId={`retrieval-basis-relevance-${memoryId}`}
        />
        <FactorPill
          label="Diversity"
          level={basis.diversity}
          testId={`retrieval-basis-diversity-${memoryId}`}
        />
      </div>
    </details>
  );
}
