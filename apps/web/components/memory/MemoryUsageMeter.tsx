'use client';

import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MemoryUsageData {
  storyMemory: { count: number; limit: number; pct: number };
  facts: { count: number; limit: number; pct: number };
  overall: { count: number; limit: number; pct: number };
}

interface MemoryUsageMeterProps {
  data: MemoryUsageData;
  variant?: 'full' | 'compact';
  className?: string;
}

function saturationColor(pct: number) {
  if (pct >= 95) return 'bg-destructive';
  if (pct >= 80) return 'bg-amber-500';
  return 'bg-violet-500';
}

function saturationTextColor(pct: number) {
  if (pct >= 80) return 'text-amber-600 dark:text-amber-400 font-medium';
  return 'text-muted-foreground';
}

function MiniBar({ pct, 'data-testid': testId }: { pct: number; 'data-testid'?: string }) {
  return (
    <div
      className="h-1.5 w-16 rounded-full bg-muted overflow-hidden"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      data-testid={testId}
    >
      <div
        className={cn('h-full rounded-full transition-all', saturationColor(pct))}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

function FullBar({ pct, 'data-testid': testId }: { pct: number; 'data-testid'?: string }) {
  return (
    <div
      className="h-2 flex-1 rounded-full bg-muted overflow-hidden"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      data-testid={testId}
    >
      <div
        className={cn('h-full rounded-full transition-all', saturationColor(pct))}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

function CompactMeter({ data, className }: { data: MemoryUsageData; className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2 text-xs',
        className
      )}
      data-testid="memory-usage-meter-compact"
      aria-label="Memory usage summary"
    >
      <span className="flex items-center gap-1 text-muted-foreground">
        <Brain className="h-3.5 w-3.5 text-violet-500" aria-hidden="true" />
        <span className="font-semibold text-foreground">Memory</span>
      </span>

      <span
        className="flex items-center gap-1.5"
        data-testid="memory-meter-story-compact"
      >
        <span className="text-muted-foreground">Story</span>
        <MiniBar pct={data.storyMemory.pct} data-testid="memory-meter-story-bar" />
        <span className={saturationTextColor(data.storyMemory.pct)}>
          {data.storyMemory.pct}%
        </span>
      </span>

      <span
        className="flex items-center gap-1.5"
        data-testid="memory-meter-facts-compact"
      >
        <span className="text-muted-foreground">Facts</span>
        <MiniBar pct={data.facts.pct} data-testid="memory-meter-facts-bar" />
        <span className={saturationTextColor(data.facts.pct)}>
          {data.facts.count}/{data.facts.limit}
        </span>
      </span>

      <span
        className="flex items-center gap-1.5"
        data-testid="memory-meter-overall-compact"
      >
        <span className="text-muted-foreground">Usage</span>
        <MiniBar pct={data.overall.pct} data-testid="memory-meter-overall-bar" />
        <span className={saturationTextColor(data.overall.pct)}>
          {data.overall.pct}%
        </span>
      </span>
    </div>
  );
}

function FullMeter({ data, className }: { data: MemoryUsageData; className?: string }) {
  const rows = [
    {
      label: 'Story Memory',
      pct: data.storyMemory.pct,
      detail: `${data.storyMemory.count} / ${data.storyMemory.limit}`,
      barTestId: 'memory-meter-story-bar',
      rowTestId: 'memory-meter-story-row',
    },
    {
      label: 'Facts',
      pct: data.facts.pct,
      detail: `${data.facts.count} / ${data.facts.limit}`,
      barTestId: 'memory-meter-facts-bar',
      rowTestId: 'memory-meter-facts-row',
    },
    {
      label: 'Memory Usage',
      pct: data.overall.pct,
      detail: `${data.overall.pct}%`,
      barTestId: 'memory-meter-overall-bar',
      rowTestId: 'memory-meter-overall-row',
    },
  ] as const;

  return (
    <div
      className={cn(
        'rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-3',
        className
      )}
      data-testid="memory-usage-meter-full"
      aria-label="Memory usage meter"
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Brain className="h-4 w-4 text-violet-500" aria-hidden="true" />
        <span>Memory saturation</span>
      </div>

      {rows.map((row) => (
        <div
          key={row.label}
          className="space-y-1"
          data-testid={row.rowTestId}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">{row.label}</span>
            <span className={saturationTextColor(row.pct)}>{row.detail}</span>
          </div>
          <FullBar pct={row.pct} data-testid={row.barTestId} />
        </div>
      ))}
    </div>
  );
}

export function MemoryUsageMeter({ data, variant = 'full', className }: MemoryUsageMeterProps) {
  if (variant === 'compact') {
    return <CompactMeter data={data} className={className} />;
  }
  return <FullMeter data={data} className={className} />;
}
