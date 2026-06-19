'use client';

import { Clock, Crosshair, Shuffle } from 'lucide-react';

export type RetrievalMode = 'recency' | 'relevance' | 'diversity';

interface MemoryRetrievalModeSelectorProps {
  value: RetrievalMode;
  onChange: (mode: RetrievalMode) => void;
}

const MODES: Array<{
  mode: RetrievalMode;
  label: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    mode: 'recency',
    label: 'Recency',
    description: 'Prioritize recent memories',
    Icon: Clock,
  },
  {
    mode: 'relevance',
    label: 'Relevance',
    description: 'Prioritize contextually relevant memories',
    Icon: Crosshair,
  },
  {
    mode: 'diversity',
    label: 'Diversity',
    description: 'Balance across different memory types',
    Icon: Shuffle,
  },
];

export function MemoryRetrievalModeSelector({
  value,
  onChange,
}: MemoryRetrievalModeSelectorProps) {
  return (
    <div
      className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 p-1"
      role="group"
      aria-label="Memory retrieval mode"
      data-testid="memory-retrieval-mode-selector"
    >
      {MODES.map(({ mode, label, description, Icon }) => {
        const isSelected = value === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            aria-pressed={isSelected}
            title={description}
            data-testid={`retrieval-mode-${mode}`}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isSelected
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
